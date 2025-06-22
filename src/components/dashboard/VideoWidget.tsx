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
    <Card className="p-8 bg-white professional-shadow border-0">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-cgt-gray flex items-center gap-3">
          <div className="w-10 h-10 bg-cgt-red rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          Vidéo institutionnelle CGT
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-3"></div>
      </div>

      {videoUrl ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 shadow-lg">
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Vidéo institutionnelle CGT"
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-medium text-lg">Aucune vidéo configurée</p>
            <p className="text-sm mt-1">
              Configurez une vidéo dans l'administration
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
