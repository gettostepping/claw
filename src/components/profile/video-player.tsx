"use client";

import React from 'react';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
}

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <div className="w-full">
      <video
        src={video.url}
        controls
        autoPlay={false}
        loop
        muted={false}
        className="w-full h-auto rounded-lg"
        poster={video.thumbnailUrl || undefined}
      >
        Your browser does not support the video tag.
      </video>
      <div className="mt-2">
        <h3 className="font-medium truncate opacity-100">{video.title}</h3>
        {video.description && (
          <p className="opacity-50 text-sm mt-1 line-clamp-2">{video.description}</p>
        )}
      </div>
    </div>
  );
}