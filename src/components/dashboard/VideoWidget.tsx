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
    <Card className="p-4 bg-white professional-shadow border-0 h-full">
      <div className="mb-3">
        <h2 className="text-lg font-black text-cgt-gray flex items-center gap-2">
          <div className="w-6 h-6 bg-cgt-red rounded flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          Vidéo institutionnelle CGT
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {videoUrl ? (
        <div className="w-full h-[calc(100%-3rem)] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Vidéo institutionnelle CGT"
          />
        </div>
      ) : (
        <div className="w-full h-[calc(100%-3rem)] rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <Play className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium text-sm">Aucune vidéo configurée</p>
            <p className="text-xs mt-1">Configurez via l'admin</p>
          </div>
        </div>
      )}
    </Card>
  );
};
