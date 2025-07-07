import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CGTLogo } from "@/components/dashboard/CGTLogo";
import {
  authenticateUser,
  setCurrentUser,
  type LoginCredentials,
} from "@/lib/auth";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";

const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("🚀 Tentative de connexion:", credentials.username);

    try {
      // Nettoyer les anciennes données d'authentification locale
      localStorage.removeItem("cgt-ftm-auth-users");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = await authenticateUser(credentials);

      if (user) {
        console.log("✅ Connexion réussie avec Supabase:", user.username);
        setCurrentUser(user);
        navigate("/admin");
      } else {
        console.log("❌ Échec de la connexion");
        setError("Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("💥 Erreur lors de la connexion:", error);
      setError("Erreur lors de la connexion");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen cgt-gradient flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm professional-shadow border-0 relative z-10">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CGTLogo className="w-20 h-20" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-cgt-gray">
                Administration CGT FTM
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Fédération des Travailleurs de la Métallurgie
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-cgt-gray font-semibold">
                Nom d'utilisateur
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  placeholder="marie.dubois"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-cgt-gray font-semibold">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-cgt-red text-white hover:bg-cgt-red-dark font-bold text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Se connecter
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <div className="text-center text-xs text-gray-500">
            <p>© 2024 CGT FTM - Tous droits réservés</p>
            <p className="mt-1">Système sécurisé - Accès réservé aux membres</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
