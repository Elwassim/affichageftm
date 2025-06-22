import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { CGTLogo } from "./CGTLogo";

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

      <div className="relative p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {/* CGT Official Logo */}
            <div className="flex items-center space-x-4">
              <CGTLogo className="w-16 h-16 lg:w-20 lg:h-20" />
              <div className="text-white">
                <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black tracking-tight text-shadow">
                  CONFÉDÉRATION
                </h1>
                <p className="text-lg lg:text-xl xl:text-2xl font-semibold tracking-wide opacity-90">
                  GÉNÉRALE DU TRAVAIL
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <Link to="/admin">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/95 text-cgt-red hover:bg-white hover:shadow-lg transition-all duration-200 font-semibold border-0"
              >
                <Settings className="w-5 h-5 mr-2" />
                Administration
              </Button>
            </Link>
            <div className="text-white/90 text-sm font-medium">
              Tableau de bord syndical
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
