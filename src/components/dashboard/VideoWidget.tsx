import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getConfig } from "@/lib/database";

export const VideoWidget = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Force video autoplay with multiple attempts
  useEffect(() => {
    if (!videoUrl) return;

    const forcePlay = async () => {
      if (isDirectVideo(videoUrl) && videoRef.current) {
        const video = videoRef.current;

        // Multiple aggressive attempts to start video
        const playAttempts = async () => {
          try {
            video.muted = true;
            video.volume = 0;
            video.setAttribute("autoplay", "");
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");

            await video.play();
            setIsPlaying(true);
            console.log("✅ Video autoplay succeeded");
          } catch (error) {
            console.log("🔄 Autoplay attempt failed, retrying...");

            // Retry after a short delay
            setTimeout(async () => {
              try {
                video.muted = true;
                video.currentTime = 0;
                await video.play();
                setIsPlaying(true);
              } catch (retryError) {
                console.log("🔄 Retry failed, trying again...");

                // Final attempt with load() first
                setTimeout(async () => {
                  try {
                    video.load();
                    video.muted = true;
                    await video.play();
                    setIsPlaying(true);
                  } catch (finalError) {
                    console.log("❌ All autoplay attempts failed");
                  }
                }, 500);
              }
            }, 500);
          }
        };

        // Start attempts immediately and with delays
        playAttempts();
        setTimeout(playAttempts, 100);
        setTimeout(playAttempts, 500);
        setTimeout(playAttempts, 1000);
        setTimeout(playAttempts, 2000);
      } else {
        // For embedded videos, assume they will autoplay
        setIsPlaying(true);
      }
    };

    // Try immediately and with delays
    forcePlay();
    setTimeout(forcePlay, 100);
    setTimeout(forcePlay, 1000);

    return () => {};
  }, [videoUrl]);

  // Ensure video plays infinitely - restart if it stops
  useEffect(() => {
    if (!videoUrl || !isDirectVideo(videoUrl) || !isPlaying) return;

    const video = videoRef.current;
    if (!video) return;

    const ensurePlay = () => {
      if (video.paused && isPlaying) {
        video.play().catch(console.error);
      }
    };

    const handleVideoEnd = () => {
      video.currentTime = 0;
      video.play().catch(console.error);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      // Auto-restart if paused unexpectedly
      setTimeout(() => {
        if (video.paused) {
          video.play().catch(console.error);
        }
      }, 1000);
    };

    // Check every 3 seconds if video is playing
    const checkInterval = setInterval(ensurePlay, 3000);

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      clearInterval(checkInterval);
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoUrl, isPlaying]);

  // Convert URLs to embed format with enhanced autoplay parameters
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&start=0&end=0`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&start=0&end=0`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&controls=0&byline=0&title=0&portrait=0`;
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
          Vidéo institutionnelle CGT FTM
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {videoUrl ? (
        <div className="w-full h-[calc(100%-3.5rem)] rounded-lg overflow-hidden bg-gray-100 shadow-lg border border-gray-200 relative">
          {isDirectVideo(videoUrl) ? (
            <video
              ref={videoRef}
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
              ref={iframeRef}
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Vidéo institutionnelle CGT FTM"
              loading="lazy"
              style={{ minHeight: "300px" }}
            />
          )}

          {/* Play Button Overlay */}
          {showPlayButton && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <button
                onClick={handleVideoStart}
                className="bg-cgt-red hover:bg-cgt-red-dark text-white rounded-full p-6 shadow-2xl transition-all duration-300 hover:scale-110 group"
              >
                <Play className="w-12 h-12 ml-1 group-hover:scale-110 transition-transform" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-sm font-medium bg-black bg-opacity-50 rounded px-3 py-1">
                  Cliquez pour démarrer la vidéo en boucle
                </p>
              </div>
            </div>
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
