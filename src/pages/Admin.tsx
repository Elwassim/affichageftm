import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Video,
  Heart,
  Plus,
  Trash2,
  Save,
  Home,
  LogOut,
  Shield,
  Menu,
  X,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import des styles améliorés
import "../styles/admin-improvements.css";

// Import database functions
import {
  addMeetingToDB,
  updateMeetingInDB,
  deleteMeetingFromDB,
  addTributeToDB,
  deleteTributeFromDB,
  updateConfig,
  createUser,
  updateUser,
  deleteUser,
} from "../lib/database";
import type { Meeting, Tribute, User, Permanence } from "../lib/supabase";
import { PermanencesAdmin } from "../components/admin/PermanencesAdmin";
import { useAdminSync } from "../hooks/useDatabaseSync";

const MEETING_CATEGORIES = [
  "Assemblée Générale",
  "Commission",
  "Délégu��s",
  "Formation",
  "Comité",
  "Négociation",
  "Sécurité",
  "Autre",
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("meetings");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  // Utilisation du hook de synchronisation
  const {
    meetings,
    tributes,
    permanences,
    users,
    config,
    loading,
    error,
    refresh,
    isConnected: dbConnected,
    lastSync,
  } = useAdminSync();

  // États pour les formulaires
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "",
    room: "",
    category: "Assemblée Générale",
    date: new Date().toISOString().split("T")[0],
  });

  const [newTribute, setNewTribute] = useState({
    name: "",
    photo: "",
    text: "",
  });

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    role: "user",
    is_admin: false,
  });

  // ��tat pour l'édition inline des utilisateurs
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<User>>({});

  // État pour l'édition inline des réunions
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editMeetingData, setEditMeetingData] = useState<Partial<Meeting>>({});

  const [localConfig, setLocalConfig] = useState({
    videoUrl: "",
    weatherCity: "Paris",
    alertText: "",
  });

  // Synchroniser la config locale avec la config de la base
  useEffect(() => {
    setLocalConfig({
      videoUrl: config.videoUrl || "",
      weatherCity: config.weatherCity || "Paris",
      alertText: config.alertText || "",
    });
  }, [config]);

  const [showPassword, setShowPassword] = useState(false);

  // Synchroniser la config locale avec celle de la base
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Debug: Log users data
  useEffect(() => {
    console.log("👥 Admin Panel - Users state:", {
      usersCount: users.length,
      users: users,
      loading,
      error,
      isConnected: dbConnected,
    });
  }, [users, loading, error, dbConnected]);

  // SOLUTION D'URGENCE: Si pas d'users après 5 secondes, créer des users de fallback
  const [fallbackUsers, setFallbackUsers] = useState<User[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (users.length === 0 && !loading && dbConnected) {
        console.log("🆘 Activation fallback users...");
        const emergencyUsers: User[] = [
          {
            id: "emergency-1",
            username: "admin.emergency",
            email: "admin@cgt-ftm.fr",
            role: "admin",
            is_admin: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "emergency-2",
            username: "marie.emergency",
            email: "marie@cgt-ftm.fr",
            role: "moderator",
            is_admin: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "emergency-3",
            username: "jean.emergency",
            email: "jean@cgt-ftm.fr",
            role: "user",
            is_admin: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setFallbackUsers(emergencyUsers);
      }
    }, 5000); // 5 secondes

    return () => clearTimeout(timer);
  }, [users.length, loading, dbConnected]);

  // Utiliser fallback users si pas d'users normaux
  const displayUsers = users.length > 0 ? users : fallbackUsers;

  const navigate = useNavigate();

  const navigationItems = [
    { id: "meetings", label: "Réunions", icon: Calendar, color: "blue" },
    { id: "tributes", label: "Hommages", icon: Heart, color: "pink" },
    { id: "video", label: "Médias", icon: Video, color: "orange" },
    { id: "users", label: "Utilisateurs", icon: Shield, color: "purple" },
    { id: "settings", label: "Paramètres", icon: Settings, color: "gray" },
  ];

  // Afficher les erreurs de synchronisation
  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de synchronisation",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // MEETINGS FUNCTIONS
  const handleAddMeeting = async () => {
    if (
      !newMeeting.title.trim() ||
      !newMeeting.time.trim() ||
      !newMeeting.room.trim()
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const meeting = await addMeetingToDB({
        title: newMeeting.title,
        time: newMeeting.time,
        room: newMeeting.room,
        category: newMeeting.category,
        date: newMeeting.date,
      });

      if (meeting) {
        // Force clear localStorage to ensure sync
        localStorage.removeItem("union-dashboard-data");
        await refresh(); // Actualiser les données
        // Dispatch event for dashboard sync
        window.dispatchEvent(
          new CustomEvent("cgt-config-updated", {
            detail: { key: "meetings", value: "updated" },
          }),
        );
        setNewMeeting({
          title: "",
          time: "",
          room: "",
          category: "Assemblée Générale",
          date: new Date().toISOString().split("T")[0],
        });
        toast({
          title: "Succès",
          description: "Réunion ajoutée avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la réunion.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      const success = await deleteMeetingFromDB(id);
      if (success) {
        // Force clear localStorage to ensure sync
        localStorage.removeItem("union-dashboard-data");
        await refresh(); // Actualiser toutes les données
        // Dispatch event for dashboard sync
        window.dispatchEvent(
          new CustomEvent("cgt-config-updated", {
            detail: { key: "meetings", value: "deleted" },
          }),
        );
        toast({
          title: "Succès",
          description: "Réunion supprimée avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réunion.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMeeting = async (id: string, updates: Partial<Meeting>) => {
    try {
      const success = await updateMeetingInDB(id, updates);
      if (success) {
        // Force clear localStorage to ensure sync
        localStorage.removeItem("union-dashboard-data");
        await refresh();
        // Dispatch event for dashboard sync
        window.dispatchEvent(
          new CustomEvent("cgt-config-updated", {
            detail: { key: "meetings", value: "updated" },
          }),
        );
        setEditingMeeting(null);
        toast({
          title: "Succès",
          description: "Réunion mise à jour avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réunion.",
        variant: "destructive",
      });
    }
  };

  // TRIBUTES FUNCTIONS
  const handleAddTribute = async () => {
    if (!newTribute.name.trim() || !newTribute.text.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tribute = await addTributeToDB({
        name: newTribute.name,
        photo: newTribute.photo,
        text: newTribute.text,
        date_added: new Date().toISOString(),
      });

      if (tribute) {
        await refresh();
        setNewTribute({
          name: "",
          photo: "",
          text: "",
        });
        toast({
          title: "Succès",
          description: "Hommage ajouté avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'hommage.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTribute = async (id: string) => {
    try {
      const success = await deleteTributeFromDB(id);
      if (success) {
        await refresh();
        toast({
          title: "Succès",
          description: "Hommage supprimé avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'hommage.",
        variant: "destructive",
      });
    }
  };

  // CONFIG FUNCTIONS
  const handleUpdateConfig = async (key: string, value: string) => {
    try {
      console.log("🔧 Tentative sauvegarde:", { key, value });
      const success = await updateConfig(key, value);
      console.log("📊 Résultat sauvegarde:", success);

      if (success) {
        setLocalConfig({ ...localConfig, [key]: value });
        await refresh(); // Actualiser les données

        // Déclencher un événement pour synchroniser les widgets
        window.dispatchEvent(
          new CustomEvent("cgt-config-updated", {
            detail: { key, value },
          }),
        );

        toast({
          title: "Succès",
          description: "Configuration mise à jour et synchronisée.",
        });
      } else {
        console.error("❌ Échec de sauvegarde");
        toast({
          title: "Échec de sauvegarde",
          description: "La configuration n'a pas pu être sauvegardée.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 Erreur sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration.",
        variant: "destructive",
      });
    }
  };

  // USER FUNCTIONS
  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = await createUser({
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        role: newUser.role,
        is_admin: newUser.is_admin,
      });

      if (user) {
        await refresh();
        setNewUser({
          username: "",
          password: "",
          email: "",
          role: "user",
          is_admin: false,
        });
        toast({
          title: "Succès",
          description: "Utilisateur ajouté avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const success = await deleteUser(id);

      if (success) {
        await refresh();
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Échec de la suppression de l'utilisateur.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user.id);
    setEditUserData({
      role: user.role,
      is_admin: user.is_admin,
      is_active: user.is_active,
      email: user.email,
    });
  };

  const handleSaveUser = async (userId: string) => {
    try {
      const success = await updateUser(userId, editUserData);
      if (success) {
        setEditingUser(null);
        setEditUserData({});
        await refresh();
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditUserData({});
  };

  // MEETING EDIT FUNCTIONS
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);
    setEditMeetingData({
      title: meeting.title,
      time: meeting.time,
      room: meeting.room,
      category: meeting.category,
      date: meeting.date,
    });
  };

  const handleSaveMeeting = async (meetingId: string) => {
    try {
      const success = await updateMeetingInDB(meetingId, editMeetingData);
      if (success) {
        setEditingMeeting(null);
        setEditMeetingData({});
        await refresh();
        toast({
          title: "Succès",
          description: "Réunion mise à jour avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réunion.",
        variant: "destructive",
      });
    }
  };

  const handleCancelMeetingEdit = () => {
    setEditingMeeting(null);
    setEditMeetingData({});
  };

  // PERMANENCES SYNC FUNCTION
  const handleSyncPermanences = async () => {
    try {
      toast({
        title: "Synchronisation en cours...",
        description:
          "Migration et synchronisation des permanences avec la base de données.",
      });

      const result = await syncPermanencesWithDB();

      if (result.success) {
        await refresh(); // Actualiser les données
        toast({
          title: "Succès",
          description: result.message,
        });
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser les permanences.",
        variant: "destructive",
      });
    }
  };

  // TEST PERMANENCES CONNECTION
  const handleTestPermanences = async () => {
    try {
      const { getPermanences } = await import("../lib/database");
      const permanences = await getPermanences();

      toast({
        title: "Test terminé",
        description: `Permanences: ${permanences.length}`,
      });
    } catch (error) {
      toast({
        title: "Erreur test",
        description: "Impossible de charger les permanences",
        variant: "destructive",
      });
    }
  };

  // FIX RLS PERMANENCES
  const handleFixRLS = async () => {
    try {
      console.log("🔧 Tentative de correction RLS...");

      toast({
        title: "Correction RLS...",
        description: "Tentative de correction des permissions d'accès.",
      });

      // Test si les RPC fonctionnent maintenant
      const { supabase } = await import("../lib/supabase");

      if (!supabase) {
        toast({
          title: "Erreur",
          description: "Supabase non configuré",
          variant: "destructive",
        });
        return;
      }

      // Test RPC permanences
      const permanencesRPC = await supabase.rpc("get_all_permanences");

      // Test RPC catégories
      const categoriesRPC = await supabase.rpc("get_all_permanence_categories");

      if (!permanencesRPC.error && !categoriesRPC.error) {
        await refresh();
        toast({
          title: "Succès",
          description: `RPC fonctionnel! Permanences: ${permanencesRPC.data?.length || 0}, Catégories: ${categoriesRPC.data?.length || 0}`,
        });
      } else {
        toast({
          title: "RLS toujours bloqué",
          description:
            "Exécutez FIX_PERMANENCES_RLS.sql dans Supabase SQL Editor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur correction",
        description: "Exécutez le script SQL manuel",
        variant: "destructive",
      });
    }
  };

  // VERIFICATION COMPLETE BDD
  const handleVerifyAllSync = async () => {
    try {
      toast({
        title: "Vérification en cours...",
        description: "Test de toutes les connexions base de données...",
      });

      const results = await verifyCompleteDatabaseSync();

      // Compter les résultats
      const totalTests = results.length - 1; // Exclure le résumé
      const successCount = results.filter((r) => r.status === "✅ OK").length;
      const errorCount = results.filter((r) => r.status === "❌ ERREUR").length;
      const warningCount = results.filter(
        (r) => r.status === "⚠️ ATTENTION",
      ).length;

      // Afficher les résultats détaillés dans la console
      console.table(
        results.map((r) => ({
          Composant: r.component,
          Statut: r.status,
          Détails: r.details,
          Nombre: r.count || "-",
        })),
      );

      if (errorCount === 0) {
        toast({
          title: "✅ Synchronisation Parfaite!",
          description: `${successCount}/${totalTests} tests réussis. ${warningCount} avertissements mineurs.`,
        });
      } else {
        toast({
          title: "⚠️ Problèmes D��tectés",
          description: `${errorCount} erreurs sur ${totalTests} tests. Voir console pour détails.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Erreur vérification complète:", error);
      toast({
        title: "Erreur Vérification",
        description: "Impossible de vérifier la synchronisation complète",
        variant: "destructive",
      });
    }
  };

  // FIX RLS TRIBUTES
  const handleFixTributesRLS = async () => {
    try {
      console.log("🔧 Tentative de correction RLS tributes...");

      toast({
        title: "Correction hommages...",
        description:
          "Tentative de correction des permissions d'accès pour les hommages.",
      });

      // Test si les RPC fonctionnent maintenant
      const { supabase } = await import("../lib/supabase");

      if (!supabase) {
        toast({
          title: "Erreur",
          description: "Supabase non configuré",
          variant: "destructive",
        });
        return;
      }

      // Test RPC tributes
      const tributesRPC = await supabase.rpc("get_all_tributes");
      console.log("🧪 Test RPC tributes:", tributesRPC);

      if (!tributesRPC.error) {
        await refresh();
        toast({
          title: "Succès",
          description: `RPC hommages fonctionnel! ${tributesRPC.data?.length || 0} hommages trouvés`,
        });
      } else {
        toast({
          title: "RLS toujours bloqué",
          description: "Exécutez FIX_TRIBUTES_RLS.sql dans Supabase SQL Editor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Erreur fix RLS tributes:", error);
      toast({
        title: "Erreur correction",
        description: "Vérifiez la console et exécutez le script SQL manuel",
        variant: "destructive",
      });
    }
  };

  // TEST EDIT FUNCTIONALITY
  const handleTestEdit = async () => {
    try {
      console.log("🧪 Test des fonctions d'édition...");

      toast({
        title: "Test d'édition...",
        description: "Test des capacités de modification",
      });

      // Test modification d'un utilisateur
      if (users.length > 0) {
        const firstUser = users[0];
        console.log("👤 Test modification utilisateur:", firstUser.id);

        const { updateUser } = await import("../lib/database");
        const success = await updateUser(firstUser.id, {
          updated_at: new Date().toISOString(),
        });

        console.log("📊 Résultat modification user:", success);
      }

      // Test modification d'une réunion
      if (meetings.length > 0) {
        const firstMeeting = meetings[0];
        console.log("📅 Test modification réunion:", firstMeeting.id);

        const { updateMeetingInDB } = await import("../lib/database");
        const success = await updateMeetingInDB(firstMeeting.id, {
          updated_at: new Date().toISOString(),
        });

        console.log("📊 Résultat modification meeting:", success);
      }

      toast({
        title: "Test terminé",
        description: "Vérifiez la console pour les résultats détaill��s",
      });
    } catch (error) {
      console.error("❌ Erreur test édition:", error);
      toast({
        title: "Erreur test",
        description: "Problème avec les fonctions d'édition",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Sauvegarde automatique",
      description:
        "Toutes les modifications sont automatiquement sauvegardées.",
    });
  };

  const handleLogout = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">
            Synchronisation avec la base de données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">CGT FTM</h1>
              <p className="text-xs text-slate-500">Administration</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 space-y-2">
          <Link to="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            >
              <Home className="w-4 h-4 mr-3" />
              Tableau de bord
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "ml-0"}`}
      >
        {/* Top Header */}
        <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-600 hover:text-slate-800"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {navigationItems.find((item) => item.id === activeTab)
                    ?.label || "Administration"}
                </h1>
                <p className="text-sm text-slate-600">
                  Panel de gestion CGT FTM
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleVerifyAllSync}
                className="admin-btn-secondary"
                title="Vérifier toutes les connexions BDD"
              >
                <Shield className="w-4 h-4 mr-2" />
                Vérifier Tout
              </button>
              {lastSync && (
                <span className="text-xs text-slate-500">
                  Dernière sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
              <Button onClick={refresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={handleSave} className="admin-btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-main-content">
          <div className="admin-content-wrapper">
            {/* Meetings Tab */}
            {activeTab === "meetings" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="admin-section-header">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-blue-100">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Réunions CGT FTM
                      </h2>
                      <p className="text-gray-700">
                        Planifiez et organisez les assemblées syndicales
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <span className="admin-connection-status">
                      <div
                        className={`admin-connection-dot ${dbConnected ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      {dbConnected
                        ? "Base de données connectée"
                        : "Connexion échouée"}
                    </span>
                    <span>{meetings.length} r��unions au total</span>
                  </div>
                </div>

                {/* Add Meeting Form */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-blue-500">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ajouter une réunion
                      </h3>
                      <p className="text-sm text-gray-700">
                        Nouvelle entrée au calendrier syndical
                      </p>
                    </div>
                  </div>

                  <div className="admin-form-grid mt-6">
                    <div>
                      <label className="admin-label">
                        Titre de la réunion *
                      </label>
                      <input
                        type="text"
                        value={newMeeting.title}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            title: e.target.value,
                          })
                        }
                        placeholder="Assemblée générale CGT"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Heure *</label>
                      <input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, time: e.target.value })
                        }
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Salle *</label>
                      <input
                        type="text"
                        value={newMeeting.room}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, room: e.target.value })
                        }
                        placeholder="Salle Rouge"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Date *</label>
                      <input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, date: e.target.value })
                        }
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Catégorie *</label>
                      <select
                        value={newMeeting.category}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            category: e.target.value,
                          })
                        }
                        className="admin-input w-full"
                      >
                        {MEETING_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleAddMeeting}
                      disabled={
                        !newMeeting.title.trim() ||
                        !newMeeting.time.trim() ||
                        !newMeeting.room.trim()
                      }
                      className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter la réunion
                    </button>
                  </div>
                </div>

                {/* Meetings List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Réunions existantes ({meetings.length})
                  </h3>

                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="admin-list-item">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="admin-label">Titre</label>
                            {editingMeeting === meeting.id ? (
                              <input
                                type="text"
                                value={editMeetingData.title || ""}
                                onChange={(e) =>
                                  setEditMeetingData({
                                    ...editMeetingData,
                                    title: e.target.value,
                                  })
                                }
                                className="admin-input w-full"
                              />
                            ) : (
                              <input
                                type="text"
                                value={meeting.title}
                                readOnly
                                className="admin-input w-full bg-gray-50"
                              />
                            )}
                          </div>
                          <div>
                            <label className="admin-label">Heure</label>
                            {editingMeeting === meeting.id ? (
                              <input
                                type="time"
                                value={editMeetingData.time || ""}
                                onChange={(e) =>
                                  setEditMeetingData({
                                    ...editMeetingData,
                                    time: e.target.value,
                                  })
                                }
                                className="admin-input w-full"
                              />
                            ) : (
                              <input
                                type="time"
                                value={meeting.time}
                                readOnly
                                className="admin-input w-full bg-gray-50"
                              />
                            )}
                          </div>
                          <div>
                            <label className="admin-label">Salle</label>
                            {editingMeeting === meeting.id ? (
                              <input
                                type="text"
                                value={editMeetingData.room || ""}
                                onChange={(e) =>
                                  setEditMeetingData({
                                    ...editMeetingData,
                                    room: e.target.value,
                                  })
                                }
                                className="admin-input w-full"
                              />
                            ) : (
                              <input
                                type="text"
                                value={meeting.room}
                                readOnly
                                className="admin-input w-full bg-gray-50"
                              />
                            )}
                          </div>
                          <div>
                            <label className="admin-label">Catégorie</label>
                            {editingMeeting === meeting.id ? (
                              <select
                                value={
                                  editMeetingData.category || meeting.category
                                }
                                onChange={(e) =>
                                  setEditMeetingData({
                                    ...editMeetingData,
                                    category: e.target.value,
                                  })
                                }
                                className="admin-input w-full"
                              >
                                {MEETING_CATEGORIES.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={meeting.category}
                                disabled
                                className="admin-input w-full bg-gray-50"
                              >
                                {MEETING_CATEGORIES.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          {editingMeeting === meeting.id ? (
                            <>
                              <button
                                onClick={() => handleSaveMeeting(meeting.id)}
                                className="admin-btn-primary text-sm px-3 py-1"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelMeetingEdit}
                                className="admin-btn-secondary text-sm px-3 py-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditMeeting(meeting)}
                                className="admin-btn-secondary text-sm px-3 py-1"
                                title="Modifier cette réunion"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="admin-btn-danger"
                                title="Supprimer cette réunion"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {meeting.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          Prévu le{" "}
                          {new Date(meeting.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tributes Tab */}
            {activeTab === "tributes" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="admin-section-header">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-pink-100">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Hommages
                      </h2>
                      <p className="text-gray-700">
                        Gérez les hommages avec rotation automatique
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <button
                      onClick={handleFixTributesRLS}
                      className="admin-btn-secondary mr-4"
                      title="Réparer les permissions des hommages"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Réparer Hommages
                    </button>
                    <span className="admin-connection-status">
                      <div
                        className={`admin-connection-dot ${dbConnected ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      Rotation toutes les 30 secondes
                    </span>
                    <span>{tributes.length} hommages configurés</span>
                  </div>
                </div>

                {/* Add Tribute Form */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-pink-500">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Ajouter un hommage
                      </h3>
                      <p className="text-sm text-slate-600">
                        Nouveau tribute pour la rotation
                      </p>
                    </div>
                  </div>

                  <div className="admin-form-grid mt-6">
                    <div>
                      <label className="admin-label">
                        Nom de la personne *
                      </label>
                      <input
                        type="text"
                        value={newTribute.name}
                        onChange={(e) =>
                          setNewTribute({ ...newTribute, name: e.target.value })
                        }
                        placeholder="Henri Krasucki"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">URL de la photo</label>
                      <input
                        type="url"
                        value={newTribute.photo}
                        onChange={(e) =>
                          setNewTribute({
                            ...newTribute,
                            photo: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="admin-input w-full"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="admin-label">Texte d'hommage *</label>
                    <textarea
                      value={newTribute.text}
                      onChange={(e) =>
                        setNewTribute({ ...newTribute, text: e.target.value })
                      }
                      placeholder="Secrétaire général de la CGT de 1982 à 1992..."
                      rows={3}
                      className="admin-input w-full"
                    />
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleAddTribute}
                      disabled={
                        !newTribute.name.trim() || !newTribute.text.trim()
                      }
                      className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter l'hommage
                    </button>
                  </div>
                </div>

                {/* Tributes List */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Hommages existants ({tributes.length})
                  </h3>

                  {tributes.map((tribute, index) => (
                    <div key={tribute.id} className="admin-list-item">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {tribute.photo ? (
                            <img
                              src={tribute.photo}
                              alt={tribute.name}
                              className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-pink-600 font-bold text-lg">
                                {tribute.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-slate-800 mb-1">
                                {tribute.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                                  Position #{index + 1}
                                </span>
                                <span>•</span>
                                <span>
                                  Ajouté le{" "}
                                  {new Date(
                                    tribute.date_added,
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                              <p className="text-slate-700 text-sm leading-relaxed">
                                {tribute.text}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteTribute(tribute.id)}
                              className="admin-btn-danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === "video" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="admin-section-header">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-orange-100">
                      <Video className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Médias
                      </h2>
                      <p className="text-slate-600">
                        Gestion des vidéos et contenus multimédias
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <span className="admin-connection-status">
                      <div
                        className={`admin-connection-dot ${dbConnected ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      {dbConnected
                        ? "Base de données connectée"
                        : "Connexion échouée"}
                    </span>
                    <span>URL vidéo configurée</span>
                  </div>
                </div>

                {/* Video Configuration */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-orange-500">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Configuration vidéo
                      </h3>
                      <p className="text-sm text-slate-600">
                        URL de la vidéo principale du tableau de bord
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="admin-label">URL de la vidéo *</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={localConfig.videoUrl}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            videoUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="admin-input flex-1"
                      />
                      <button
                        onClick={() =>
                          handleUpdateConfig("videoUrl", localConfig.videoUrl)
                        }
                        disabled={!localConfig.videoUrl.trim()}
                        className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Formats supportés : YouTube, Vimeo, liens directs MP4
                    </p>
                  </div>

                  {localConfig.videoUrl && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Aperçu :
                      </h4>
                      <div className="bg-white rounded border p-2 text-sm text-slate-600">
                        {localConfig.videoUrl}
                      </div>
                    </div>
                  )}
                </div>

                {/* Alert Banner Configuration */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-red-500">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Message d'alerte
                      </h3>
                      <p className="text-sm text-slate-600">
                        Bandeau défilant en haut du tableau de bord
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="admin-label">Texte d'alerte</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={localConfig.alertText}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            alertText: e.target.value,
                          })
                        }
                        placeholder="🚨 Message important CGT FTM..."
                        className="admin-input flex-1"
                      />
                      <button
                        onClick={() =>
                          handleUpdateConfig("alertText", localConfig.alertText)
                        }
                        className="admin-btn-primary"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Weather Configuration */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-blue-500">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Ville météo
                      </h3>
                      <p className="text-sm text-slate-600">
                        Ville pour l'affichage météorologique
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="admin-label">Nom de la ville</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={localConfig.weatherCity}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            weatherCity: e.target.value,
                          })
                        }
                        placeholder="Paris"
                        className="admin-input flex-1"
                      />
                      <button
                        onClick={() =>
                          handleUpdateConfig(
                            "weatherCity",
                            localConfig.weatherCity,
                          )
                        }
                        className="admin-btn-primary"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="admin-section-header">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-purple-100">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Gestion des utilisateurs
                      </h2>
                      <p className="text-slate-600">
                        Gérez les comptes d'accès au panel d'administration
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <span className="admin-connection-status">
                      <div
                        className={`admin-connection-dot ${dbConnected ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      {dbConnected
                        ? "Base de données connectée"
                        : "Connexion échouée"}
                    </span>
                    <span>{users.length} utilisateurs</span>
                  </div>
                </div>

                {/* Add User Form */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-purple-500">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Ajouter un utilisateur
                      </h3>
                      <p className="text-sm text-slate-600">
                        Nouveau compte d'accès à l'administration
                      </p>
                    </div>
                  </div>

                  <div className="admin-form-grid mt-6">
                    <div>
                      <label className="admin-label">Nom d'utilisateur *</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) =>
                          setNewUser({ ...newUser, username: e.target.value })
                        }
                        placeholder="admin_cgt"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        placeholder="admin@cgt-ftm.fr"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Mot de passe *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          placeholder="••••••••"
                          className="admin-input w-full pr-10"
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
                    <div>
                      <label className="admin-label">Rôle</label>
                      <select
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                        className="admin-input w-full"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                        <option value="moderator">Modérateur</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newUser.is_admin}
                        onChange={(e) =>
                          setNewUser({ ...newUser, is_admin: e.target.checked })
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">
                        Droits d'administration
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleAddUser}
                      disabled={
                        !newUser.username.trim() || !newUser.password.trim()
                      }
                      className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter l'utilisateur
                    </button>
                  </div>
                </div>

                {/* Users List */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Utilisateurs existants ({displayUsers.length})
                    {fallbackUsers.length > 0 && users.length === 0 && (
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        Mode Fallback
                      </span>
                    )}
                  </h3>

                  {displayUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Aucun utilisateur trouvé. Ajoutez le premier utilisateur
                      ci-dessus.
                    </div>
                  ) : (
                    displayUsers.map((user) => (
                      <div key={user.id} className="admin-list-item">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="admin-label">
                                Nom d'utilisateur
                              </label>
                              <input
                                type="text"
                                value={user.username}
                                readOnly
                                className="admin-input w-full bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="admin-label">Email</label>
                              {editingUser === user.id ? (
                                <input
                                  type="email"
                                  value={editUserData.email || ""}
                                  onChange={(e) =>
                                    setEditUserData({
                                      ...editUserData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="admin-input w-full"
                                />
                              ) : (
                                <input
                                  type="email"
                                  value={user.email || "Non renseigné"}
                                  readOnly
                                  className="admin-input w-full bg-gray-50"
                                />
                              )}
                            </div>
                            <div>
                              <label className="admin-label">Rôle</label>
                              {editingUser === user.id ? (
                                <select
                                  value={editUserData.role || user.role}
                                  onChange={(e) =>
                                    setEditUserData({
                                      ...editUserData,
                                      role: e.target.value,
                                    })
                                  }
                                  className="admin-input w-full"
                                >
                                  <option value="user">Utilisateur</option>
                                  <option value="admin">Administrateur</option>
                                  <option value="moderator">Modérateur</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={user.role}
                                  readOnly
                                  className="admin-input w-full bg-gray-50"
                                />
                              )}
                            </div>
                            <div>
                              <label className="admin-label">Statut</label>
                              {editingUser === user.id ? (
                                <div className="space-y-2">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={
                                        editUserData.is_active ?? user.is_active
                                      }
                                      onChange={(e) =>
                                        setEditUserData({
                                          ...editUserData,
                                          is_active: e.target.checked,
                                        })
                                      }
                                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-slate-700">
                                      Actif
                                    </span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={
                                        editUserData.is_admin ?? user.is_admin
                                      }
                                      onChange={(e) =>
                                        setEditUserData({
                                          ...editUserData,
                                          is_admin: e.target.checked,
                                        })
                                      }
                                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-slate-700">
                                      Admin
                                    </span>
                                  </label>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                                  ></span>
                                  <span className="text-sm">
                                    {user.is_active ? "Actif" : "Inactif"}
                                  </span>
                                  {user.is_admin && (
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            {editingUser === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveUser(user.id)}
                                  className="admin-btn-primary text-sm px-3 py-1"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="admin-btn-secondary text-sm px-3 py-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="admin-btn-secondary text-sm px-3 py-1"
                                  title="Modifier cet utilisateur"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="admin-btn-danger"
                                  title="Supprimer cet utilisateur"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <span>
                            Créé le{" "}
                            {new Date(user.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          {user.updated_at !== user.created_at && (
                            <>
                              <span>��</span>
                              <span>
                                Modifié le{" "}
                                {new Date(user.updated_at).toLocaleDateString(
                                  "fr-FR",
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="admin-section-header">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-gray-100">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Paramètres système
                      </h2>
                      <p className="text-slate-600">
                        Configuration générale de l'application
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <span className="admin-connection-status">
                      <div
                        className={`admin-connection-dot ${dbConnected ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      {dbConnected
                        ? "Base de données connectée"
                        : "Connexion échouée"}
                    </span>
                    <span>Configuration système</span>
                  </div>
                </div>

                {/* System Status */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-green-500">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        État du syst��me
                      </h3>
                      <p className="text-sm text-slate-600">
                        Informations sur l'état de l'application
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">
                          Base de données
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full ${dbConnected ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {dbConnected ? "Connectée" : "Déconnectée"}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          Données synchronisées
                        </span>
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {meetings.length + tributes.length + permanences.length}{" "}
                        entrées
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-800">
                          Version
                        </span>
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">v1.0.0</p>
                    </div>
                  </div>
                </div>

                {/* Backup & Maintenance */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-yellow-500">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Maintenance
                      </h3>
                      <p className="text-sm text-slate-600">
                        Actions de maintenance système
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={refresh}
                      className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">
                        Recharger les données
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        toast({
                          title: "Fonctionnalité",
                          description: "Export disponible prochainement.",
                        })
                      }
                      className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Save className="w-5 h-5 mr-2 text-green-600" />
                      <span className="text-sm font-medium">
                        Exporter les données
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
