import { Card } from "@/components/ui/card";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getConfig } from "@/lib/database";

export const VideoWidget = () => {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Démarrer en muet pour autoplay
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
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

  // STRATÉGIE AUTOPLAY ROBUSTE POUR TV/KIOSQUE
  useEffect(() => {
    if (!videoUrl) return;

    // ÉTAPE 1: Forcer l'affichage après 1 seconde
    const forceDisplay = setTimeout(() => {
      setIsPlaying(true);
    }, 1000);

    if (!videoRef.current) {
      return () => clearTimeout(forceDisplay);
    }

    const video = videoRef.current;

    // ÉTAPE 2: Configuration pour autoplay garanti
    video.muted = true; // OBLIGATOIRE pour autoplay
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.volume = 1.0; // Volume prêt pour activation

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

          // Activer le son rapidement après démarrage
          setTimeout(() => {
            if (video && !video.paused) {
              video.muted = false;
              video.volume = 1.0; // Volume maximum
              setIsMuted(false);
            }
          }, 500); // Seulement 0.5 seconde de délai
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

    // Vérification périodique de l'état de lecture
    const checkInterval = setInterval(() => {
      if (video) {
        // Si la vidéo joue mais l'état dit le contraire, corriger
        if (!video.paused && !isPlaying) {
          setIsPlaying(true);
        }
        // Si la vidéo ne joue pas, essayer de la relancer
        if (video.paused && !isPlaying) {
          forceAutoplay();
        }
      }
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      video.removeEventListener("loadedmetadata", attemptPlay);
      video.removeEventListener("loadeddata", attemptPlay);
      video.removeEventListener("canplay", attemptPlay);
      video.removeEventListener("canplaythrough", attemptPlay);
    };

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

  // Convert URLs to embed format avec SON activé pour TV/kiosque
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&start=0`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&start=0`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&loop=1&controls=1&byline=0&title=0&portrait=0&autopause=0&keyboard=0&quality=auto`;
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
          {/* Mode TV: Indicateur de chargement - autoplay forcé */}
          {!isPlaying && videoUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-10">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm opacity-90">Chargement de la vidéo...</p>
              </div>
            </div>
          )}

          {isDirectVideo(videoUrl) ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={false}
              loop
              playsInline
              webkit-playsinline="true"
              controls={true}
              preload="auto"
              style={{ minHeight: "300px" }}
              volume={1.0}
              onLoadStart={() => {
                setIsPlaying(false);
              }}
              onLoadedData={() => {
                // Dès que les données sont chargées, activer le son
                if (videoRef.current) {
                  videoRef.current.muted = false;
                  videoRef.current.volume = 1.0;
                  setIsMuted(false);
                  videoRef.current.play().catch(() => {});
                }
              }}
              onCanPlay={() => {
                // Quand la vidéo peut être jouée
                if (videoRef.current && !isPlaying) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onPlay={() => {
                // La vidéo a commencé à jouer - ACTIVER LE SON
                setIsPlaying(true);
                if (videoRef.current) {
                  videoRef.current.muted = false;
                  videoRef.current.volume = 1.0;
                  setIsMuted(false);
                }
              }}
              onPlaying={() => {
                // La vidéo est en cours de lecture - FORCER LA VISIBILITÉ
                setIsPlaying(true);
              }}
              onTimeUpdate={() => {
                // Si le temps progresse, la vidéo joue
                if (videoRef.current && !videoRef.current.paused) {
                  setIsPlaying(true);
                }
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
