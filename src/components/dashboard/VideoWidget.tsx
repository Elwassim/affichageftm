import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Play } from "lucide-react";

export const VideoWidget = () => {
  const { videoUrl } = getDashboardData();

  // Convert YouTube URLs to embed format if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    return url;
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Play className="w-6 h-6" />
        Vidéo de présentation
      </h2>

      {videoUrl ? (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Vidéo de présentation"
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune vidéo configurée</p>
          </div>
        </div>
      )}
    </Card>
  );
};
