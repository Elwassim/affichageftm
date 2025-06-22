import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardData } from "@/lib/storage";
import { MessageCircle } from "lucide-react";

export const SocialWidget = () => {
  const { socialPost } = getDashboardData();

  return (
    <Card className="p-8 bg-white professional-shadow border-0">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-cgt-gray flex items-center gap-3">
          <div className="w-10 h-10 bg-cgt-red rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          Actualités CGT
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-3"></div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-cgt-red/20">
              <AvatarImage src={socialPost.photo} alt={socialPost.name} />
              <AvatarFallback className="bg-cgt-red text-white font-bold text-lg">
                {socialPost.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-cgt-gray text-lg">
                  {socialPost.name}
                </h3>
                <div className="w-2 h-2 bg-cgt-red rounded-full"></div>
                <span className="text-sm text-gray-500 font-medium">
                  Délégué syndical
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed text-lg font-medium mb-4">
                {socialPost.text}
              </p>

              <div className="flex items-center justify-between">
                <span className="inline-block bg-gradient-to-r from-cgt-red to-cgt-red-dark text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                  {socialPost.hashtag}
                </span>
                <div className="text-xs text-gray-400 font-medium">
                  Message officiel CGT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
