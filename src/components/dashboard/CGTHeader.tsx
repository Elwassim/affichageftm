import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { CGTLogo } from "./CGTLogo";
import { isAuthenticated } from "@/lib/auth";

export const CGTHeader = () => {
  return (
    <div className="relative bg-gradient-to-r from-cgt-red via-cgt-red to-cgt-red-dark">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 60 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* CGT Official Logo */}
            <div className="flex items-center space-x-3">
              <CGTLogo className="w-12 h-12" />
              <div className="text-white">
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-shadow">
                  CGT FTM - FÉDÉRATION DES TRAVAILLEURS DE LA MÉTALLURGIE
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Link to={isAuthenticated() ? "/admin" : "/login"}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 text-cgt-red hover:bg-white hover:shadow-lg transition-all duration-200 font-semibold border-0"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isAuthenticated() ? "Admin" : "Connexion"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
