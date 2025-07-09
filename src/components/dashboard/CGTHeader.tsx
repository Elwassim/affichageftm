import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { CGTLogo } from "./CGTLogo";
import { isAuthenticated } from "@/lib/auth";

export const CGTHeader = () => {
  return (
    <div className="relative bg-gradient-to-r from-cgt-red via-cgt-red to-cgt-red-dark">
      <div className="relative p-2 py-3">
        <div className="w-full flex justify-center items-center">
          <div className="flex items-center space-x-4">
            {/* CGT Official Logo */}
            <div className="flex items-center space-x-3">
              <CGTLogo className="w-20 h-20" />
              <div className="text-white">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-shadow">
                  <p> FÉDÉRATION DES TRAVAILLEURS DE LA MÉTALLURGIE</p>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
