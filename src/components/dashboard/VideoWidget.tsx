import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getConfig } from "@/lib/database";

export const VideoWidget = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        const url = await getConfig("videoUrl");
        setVideoUrl(url || "");
      } catch (error) {
        console.error("Error loading video URL:", error);
      }
    };

    loadVideoUrl();
    const timer = setInterval(loadVideoUrl, 60000); // Refresh every minute

    return () => clearInterval(timer);
  }, []);

  // Ensure video plays infinitely - restart if it stops
  useEffect(() => {
    if (!videoUrl || !isDirectVideo(videoUrl)) return;

    const video = videoRef.current;
    if (!video) return;

    const ensurePlay = () => {
      if (video.paused) {
        video.play().catch(console.error);
      }
    };

    const handleVideoEnd = () => {
      video.currentTime = 0;
      video.play().catch(console.error);
    };

    // Check every 5 seconds if video is playing
    const checkInterval = setInterval(ensurePlay, 5000);

    video.addEventListener("ended", handleVideoEnd);

    // Initial play attempt
    video.play().catch(console.error);

    return () => {
      clearInterval(checkInterval);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [videoUrl]);

  // Convert URLs to embed format with infinite loop parameters
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&controls=0`;
    }
    // For direct video URLs, will be handled by HTML5 video element
    return url;
  };

  // Check if it's a direct video file
  const isDirectVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i);
  };

  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full">
      <div className="mb-2">
        <h2 className="text-lg font-black text-cgt-gray flex items-center gap-2">
          <div className="w-6 h-6 bg-cgt-red rounded-lg flex items-center justify-center shadow-sm">
            <Play className="w-4 h-4 text-white" />
          </div>
          Vid��o institutionnelle CGT FTM
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {videoUrl ? (
        <div className="w-full h-[calc(100%-3.5rem)] rounded-lg overflow-hidden bg-gray-100 shadow-lg border border-gray-200">
          {isDirectVideo(videoUrl) ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              style={{ minHeight: "300px" }}
              onEnded={(e) => {
                // Force restart if loop fails
                e.currentTarget.currentTime = 0;
                e.currentTarget.play();
              }}
            />
          ) : (
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Vidéo institutionnelle CGT FTM"
              loading="lazy"
              style={{ minHeight: "300px" }}
            />
          )}
        </div>
      ) : (
        <div className="w-full h-[calc(100%-5rem)] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-lg">Aucune vidéo configurée</p>
            <p className="text-sm mt-2 text-gray-400">
              Ajoutez une vidéo dans le panel d'administration
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
