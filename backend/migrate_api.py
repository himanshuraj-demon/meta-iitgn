import os
import json
import subprocess
import urllib.request

def main():
    # 1. Extract articles using Node
    js_extractor = """
const fs = require('fs');
let content = fs.readFileSync('../frontend/src/lib/placeholder-articles.ts', 'utf8');
content = content.replace(/export interface Article \\{[\\s\\S]*?\\}/g, '');
content = content.replace(/export interface CategoryInfo \\{[\\s\\S]*?\\}/g, '');
content = content.replace(/: Record<string, CategoryInfo>/g, '');
content = content.replace(/export const/g, 'const');
content += '\\nmodule.exports = { CATEGORIES_DATA };';
fs.writeFileSync('./extract_temp.js', content, 'utf8');
const { CATEGORIES_DATA } = require('./extract_temp.js');
console.log(JSON.stringify(CATEGORIES_DATA));
fs.unlinkSync('./extract_temp.js');
"""
    with open('extract.js', 'w', encoding='utf-8') as f:
        f.write(js_extractor)
        
    result = subprocess.run(['node', 'extract.js'], capture_output=True, text=True)
    if result.returncode != 0:
        print("Error extracting articles:", result.stderr)
        if os.path.exists('extract.js'):
            os.remove('extract.js')
        return
        
    categories = json.loads(result.stdout)
    if os.path.exists('extract.js'):
        os.remove('extract.js')
        
    # 2. Iterate and call API
    api_url = "http://127.0.0.1:3001"
    
    category_map = {
        "departments": "Academics",
        "faculty": "Academics",
        "courses": "Academics",
        "research": "Research",
        "hostels": "Campus",
        "facilities": "Campus",
        "clubs": "Clubs",
        "fests": "Fests",
        "calendar": "Policies",
        "policies": "Policies",
        "placements": "Policies"
    }
    
    for cat_key, cat_info in categories.items():
        print(f"Processing category: {cat_info['name']}")
        for article in cat_info['articles']:
            title = article['title']
            content = article['content']
            slug = article['slug']
            
            print(f"  Submitting draft for '{title}'...")
            # POST /drafts
            draft_payload = {
                "page_id": None,
                "title": title,
                "content": content,
                "metadata": {
                    "slug": slug,
                    "category": category_map.get(cat_key, "Campus")
                },
                "editor_id": 0,
                "base_version": None
            }
            
            try:
                req = urllib.request.Request(
                    f"{api_url}/drafts",
                    data=json.dumps(draft_payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req) as res:
                    draft_res = json.loads(res.read().decode('utf-8'))
                
                pending_id = draft_res['pending_id']
                print(f"    Draft submitted (pending_id: {pending_id}). Approving...")
                
                # POST /drafts/{pending_id}/review
                review_payload = {
                    "reviewer_id": 0,
                    "action": "approve"
                }
                req_review = urllib.request.Request(
                    f"{api_url}/drafts/{pending_id}/review",
                    data=json.dumps(review_payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req_review) as res_review:
                    review_res = json.loads(res_review.read().decode('utf-8'))
                print(f"    Successfully approved and published '{title}'!")
                
            except Exception as e:
                print(f"    Failed to process '{title}': {e}")


if __name__ == '__main__':
    main()
