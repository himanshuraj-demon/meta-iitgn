import React from "react";

interface InterviewVideoPlayerProps {
  videoUrl?: string | null;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // YouTube matchers
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo matchers
  const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export default function InterviewVideoPlayer({ videoUrl }: InterviewVideoPlayerProps) {
  if (!videoUrl || !videoUrl.trim()) return null;

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-base-200 shadow-sm my-3 aspect-video">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Interview Video"
          className="h-full w-full border-0 rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={videoUrl}
          controls
          className="h-full w-full object-contain rounded-2xl"
        >
          Your browser does not support playing this video.
        </video>
      )}
    </div>
  );
}
