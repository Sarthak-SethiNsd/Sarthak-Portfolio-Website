import { ExternalLink, Play } from "lucide-react";
import type { DemoVideo } from "@/lib/types";

function embedUrl(src: string): string | null {
  try {
    const url = new URL(src);
    if (url.hostname.includes("youtube.com")) return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
    if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).at(-1)}`;
  } catch {
    return null;
  }
  return null;
}

export function VideoPlayer({ video }: { video?: DemoVideo }) {
  if (!video?.src) return <div className="empty-state"><Play aria-hidden="true" /><p>No demo video available yet.</p></div>;

  if (video.type === "local" || /\.mp4($|\?)/i.test(video.src)) {
    return <video className="video-frame" controls playsInline preload="metadata" src={video.src}>Your browser does not support MP4 video.</video>;
  }

  const embed = embedUrl(video.src);
  if (embed) return <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="video-frame" src={embed} title={video.title} />;

  return <a className="empty-state external-video" href={video.src} rel="noreferrer" target="_blank"><ExternalLink aria-hidden="true" /><p>Open the latest demo video</p></a>;
}
