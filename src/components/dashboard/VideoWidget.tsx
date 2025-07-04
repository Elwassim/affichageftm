import { Card } from "@/components/ui/card";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getConfig } from "@/lib/database";

export const VideoWidget = () => {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        const url = await getConfig("videoUrl");
        setVideoUrl(url || "https://www.youtube.com/embed/dQw4w9WgXcQ");
      } catch (error) {
        // Garder l'URL par défaut en cas d'erreur
      }
    };

    loadVideoUrl();
    const timer = setInterval(loadVideoUrl, 30000); // Refresh every 30 seconds

    // Écouter les changements de configuration depuis l'admin
    const handleConfigUpdate = (event: CustomEvent) => {
      if (event.detail.key === "videoUrl") {
        setVideoUrl(
          event.detail.value || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        );
      }
    };

    window.addEventListener(
      "cgt-config-updated",
      handleConfigUpdate as EventListener,
    );

    return () => {
      clearInterval(timer);
      window.removeEventListener(
        "cgt-config-updated",
        handleConfigUpdate as EventListener,
      );
    };
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
            // Essayer d'abord avec le son
            video.muted = false;
            video.volume = 0.7;
            video.setAttribute("autoplay", "");
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");

            await video.play();
            setIsPlaying(true);
            setIsMuted(false);
          } catch (error) {
            // Si ça échoue avec le son, essayer en muet puis activer le son
            try {
              video.muted = true;
              video.volume = 0;
              await video.play();
              setIsPlaying(true);

              // Activer le son après 2 secondes une fois que la vidéo joue
              setTimeout(() => {
                if (video && !video.paused) {
                  video.muted = false;
                  video.volume = 0.7;
                  setIsMuted(false);
                }
              }, 2000);
            } catch (retryError) {
              // Dernier recours: rester en muet
              setTimeout(async () => {
                try {
                  video.load();
                  video.muted = true;
                  await video.play();
                  setIsPlaying(true);
                  setIsMuted(true);
                } catch (finalError) {
                  //
                }
              }, 500);
            }
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

  // Listen for any user interaction to unlock autoplay and sound
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (videoRef.current) {
        try {
          // Si la vidéo ne joue pas encore, la lancer avec son
          if (!isPlaying) {
            videoRef.current.muted = false;
            videoRef.current.volume = 0.7;
            await videoRef.current.play();
            setIsPlaying(true);
            setIsMuted(false);
          }
          // Si elle joue mais en muet, activer le son
          else if (videoRef.current.muted) {
            videoRef.current.muted = false;
            videoRef.current.volume = 0.7;
            setIsMuted(false);
          }
        } catch (error) {
          //
        }
      }
    };

    // Listen for various user interactions
    const events = ["click", "touchstart", "keydown", "mousemove", "scroll"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        once: true,
        passive: true,
      });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [videoUrl, isPlaying]);

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

  // Fonction pour basculer le son
  const toggleMute = () => {
    if (isDirectVideo(videoUrl) && videoRef.current) {
      const video = videoRef.current;
      video.muted = !video.muted;
      setIsMuted(video.muted);
    } else if (iframeRef.current) {
      // Pour les vidéos iframe, on ne peut pas contrôler directement le son
      // Mais on peut recharger avec/sans mute dans l'URL
      const newUrl = isMuted
        ? getEmbedUrl(videoUrl).replace("mute=1", "mute=0")
        : getEmbedUrl(videoUrl).replace("mute=0", "mute=1");

      if (iframeRef.current.src !== newUrl) {
        iframeRef.current.src = newUrl;
      }
      setIsMuted(!isMuted);
    }
  };

  // Convert URLs to embed format with enhanced autoplay parameters
  const getEmbedUrl = (url: string) => {
    const muteParam = isMuted ? "1" : "0";

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=${muteParam}&loop=1&controls=1&byline=0&title=0&portrait=0`;
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-cgt-gray flex items-center gap-2">
            <div className="w-6 h-6 bg-cgt-red rounded-lg flex items-center justify-center shadow-sm">
              <Play className="w-4 h-4 text-white" />
            </div>
            Vidéo institutionnelle CGT FTM
          </h2>
          {videoUrl && (
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-600" />
              ) : (
                <Volume2 className="w-4 h-4 text-cgt-red" />
              )}
            </button>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {videoUrl ? (
        <div className="w-full h-[calc(100%-3.5rem)] rounded-lg overflow-hidden bg-gray-100 shadow-lg border border-gray-200">
          {isDirectVideo(videoUrl) ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              webkit-playsinline=""
              controls={true}
              preload="auto"
              style={{ minHeight: "300px" }}
              onLoadedData={() => {
                // Force play when video data is loaded
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(console.error);
                }
              }}
              onCanPlay={() => {
                // Another attempt when video can play
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(console.error);
                }
              }}
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
