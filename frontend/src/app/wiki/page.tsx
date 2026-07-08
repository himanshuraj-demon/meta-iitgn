import WikiClient from "../wiki-client";

export const dynamic = "force-dynamic";

export default async function WikiPage() {
  let pageContent = "Failed to load content.";
  
  try {
    // Fetch from the backend with a timeout/graceful error handling
    const response = await fetch("https://meta-iitgn-vercel.onrender.com/page/1");

    if (response.ok) {
      const data = await response.json();
      pageContent = data.content;
    }
  } catch (error) {
    console.error("Failed to fetch initial page content during build/render:", error);
  }

  // Pass the fetched markdown to the interactive client component
  return <WikiClient initialMarkdown={pageContent} />;
}
