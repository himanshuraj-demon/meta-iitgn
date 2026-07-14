import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiService } from "@/api";
import NewsDetailClient from "./NewsDetailClient";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const newsItem = await apiService.getNewsBySlug(slug);
    if (newsItem) {
      return {
        title: `${newsItem.title} - Campus News | Meta IITGN`,
        description: newsItem.description || newsItem.content.substring(0, 160),
      };
    }
  } catch {
    // Ignore error
  }
  return {
    title: "News Article | Meta IITGN",
    description: "Read the latest news from IIT Gandhinagar.",
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  
  let newsItem = null;
  try {
    newsItem = await apiService.getNewsBySlug(slug);
  } catch (err) {
    console.error("Error fetching news item server-side:", err);
  }

  if (!newsItem) {
    return (
      <main className="flex-1 p-6 md:p-8 lg:p-12 bg-base-100 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md mx-auto text-center py-20 bg-base-200/40 px-8 rounded-3xl border border-base-200">
          <h1 className="text-2xl font-black text-base-content">News Article Not Found</h1>
          <p className="text-base-content/60 mt-2 text-sm font-medium">The news article you are looking for does not exist or has been deleted.</p>
          <Link
            href="/"
            className="btn btn-primary btn-sm mt-6 rounded-xl font-bold px-5"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return <NewsDetailClient initialNewsItem={newsItem} />;
}
