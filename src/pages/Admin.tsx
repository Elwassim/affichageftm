import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDashboardData,
  saveDashboardData,
  type Meeting,
  type Permanence,
  type SocialPost,
} from "@/lib/storage";
import {
  getAuthUsers,
  addAuthUser,
  updateAuthUser,
  deleteAuthUser,
  USER_GROUPS,
  getGroupInfo,
  type AuthUser,
} from "@/lib/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users,
  LogOut,
  Shield,
  Calendar,
  Video,
  AlertTriangle,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { logout, getCurrentUser } from "@/lib/auth";

const Admin = () => {
  const [data, setData] = useState(getDashboardData());
  const [authUsers, setAuthUsers] = useState(getAuthUsers());
  const [newAuthUser, setNewAuthUser] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "secretaire" as AuthUser["role"],
    group: "editor" as AuthUser["group"],
    section: "",
    active: true,
  });
  const navigate = useNavigate();

  const handleSave = () => {
    saveDashboardData(data);
    alert("Données sauvegardées avec succès !");
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  const currentUser = getCurrentUser();

  const addMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: "",
      time: "",
      room: "",
    };
    setData((prev) => ({
      ...prev,
      meetings: [...prev.meetings, newMeeting],
    }));
  };

  const removeMeeting = (id: string) => {
    setData((prev) => ({
      ...prev,
      meetings: prev.meetings.filter((m) => m.id !== id),
    }));
  };

  const updateMeeting = (id: string, field: keyof Meeting, value: string) => {
    setData((prev) => ({
      ...prev,
      meetings: prev.meetings.map((m) =>
        m.id === id ? { ...m, [field]: value } : m,
      ),
    }));
  };

  const addPermanence = () => {
    const newPermanence: Permanence = {
      id: Date.now().toString(),
      name: "",
      time: "",
      theme: "",
    };
    setData((prev) => ({
      ...prev,
      permanences: [...prev.permanences, newPermanence],
    }));
  };

  const removePermanence = (id: string) => {
    setData((prev) => ({
      ...prev,
      permanences: prev.permanences.filter((p) => p.id !== id),
    }));
  };

  const updatePermanence = (
    id: string,
    field: keyof Permanence,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      permanences: prev.permanences.map((p) =>
        p.id === id ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const updateSocialPost = (field: keyof SocialPost, value: string) => {
    setData((prev) => ({
      ...prev,
      socialPost: { ...prev.socialPost, [field]: value },
    }));
  };

  // Auth users management
  const handleAddAuthUser = () => {
    if (
      newAuthUser.username &&
      newAuthUser.password &&
      newAuthUser.name &&
      newAuthUser.email
    ) {
      addAuthUser(newAuthUser);
      setAuthUsers(getAuthUsers());
      setNewAuthUser({
        username: "",
        password: "",
        name: "",
        email: "",
        role: "secretaire",
        group: "editor",
        section: "",
        active: true,
      });
    }
  };

  const handleUpdateAuthUser = (
    id: string,
    field: keyof AuthUser,
    value: any,
  ) => {
    updateAuthUser(id, { [field]: value });
    setAuthUsers(getAuthUsers());
  };

  const handleDeleteAuthUser = (id: string) => {
    if (
      confirm("Êtes-vous sûr de vouloir supprimer ce compte de connexion ?")
    ) {
      deleteAuthUser(id);
      setAuthUsers(getAuthUsers());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-cgt-red via-cgt-red-dark to-cgt-red shadow-xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/5 to-transparent rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white text-shadow tracking-tight">
                  Administration CGT FTM
                </h1>
                <p className="text-white/90 text-lg font-medium">
                  Panneau de contrôle - Fédération des Travailleurs de la
                  Métallurgie
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {currentUser && (
                <div className="text-white/90 text-right">
                  <p className="text-lg font-bold">{currentUser.name}</p>
                  <p className="text-sm opacity-80">{currentUser.section}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs">Connecté</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Tableau de bord
                </Button>

                <Button
                  onClick={handleSave}
                  size="lg"
                  className="bg-white text-cgt-red hover:bg-white/90 hover:shadow-lg transition-all duration-300 font-bold shadow-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="lg"
                  className="bg-red-600/90 backdrop-blur-sm text-white border-red-500 hover:bg-red-700 hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="meetings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-gray-200/50">
            <TabsTrigger
              value="meetings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cgt-red data-[state=active]:to-cgt-red-dark data-[state=active]:text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Réunions
            </TabsTrigger>
            <TabsTrigger
              value="permanences"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cgt-red data-[state=active]:to-cgt-red-dark data-[state=active]:text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-sm"
            >
              <Users className="w-4 h-4" />
              Permanences
            </TabsTrigger>
            <TabsTrigger
              value="auth-users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cgt-red data-[state=active]:to-cgt-red-dark data-[state=active]:text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Connexions
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cgt-red data-[state=active]:to-cgt-red-dark data-[state=active]:text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-sm"
            >
              <Video className="w-4 h-4" />
              Vidéo
            </TabsTrigger>
            <TabsTrigger
              value="alert"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cgt-red data-[state=active]:to-cgt-red-dark data-[state=active]:text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Alerte
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cgt-red data-[state=active]:to-cgt-red-dark data-[state=active]:text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meetings">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl border border-gray-200/50">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-2xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    Gestion des réunions CGT FTM
                  </h2>
                  <p className="text-gray-600 mt-2 ml-15">
                    Planifiez et organisez les assemblées syndicales
                  </p>
                </div>
                <Button
                  onClick={addMeeting}
                  className="bg-gradient-to-r from-cgt-red to-cgt-red-dark text-white hover:shadow-xl transition-all duration-300 font-bold px-8 py-4 rounded-2xl shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle réunion
                </Button>
              </div>

              <div className="space-y-6">
                {data.meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gradient-to-r from-white via-gray-50/50 to-white border border-gray-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      <Label
                        htmlFor={`meeting-title-${meeting.id}`}
                        className="text-gray-700 font-semibold"
                      >
                        Titre de la réunion
                      </Label>
                      <Input
                        id={`meeting-title-${meeting.id}`}
                        value={meeting.title}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "title", e.target.value)
                        }
                        placeholder="Assemblée générale CGT"
                        className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`meeting-time-${meeting.id}`}
                        className="text-gray-700 font-semibold"
                      >
                        Heure
                      </Label>
                      <Input
                        id={`meeting-time-${meeting.id}`}
                        value={meeting.time}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "time", e.target.value)
                        }
                        placeholder="14:00"
                        className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`meeting-room-${meeting.id}`}
                        className="text-gray-700 font-semibold"
                      >
                        Salle
                      </Label>
                      <Input
                        id={`meeting-room-${meeting.id}`}
                        value={meeting.room}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "room", e.target.value)
                        }
                        placeholder="Salle des délégués"
                        className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => removeMeeting(meeting.id)}
                        className="w-full h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="auth-users">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl border border-gray-200/50">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-2xl flex items-center justify-center shadow-lg">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    Comptes de connexion CGT FTM
                  </h2>
                  <p className="text-gray-600 mt-2 ml-15">
                    Gestion des utilisateurs pouvant se connecter à
                    l'administration
                  </p>
                </div>
              </div>

              {/* Groups info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl mb-8 border border-blue-200/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Groupes et permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {USER_GROUPS.map((group) => (
                    <div
                      key={group.id}
                      className="p-6 bg-white rounded-2xl border border-gray-200/50 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-2 rounded-xl text-sm font-bold ${group.color}`}
                        >
                          {group.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add new auth user form */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl mb-8 border border-green-200/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-green-600" />
                  Créer un nouveau compte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <Label
                      htmlFor="new-auth-username"
                      className="text-gray-700 font-semibold"
                    >
                      Nom d'utilisateur
                    </Label>
                    <Input
                      id="new-auth-username"
                      value={newAuthUser.username}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          username: e.target.value,
                        })
                      }
                      placeholder="marie.dubois"
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="new-auth-password"
                      className="text-gray-700 font-semibold"
                    >
                      Mot de passe
                    </Label>
                    <Input
                      id="new-auth-password"
                      type="password"
                      value={newAuthUser.password}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          password: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="new-auth-name"
                      className="text-gray-700 font-semibold"
                    >
                      Nom complet
                    </Label>
                    <Input
                      id="new-auth-name"
                      value={newAuthUser.name}
                      onChange={(e) =>
                        setNewAuthUser({ ...newAuthUser, name: e.target.value })
                      }
                      placeholder="Marie Dubois"
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="new-auth-email"
                      className="text-gray-700 font-semibold"
                    >
                      Email
                    </Label>
                    <Input
                      id="new-auth-email"
                      type="email"
                      value={newAuthUser.email}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          email: e.target.value,
                        })
                      }
                      placeholder="marie@cgt-ftm.fr"
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="new-auth-role"
                      className="text-gray-700 font-semibold"
                    >
                      Rôle
                    </Label>
                    <select
                      id="new-auth-role"
                      value={newAuthUser.role}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          role: e.target.value as AuthUser["role"],
                        })
                      }
                      className="mt-2 flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="secretaire">Secrétaire</option>
                      <option value="delegue">Délégué syndical</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <Label
                      htmlFor="new-auth-group"
                      className="text-gray-700 font-semibold"
                    >
                      Groupe
                    </Label>
                    <select
                      id="new-auth-group"
                      value={newAuthUser.group}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          group: e.target.value as AuthUser["group"],
                        })
                      }
                      className="mt-2 flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                    >
                      {USER_GROUPS.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label
                      htmlFor="new-auth-section"
                      className="text-gray-700 font-semibold"
                    >
                      Section
                    </Label>
                    <Input
                      id="new-auth-section"
                      value={newAuthUser.section}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          section: e.target.value,
                        })
                      }
                      placeholder="Secrétariat FTM"
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddAuthUser}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 font-bold px-8 py-4 h-12 rounded-xl w-full shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Créer
                    </Button>
                  </div>
                </div>
              </div>

              {/* Auth users list */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Comptes existants
                </h3>
                {authUsers.map((user) => {
                  const groupInfo = getGroupInfo(user.group);
                  return (
                    <div
                      key={user.id}
                      className="grid grid-cols-1 md:grid-cols-8 gap-6 p-8 bg-gradient-to-r from-white via-gray-50/50 to-white border border-gray-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div>
                        <Label
                          htmlFor={`auth-username-${user.id}`}
                          className="text-gray-700 font-semibold"
                        >
                          Username
                        </Label>
                        <Input
                          id={`auth-username-${user.id}`}
                          value={user.username}
                          onChange={(e) =>
                            handleUpdateAuthUser(
                              user.id,
                              "username",
                              e.target.value,
                            )
                          }
                          className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`auth-name-${user.id}`}
                          className="text-gray-700 font-semibold"
                        >
                          Nom
                        </Label>
                        <Input
                          id={`auth-name-${user.id}`}
                          value={user.name}
                          onChange={(e) =>
                            handleUpdateAuthUser(
                              user.id,
                              "name",
                              e.target.value,
                            )
                          }
                          className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`auth-email-${user.id}`}
                          className="text-gray-700 font-semibold"
                        >
                          Email
                        </Label>
                        <Input
                          id={`auth-email-${user.id}`}
                          type="email"
                          value={user.email}
                          onChange={(e) =>
                            handleUpdateAuthUser(
                              user.id,
                              "email",
                              e.target.value,
                            )
                          }
                          className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`auth-role-${user.id}`}
                          className="text-gray-700 font-semibold"
                        >
                          Rôle
                        </Label>
                        <select
                          id={`auth-role-${user.id}`}
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateAuthUser(
                              user.id,
                              "role",
                              e.target.value,
                            )
                          }
                          className="mt-2 flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-cgt-red focus:ring-cgt-red"
                        >
                          <option value="secretaire">Secrétaire</option>
                          <option value="delegue">Délégué</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <Label
                          htmlFor={`auth-group-${user.id}`}
                          className="text-gray-700 font-semibold"
                        >
                          Groupe
                        </Label>
                        <select
                          id={`auth-group-${user.id}`}
                          value={user.group}
                          onChange={(e) =>
                            handleUpdateAuthUser(
                              user.id,
                              "group",
                              e.target.value,
                            )
                          }
                          className="mt-2 flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-cgt-red focus:ring-cgt-red"
                        >
                          {USER_GROUPS.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label
                          htmlFor={`auth-section-${user.id}`}
                          className="text-gray-700 font-semibold"
                        >
                          Section
                        </Label>
                        <Input
                          id={`auth-section-${user.id}`}
                          value={user.section}
                          onChange={(e) =>
                            handleUpdateAuthUser(
                              user.id,
                              "section",
                              e.target.value,
                            )
                          }
                          className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-semibold">
                          Statut
                        </Label>
                        <div className="flex items-center gap-3 mt-4">
                          <input
                            type="checkbox"
                            checked={user.active}
                            onChange={(e) =>
                              handleUpdateAuthUser(
                                user.id,
                                "active",
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 rounded-lg border-gray-300 text-cgt-red focus:ring-cgt-red"
                          />
                          <span className="text-sm font-medium">
                            {user.active ? "Actif" : "Inactif"}
                          </span>
                        </div>
                        {groupInfo && (
                          <span
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-bold mt-2 ${groupInfo.color}`}
                          >
                            {groupInfo.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={() => handleDeleteAuthUser(user.id)}
                          className="w-full h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="permanences">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl border border-gray-200/50">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    Gestion des permanences CGT FTM
                  </h2>
                  <p className="text-gray-600 mt-2 ml-15">
                    Organisez les horaires des délégués syndicaux
                  </p>
                </div>
                <Button
                  onClick={addPermanence}
                  className="bg-gradient-to-r from-cgt-red to-cgt-red-dark text-white hover:shadow-xl transition-all duration-300 font-bold px-8 py-4 rounded-2xl shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle permanence
                </Button>
              </div>

              <div className="space-y-6">
                {data.permanences.map((permanence) => (
                  <div
                    key={permanence.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gradient-to-r from-white via-gray-50/50 to-white border border-gray-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      <Label
                        htmlFor={`permanence-name-${permanence.id}`}
                        className="text-gray-700 font-semibold"
                      >
                        Nom du délégué
                      </Label>
                      <Input
                        id={`permanence-name-${permanence.id}`}
                        value={permanence.name}
                        onChange={(e) =>
                          updatePermanence(
                            permanence.id,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Marie Dubois"
                        className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`permanence-time-${permanence.id}`}
                        className="text-gray-700 font-semibold"
                      >
                        Horaires
                      </Label>
                      <Input
                        id={`permanence-time-${permanence.id}`}
                        value={permanence.time}
                        onChange={(e) =>
                          updatePermanence(
                            permanence.id,
                            "time",
                            e.target.value,
                          )
                        }
                        placeholder="09:00 - 12:00"
                        className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`permanence-theme-${permanence.id}`}
                        className="text-gray-700 font-semibold"
                      >
                        Spécialité
                      </Label>
                      <Input
                        id={`permanence-theme-${permanence.id}`}
                        value={permanence.theme}
                        onChange={(e) =>
                          updatePermanence(
                            permanence.id,
                            "theme",
                            e.target.value,
                          )
                        }
                        placeholder="Droit du travail"
                        className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => removePermanence(permanence.id)}
                        className="w-full h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl border border-gray-200/50">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-2xl flex items-center justify-center shadow-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  Configuration vidéo institutionnelle
                </h2>
                <p className="text-gray-600 mt-2 ml-15">
                  Gérez le contenu vidéo affiché sur le tableau de bord
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                  <Label
                    htmlFor="video-url"
                    className="text-gray-700 font-semibold text-lg"
                  >
                    URL de la vidéo
                  </Label>
                  <Input
                    id="video-url"
                    value={data.videoUrl}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="mt-4 h-14 text-lg rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                  />
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    Accepte les liens YouTube, Vimeo ou liens directs vers des
                    vidéos. La vidéo sera affichée en autoplay sur le tableau de
                    bord.
                  </p>
                </div>

                <div className="p-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                  <Label
                    htmlFor="weather-city"
                    className="text-gray-700 font-semibold text-lg"
                  >
                    Ville pour la météo
                  </Label>
                  <Input
                    id="weather-city"
                    value={data.weatherCity}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        weatherCity: e.target.value,
                      }))
                    }
                    placeholder="Paris"
                    className="mt-4 h-14 text-lg rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    La météo se met à jour automatiquement toutes les minutes
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="alert">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl border border-gray-200/50">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  Bandeau d'alerte CGT
                </h2>
                <p className="text-gray-600 mt-2 ml-15">
                  Diffusez des informations importantes en temps réel
                </p>
              </div>

              <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200/50">
                <Label
                  htmlFor="alert-text"
                  className="text-gray-700 font-semibold text-lg"
                >
                  Texte du bandeau défilant
                </Label>
                <Textarea
                  id="alert-text"
                  value={data.alertText}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, alertText: e.target.value }))
                  }
                  placeholder="🚨 APPEL CGT FTM - Négociation collective métallurgie - Jeudi 21 mars à 14h - Siège fédéral"
                  rows={4}
                  className="mt-4 text-lg rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  Ce texte défilera en haut du tableau de bord. Utilisez des
                  émojis (🚨⚠️📢) pour plus d'impact visuel.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl border border-gray-200/50">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  Message syndical officiel
                </h2>
                <p className="text-gray-600 mt-2 ml-15">
                  Communiquez avec vos adhérents
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                    <Label
                      htmlFor="social-name"
                      className="text-gray-700 font-semibold"
                    >
                      Nom du délégué
                    </Label>
                    <Input
                      id="social-name"
                      value={data.socialPost.name}
                      onChange={(e) => updateSocialPost("name", e.target.value)}
                      placeholder="Sophie Lefebvre"
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                    />
                  </div>

                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                    <Label
                      htmlFor="social-photo"
                      className="text-gray-700 font-semibold"
                    >
                      URL de la photo
                    </Label>
                    <Input
                      id="social-photo"
                      value={data.socialPost.photo}
                      onChange={(e) =>
                        updateSocialPost("photo", e.target.value)
                      }
                      placeholder="https://..."
                      className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                    />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                  <Label
                    htmlFor="social-text"
                    className="text-gray-700 font-semibold"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="social-text"
                    value={data.socialPost.text}
                    onChange={(e) => updateSocialPost("text", e.target.value)}
                    placeholder="Fière de représenter nos adhérents à la négociation salariale de ce matin..."
                    rows={4}
                    className="mt-2 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                  />
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50">
                  <Label
                    htmlFor="social-hashtag"
                    className="text-gray-700 font-semibold"
                  >
                    Hashtag
                  </Label>
                  <Input
                    id="social-hashtag"
                    value={data.socialPost.hashtag}
                    onChange={(e) =>
                      updateSocialPost("hashtag", e.target.value)
                    }
                    placeholder="#CGTFTM"
                    className="mt-2 h-12 rounded-xl border-gray-300 focus:border-cgt-red focus:ring-cgt-red"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
