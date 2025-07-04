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

  // Autoplay agressif pour environnement TV/kiosque
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Configuration agressive pour TV/kiosque
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");
    video.setAttribute("muted", "true");
    video.setAttribute("autoplay", "true");
    video.controls = false;
    video.volume = 0;

    // Tentatives multiples et répétées
    const forceAutoplay = async () => {
      try {
        // Réinitialiser la vidéo
        video.load();
        video.muted = true;
        video.currentTime = 0;

        // Essayer de jouer
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setIsMuted(true);

          // Essayer d'activer le son après 3 secondes pour TV
          setTimeout(() => {
            if (video && !video.paused) {
              video.muted = false;
              video.volume = 0.8;
              setIsMuted(false);
            }
          }, 3000);
        }
      } catch (error) {
        // Continuer les tentatives même en cas d'échec
        setIsPlaying(false);
      }
    };

    // Multiples tentatives avec délais
    const attemptPlay = () => {
      forceAutoplay();
      setTimeout(forceAutoplay, 100);
      setTimeout(forceAutoplay, 500);
      setTimeout(forceAutoplay, 1000);
      setTimeout(forceAutoplay, 2000);
      setTimeout(forceAutoplay, 5000);
    };

    // Déclencher immédiatement et sur différents événements
    attemptPlay();

    video.addEventListener("loadedmetadata", attemptPlay);
    video.addEventListener("loadeddata", attemptPlay);
    video.addEventListener("canplay", attemptPlay);
    video.addEventListener("canplaythrough", attemptPlay);

    // Tentatives répétées toutes les 10 secondes si pas encore en lecture
    const retryInterval = setInterval(() => {
      if (!isPlaying && video.paused) {
        forceAutoplay();
      }
    }, 10000);

    return () => {
      clearInterval(retryInterval);
      video.removeEventListener("loadedmetadata", attemptPlay);
      video.removeEventListener("loadeddata", attemptPlay);
      video.removeEventListener("canplay", attemptPlay);
      video.removeEventListener("canplaythrough", attemptPlay);
    };
  }, [videoUrl, isPlaying]);

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
        <div className="w-full h-[calc(100%-3.5rem)] rounded-lg overflow-hidden bg-gray-100 shadow-lg border border-gray-200 relative">
          {/* Bouton Play si l'autoplay échoue */}
          {!isPlaying && videoUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-10">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current
                      .play()
                      .then(() => {
                        setIsPlaying(true);
                        setIsMuted(true);
                        // Activer le son après 1 seconde
                        setTimeout(() => {
                          if (videoRef.current && !videoRef.current.paused) {
                            videoRef.current.muted = false;
                            videoRef.current.volume = 0.7;
                            setIsMuted(false);
                          }
                        }, 1000);
                      })
                      .catch(() => {
                        // Échec de lecture
                      });
                  }
                }}
                className="bg-cgt-red hover:bg-cgt-red-dark text-white rounded-full p-6 transition-all transform hover:scale-110 shadow-lg"
              >
                <Play className="w-12 h-12" />
              </button>
              <p className="text-white text-center mt-4 text-sm opacity-90">
                Cliquez pour lancer la vidéo
              </p>
            </div>
          )}

          {isDirectVideo(videoUrl) ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              webkit-playsinline="true"
              controls={false}
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              style={{ minHeight: "300px" }}
              data-setup='{"techOrder": ["html5"], "fluid": true}'
              onLoadStart={() => {
                setIsPlaying(false);
              }}
              onCanPlay={() => {
                // Tentative d'autoplay quand la vidéo est prête
                if (videoRef.current && !isPlaying) {
                  videoRef.current
                    .play()
                    .then(() => {
                      setIsPlaying(true);
                    })
                    .catch(() => {
                      setIsPlaying(false);
                    });
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
              }}
              onPause={() => {
                setIsPlaying(false);
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
