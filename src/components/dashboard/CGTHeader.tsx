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

      <div className="relative p-2 py-3">
        <div className="w-full flex justify-center items-center">
          <div className="flex items-center space-x-4">
            {/* CGT Official Logo */}
            <div className="flex items-center space-x-3">
              <CGTLogo className="w-16 h-16" />
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
