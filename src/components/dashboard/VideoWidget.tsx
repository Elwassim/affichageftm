import { Card } from "@/components/ui/card";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getConfig } from "@/lib/database";

export const VideoWidget = () => {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/embed/YQHsXMglC9A",
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundActivator, setShowSoundActivator] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Charger l'URL de la vidéo depuis la configuration
  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        const url = await getConfig("videoUrl");
        setVideoUrl(url || "https://www.youtube.com/embed/YQHsXMglC9A");
      } catch (error) {
        // Garder l'URL par défaut
      }
    };

    loadVideoUrl();
    const timer = setInterval(loadVideoUrl, 30000);

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

  // AUTOPLAY ULTRA-AGRESSIF pour environnement TV/kiosque
  useEffect(() => {
    if (!videoUrl) return;

    const forceAutoplay = () => {
      if (videoRef.current) {
        const video = videoRef.current;

        // Configuration MAXIMALE pour autoplay
        video.muted = true; // OBLIGATOIRE
        video.autoplay = true;
        video.loop = true;
        video.volume = 1.0;
        video.defaultMuted = true;
        video.setAttribute("autoplay", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        // FORCER le démarrage immédiatement
        const tryPlay = async () => {
          try {
            await video.play();
            setIsPlaying(true);
            setIsMuted(true);

            // Activer le son automatiquement après 1 seconde
            setTimeout(() => {
              video.muted = false;
              setIsMuted(false);
            }, 1000);
          } catch (error) {
            // Continuer d'essayer même en cas d'échec
            setTimeout(tryPlay, 1000);
          }
        };

        // Tentatives multiples et répétées
        tryPlay();
        setTimeout(tryPlay, 100);
        setTimeout(tryPlay, 500);
        setTimeout(tryPlay, 1000);

        // Déclencheurs sur événements
        video.addEventListener("loadeddata", tryPlay);
        video.addEventListener("canplay", tryPlay);

        return () => {
          video.removeEventListener("loadeddata", tryPlay);
          video.removeEventListener("canplay", tryPlay);
        };
      } else {
        // Pour les iframe - considérer comme démarrées
        setIsPlaying(true);
        setIsMuted(false);
      }
    };

    const cleanup = forceAutoplay();
    return cleanup;
  }, [videoUrl]);

  // Fonction pour activer le son
  const activateSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
    }
    setIsMuted(false);
    setShowSoundActivator(false);
  };

  // Basculer le son
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        activateSound();
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  // URLs d'embed avec AUTOPLAY FORCÉ pour TV/kiosque
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&start=0&cc_load_policy=0`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&start=0&cc_load_policy=0`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&controls=0&byline=0&title=0&portrait=0&autopause=0`;
    }
    return url;
  };

  // Détecter si c'est une vidéo directe
  const isDirectVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i);
  };

  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-cgt-gray flex items-center gap-2">
            <div className="w-7 h-7 bg-cgt-red rounded-lg flex items-center justify-center shadow-sm">
              <Play className="w-5 h-5 text-white" />
            </div>
            <p>Vidéo FTM CGT</p>
          </h2>
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
        </div>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {videoUrl ? (
        <div className="w-full h-[calc(100%-3.5rem)] rounded-lg overflow-hidden bg-gray-100 shadow-lg border border-gray-200 relative">
          {/* Activateur de son intelligent */}
          {showSoundActivator && (
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={activateSound}
                className="bg-cgt-red hover:bg-cgt-red-dark text-white px-4 py-2 rounded-lg shadow-lg transition-all animate-pulse"
              >
                🔊 Activer le son
              </button>
            </div>
          )}

          {isDirectVideo(videoUrl) ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              autoPlay={true}
              muted={true}
              loop={true}
              playsInline={true}
              controls={true}
              preload="auto"
              defaultMuted={true}
              style={{ minHeight: "300px" }}
              onLoadedData={() => {
                // Force play dès que les données sont chargées
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onCanPlay={() => {
                // Force play quand la vidéo peut être jouée
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
                // Activer le son après 500ms
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                  }
                }, 500);
              }}
              onPause={() => setIsPlaying(false)}
              onEnded={(e) => {
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
