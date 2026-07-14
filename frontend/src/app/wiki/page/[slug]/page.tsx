"use client";

import { useEffect, useState, use } from "react";
import WikiClient from "../../../wiki-client";
import Link from "next/link";
import { apiService } from "@/api";
import { db } from "@/lib/db";
import WikiSkeleton from "@/components/article/WikiSkeleton";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface WikiArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
  searchParams: Promise<{
    title?: string;
  }>;
}

export default function WikiArticlePage({ params, searchParams }: WikiArticlePageProps) {
  const { slug } = use(params);
  const { title } = use(searchParams);

  const { activeTier } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [dbPageId, setDbPageId] = useState<number | undefined>(undefined);
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [initialMetadata, setInitialMetadata] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug === "new") {
      const displayTitle = title ? title : "Untitled Article";
      const template = `---
image: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600
imageAlt: New Article
rows:
  - label: Type
    value: 
    type: text
  - label: Status
    value: Draft
    type: text
---

# ${displayTitle}

Write your content here...`;
      setPageContent(template);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      // 1. Try to load from IndexedDB cache
      try {
        const cached = await db.cachedpages.get(slug);
        if (cached) {
          setPageContent(cached.content);
          setDbPageId(cached.page_id);
          setVersion(cached.version);
          setInitialMetadata(cached.metadata || {});
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to read page from cache:", err);
      }

      // 2. Fetch fresh data from API
      try {
        const data = await apiService.getPage(slug);
        setPageContent(data.content);
        setDbPageId(data.page_id);
        setVersion(data.version);
        setInitialMetadata(data.metadata || {});
        setNotFound(false);

        // Save to cache
        try {
          await db.cachedpages.put({
            slug,
            content: data.content,
            page_id: data.page_id,
            version: data.version,
            metadata: data.metadata || {},
          });
        } catch (cacheErr) {
          console.error("Failed to write page to cache:", cacheErr);
        }
      } catch (err: any) {
        console.error("Failed to fetch fresh page data:", err);
        // If not in cache and API fails, show not found
        if (loading || !pageContent) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, title]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-base-200/30 font-sans">
        <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentTier={activeTier} />
          <main className="flex-1 p-6 md:p-8 lg:p-12 bg-base-100 flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center py-20">
              <h1 className="text-3xl font-bold text-base-content">
                Article Not Found
              </h1>
              <p className="text-base-content/50 mt-2">
                The requested article could not be found.
              </p>
              <Link
                href={`/wiki/campus/new?title=${encodeURIComponent(slug.replace(/-/g, ' '))}`}
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-content rounded-lg text-sm font-semibold transition-colors"
              >
                Create this article
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-200/30 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentTier={activeTier} />
        {loading && !pageContent ? (
          <WikiSkeleton />
        ) : (
          <WikiClient
            initialMarkdown={pageContent || ""}
            dbPageId={dbPageId}
            version={version}
            initialMetadata={initialMetadata}
          />
        )}
      </div>
    </div>
  );
}