import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardData } from "@/lib/storage";
import { MessageCircle } from "lucide-react";

export const SocialWidget = () => {
  const { socialPost } = getDashboardData();

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Message syndical
      </h2>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={socialPost.photo} alt={socialPost.name} />
            <AvatarFallback>
              {socialPost.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{socialPost.name}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">
              {socialPost.text}
            </p>
            <div className="mt-3">
              <span className="inline-block bg-union-red text-white px-3 py-1 rounded-full text-sm font-medium">
                {socialPost.hashtag}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
