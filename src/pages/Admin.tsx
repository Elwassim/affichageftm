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
  addPermanenceToDB,
  updatePermanence,
  deletePermanence,
  updateConfig,
  createUser,
  updateUser,
  deleteUser,
} from "../lib/database";
import type { Meeting, Tribute, Permanence, User } from "../lib/supabase";
import { useAdminSync } from "../hooks/useDatabaseSync";

const MEETING_CATEGORIES = [
  "Assemblée Générale",
  "Commission",
  "Délégués",
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

  const [newPermanence, setNewPermanence] = useState({
    name: "",
    schedule: "",
    type: "Standard",
  });

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    role: "user",
    is_admin: false,
  });

  const [localConfig, setLocalConfig] = useState({
    videoUrl: "",
    weatherCity: "Paris",
    alertText: "",
  });

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

  const navigate = useNavigate();

  const navigationItems = [
    { id: "meetings", label: "Réunions", icon: Calendar, color: "blue" },
    { id: "tributes", label: "Hommages", icon: Heart, color: "pink" },
    { id: "permanences", label: "Permanences", icon: Users, color: "green" },
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
        await refresh(); // Actualiser les données
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
        setMeetings(meetings.filter((m) => m.id !== id));
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

  // PERMANENCES FUNCTIONS
  const handleAddPermanence = async () => {
    if (!newPermanence.name.trim() || !newPermanence.schedule.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permanence = await addPermanenceToDB({
        name: newPermanence.name,
        schedule: newPermanence.schedule,
        type: newPermanence.type,
      });

      if (permanence) {
        await refresh();
        setNewPermanence({
          name: "",
          schedule: "",
          type: "Standard",
        });
        toast({
          title: "Succès",
          description: "Permanence ajoutée avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la permanence.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePermanence = async (id: string) => {
    try {
      const success = await deletePermanence(id);
      if (success) {
        await refresh();
        toast({
          title: "Succès",
          description: "Permanence supprimée avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la permanence.",
        variant: "destructive",
      });
    }
  };

  // CONFIG FUNCTIONS
  const handleUpdateConfig = async (key: string, value: string) => {
    try {
      const success = await updateConfig(key, value);
      if (success) {
        setLocalConfig({ ...localConfig, [key]: value });
        await refresh(); // Actualiser les données
        toast({
          title: "Succès",
          description: "Configuration mise à jour avec succès.",
        });
      }
    } catch (error) {
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
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
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
                    <span>{meetings.length} réunions au total</span>
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
                            <input
                              type="text"
                              value={meeting.title}
                              readOnly
                              className="admin-input w-full bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Heure</label>
                            <input
                              type="time"
                              value={meeting.time}
                              readOnly
                              className="admin-input w-full bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Salle</label>
                            <input
                              type="text"
                              value={meeting.room}
                              readOnly
                              className="admin-input w-full bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Catégorie</label>
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
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="admin-btn-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

            {/* Permanences Tab */}
            {activeTab === "permanences" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="admin-section-header">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-green-100">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Permanences
                      </h2>
                      <p className="text-slate-600">
                        Gérez les horaires des permanents syndicaux
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
                    <span>{permanences.length} permanences configurées</span>
                  </div>
                </div>

                {/* Add Permanence Form */}
                <div className="admin-add-card">
                  <div className="admin-section-title">
                    <div className="admin-section-icon bg-green-500">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Ajouter une permanence
                      </h3>
                      <p className="text-sm text-slate-600">
                        Nouveau créneau de permanence
                      </p>
                    </div>
                  </div>

                  <div className="admin-form-grid mt-6">
                    <div>
                      <label className="admin-label">Nom du permanent *</label>
                      <input
                        type="text"
                        value={newPermanence.name}
                        onChange={(e) =>
                          setNewPermanence({
                            ...newPermanence,
                            name: e.target.value,
                          })
                        }
                        placeholder="Marie Dupont"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Horaires *</label>
                      <input
                        type="text"
                        value={newPermanence.schedule}
                        onChange={(e) =>
                          setNewPermanence({
                            ...newPermanence,
                            schedule: e.target.value,
                          })
                        }
                        placeholder="Lundi 9h-17h"
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Type</label>
                      <select
                        value={newPermanence.type}
                        onChange={(e) =>
                          setNewPermanence({
                            ...newPermanence,
                            type: e.target.value,
                          })
                        }
                        className="admin-input w-full"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Délégué">Délégué</option>
                        <option value="Secrétaire">Secrétaire</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleAddPermanence}
                      disabled={
                        !newPermanence.name.trim() ||
                        !newPermanence.schedule.trim()
                      }
                      className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter la permanence
                    </button>
                  </div>
                </div>

                {/* Permanences List */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Permanences existantes ({permanences.length})
                  </h3>

                  {permanences.map((permanence) => (
                    <div key={permanence.id} className="admin-list-item">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="admin-label">Nom</label>
                            <input
                              type="text"
                              value={permanence.name}
                              readOnly
                              className="admin-input w-full bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Horaires</label>
                            <input
                              type="text"
                              value={permanence.schedule}
                              readOnly
                              className="admin-input w-full bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Type</label>
                            <input
                              type="text"
                              value={permanence.type}
                              readOnly
                              className="admin-input w-full bg-gray-50"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() =>
                              handleDeletePermanence(permanence.id)
                            }
                            className="admin-btn-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                    Utilisateurs existants ({users.length})
                  </h3>

                  {/* DEBUG: Affichage temporaire pour diagnostic */}
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      🔍 Debug Info:
                    </h4>
                    <p className="text-sm text-yellow-700">
                      • Utilisateurs chargés: {users.length}
                      <br />• Connexion DB:{" "}
                      {dbConnected ? "✅ Connectée" : "❌ Déconnectée"}
                      <br />• Loading: {loading ? "En cours..." : "Terminé"}
                      <br />• Erreur: {error || "Aucune"}
                      <br />
                    </p>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>Données users:</strong>
                      <pre>{JSON.stringify(users, null, 2)}</pre>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={refresh}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
                      >
                        🔄 Forcer refresh
                      </button>
                      <button
                        onClick={async () => {
                          console.log("🚀 Création d'utilisateurs de test...");
                          const testUsers = [
                            {
                              username: "admin.test",
                              password: "test123",
                              email: "admin@test.com",
                              role: "admin",
                              is_admin: true,
                            },
                            {
                              username: "user.test",
                              password: "test123",
                              email: "user@test.com",
                              role: "user",
                              is_admin: false,
                            },
                            {
                              username: "mod.test",
                              password: "test123",
                              email: "mod@test.com",
                              role: "moderator",
                              is_admin: false,
                            },
                          ];

                          for (const user of testUsers) {
                            try {
                              await createUser(user);
                              console.log(
                                `✅ Utilisateur ${user.username} créé`,
                              );
                            } catch (error) {
                              console.error(
                                `❌ Erreur création ${user.username}:`,
                                error,
                              );
                            }
                          }

                          setTimeout(() => refresh(), 1000); // Refresh après création
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        🧪 Créer users test
                      </button>
                    </div>
                  </div>

                  {users.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Aucun utilisateur trouvé. Ajoutez le premier utilisateur
                      ci-dessus.
                    </div>
                  ) : (
                    users.map((user) => (
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
                              <input
                                type="email"
                                value={user.email || "Non renseigné"}
                                readOnly
                                className="admin-input w-full bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="admin-label">Rôle</label>
                              <input
                                type="text"
                                value={user.role}
                                readOnly
                                className="admin-input w-full bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="admin-label">Statut</label>
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
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="admin-btn-danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                              <span>•</span>
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
                        État du système
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
