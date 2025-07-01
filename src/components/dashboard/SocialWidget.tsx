import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardData } from "@/lib/storage";
import { MessageCircle } from "lucide-react";

export const SocialWidget = () => {
  const { socialPost } = getDashboardData();

  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full">
      <div className="mb-2">
        <h2 className="text-base font-black text-cgt-gray flex items-center gap-2">
          <div className="w-5 h-5 bg-cgt-red rounded flex items-center justify-center">
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
          Actualités
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
        <div className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8 ring-2 ring-cgt-red/20 flex-shrink-0">
              <AvatarImage src={socialPost.photo} alt={socialPost.name} />
              <AvatarFallback className="bg-cgt-red text-white font-bold text-sm">
                {socialPost.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-bold text-cgt-gray text-xs truncate">
                  {socialPost.name}
                </h3>
                <div className="w-1 h-1 bg-cgt-red rounded-full flex-shrink-0"></div>
                <span className="text-xs text-gray-500 font-medium">
                  Délégué
                </span>
              </div>

              <p
                className="text-gray-700 leading-relaxed text-xs font-medium mb-2 overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {socialPost.text}
              </p>

              <div className="flex items-center justify-between">
                <span className="inline-block bg-gradient-to-r from-cgt-red to-cgt-red-dark text-white px-2 py-1 rounded-full text-xs font-bold">
                  {socialPost.hashtag}
                </span>
                <div className="text-xs text-gray-400 font-medium">CGT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
