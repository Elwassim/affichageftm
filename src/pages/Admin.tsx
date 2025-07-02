import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDashboardDataFromDB,
  getMeetings,
  createMeeting,
  updateMeetingInDB,
  deleteMeetingFromDB,
  getPermanences,
  createPermanence,
  getTributes,
  createTribute,
  deleteTributeFromDB,
  getConfig,
  setConfig,
  type Meeting,
  type Permanence,
  type SocialPost,
  type Tribute,
} from "@/lib/database";
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
  Settings,
  Home,
  Bell,
  Search,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { logout, getCurrentUser } from "@/lib/auth";

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
  const [data, setData] = useState<any>(null);
  const [authUsers, setAuthUsers] = useState(getAuthUsers());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await getDashboardDataFromDB();
        setData(dashboardData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  const [newTribute, setNewTribute] = useState({
    name: "",
    photo: "",
    text: "",
  });
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "",
    room: "",
    category: "Assemblée Générale",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("meetings");
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
    // Show toast notification instead of alert
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    toast.textContent = "✅ Données sauvegardées avec succès !";
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
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

  // Meeting functions
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

  // Permanence functions
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

  const handleAddTribute = () => {
    if (newTribute.name.trim() && newTribute.text.trim()) {
      addTribute(newTribute);
      setNewTribute({ name: "", photo: "", text: "" });
      setData(getDashboardData());
      alert("Hommage ajouté avec succès !");
    } else {
      alert("Veuillez remplir au moins le nom et le texte de l'hommage.");
    }
  };

  const handleRemoveTribute = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet hommage ?")) {
      removeTribute(id);
      setData(getDashboardData());
    }
  };

  const handleAddMeeting = () => {
    if (
      newMeeting.title.trim() &&
      newMeeting.time.trim() &&
      newMeeting.room.trim()
    ) {
      const meeting = {
        ...newMeeting,
        id: Date.now().toString(),
      };
      const updatedData = {
        ...data,
        meetings: [...data.meetings, meeting],
      };
      setData(updatedData);
      saveDashboardData(updatedData);
      setNewMeeting({
        title: "",
        time: "",
        room: "",
        category: "Assemblée Générale",
      });
      alert("Réunion ajoutée avec succès !");
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };

  const handleRemoveMeeting = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réunion ?")) {
      const updatedData = {
        ...data,
        meetings: data.meetings.filter((m) => m.id !== id),
      };
      setData(updatedData);
      saveDashboardData(updatedData);
    }
  };

  const navigationItems = [
    { id: "meetings", label: "Réunions", icon: Calendar, color: "blue" },
    { id: "permanences", label: "Permanences", icon: Users, color: "green" },
    { id: "auth-users", label: "Connexions", icon: UserCheck, color: "purple" },
    { id: "video", label: "Média", icon: Video, color: "orange" },
    { id: "alert", label: "Alertes", icon: AlertTriangle, color: "red" },
    { id: "social", label: "Messages", icon: MessageSquare, color: "indigo" },
    { id: "tributes", label: "Hommages", icon: Heart, color: "pink" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
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

        {/* User Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentUser?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("") || "AD"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {currentUser?.name || "Administrateur"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.section || "Direction"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-slate-500">En ligne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              // Static color classes based on item type
              const getActiveClasses = (color: string) => {
                switch (color) {
                  case "blue":
                    return "bg-blue-50 text-blue-700";
                  case "green":
                    return "bg-green-50 text-green-700";
                  case "purple":
                    return "bg-purple-50 text-purple-700";
                  case "orange":
                    return "bg-orange-50 text-orange-700";
                  case "red":
                    return "bg-red-50 text-red-700";
                  case "indigo":
                    return "bg-indigo-50 text-indigo-700";
                  default:
                    return "bg-slate-50 text-slate-700";
                }
              };

              const getIconClasses = (color: string) => {
                switch (color) {
                  case "blue":
                    return "text-blue-600";
                  case "green":
                    return "text-green-600";
                  case "purple":
                    return "text-purple-600";
                  case "orange":
                    return "text-orange-600";
                  case "red":
                    return "text-red-600";
                  case "indigo":
                    return "text-indigo-600";
                  default:
                    return "text-slate-600";
                }
              };

              const getDotClasses = (color: string) => {
                switch (color) {
                  case "blue":
                    return "bg-blue-500";
                  case "green":
                    return "bg-green-500";
                  case "purple":
                    return "bg-purple-500";
                  case "orange":
                    return "bg-orange-500";
                  case "red":
                    return "bg-red-500";
                  case "indigo":
                    return "bg-indigo-500";
                  default:
                    return "bg-slate-500";
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? `${getActiveClasses(item.color)} shadow-sm`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? getIconClasses(item.color) : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div
                      className={`ml-auto w-2 h-2 ${getDotClasses(item.color)} rounded-full`}
                    ></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-slate-200 space-y-2">
          <Button
            onClick={handleBackToDashboard}
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-50"
          >
            <Home className="w-4 h-4 mr-3" />
            Tableau de bord
          </Button>
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
        className={`transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
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
                <p className="text-sm text-slate-500">
                  Gestion du tableau de bord syndical
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Meetings Tab */}
            {activeTab === "meetings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Réunions CGT FTM
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Planifiez et organisez les assemblées syndicales par
                    catégorie
                  </p>
                </div>

                {/* Add new meeting */}
                <Card className="p-6 border-blue-200 bg-blue-50/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Ajouter une réunion
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-meeting-title"
                        className="text-sm font-medium text-slate-700"
                      >
                        Titre de la réunion *
                      </Label>
                      <Input
                        id="new-meeting-title"
                        value={newMeeting.title}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            title: e.target.value,
                          })
                        }
                        placeholder="Assemblée générale CGT"
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-meeting-time"
                        className="text-sm font-medium text-slate-700"
                      >
                        Heure *
                      </Label>
                      <Input
                        id="new-meeting-time"
                        value={newMeeting.time}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, time: e.target.value })
                        }
                        placeholder="14:00"
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-meeting-room"
                        className="text-sm font-medium text-slate-700"
                      >
                        Salle *
                      </Label>
                      <Input
                        id="new-meeting-room"
                        value={newMeeting.room}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, room: e.target.value })
                        }
                        placeholder="Salle des délégués"
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-meeting-category"
                        className="text-sm font-medium text-slate-700"
                      >
                        Catégorie *
                      </Label>
                      <select
                        id="new-meeting-category"
                        value={newMeeting.category}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                      >
                        {MEETING_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddMeeting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={
                        !newMeeting.title.trim() ||
                        !newMeeting.time.trim() ||
                        !newMeeting.room.trim()
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter la réunion
                    </Button>
                  </div>
                </Card>

                {/* Meetings list */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Réunions existantes ({data.meetings.length})
                  </h3>
                  {data.meetings.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Aucune réunion planifiée
                      </h3>
                      <p className="text-gray-500">
                        Ajoutez votre première réunion pour commencer
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {data.meetings.map((meeting) => (
                        <Card
                          key={meeting.id}
                          className="p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`meeting-title-${meeting.id}`}
                                className="text-sm font-medium text-slate-700"
                              >
                                Titre
                              </Label>
                              <Input
                                id={`meeting-title-${meeting.id}`}
                                value={meeting.title}
                                onChange={(e) =>
                                  updateMeeting(
                                    meeting.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`meeting-time-${meeting.id}`}
                                className="text-sm font-medium text-slate-700"
                              >
                                Heure
                              </Label>
                              <Input
                                id={`meeting-time-${meeting.id}`}
                                value={meeting.time}
                                onChange={(e) =>
                                  updateMeeting(
                                    meeting.id,
                                    "time",
                                    e.target.value,
                                  )
                                }
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`meeting-room-${meeting.id}`}
                                className="text-sm font-medium text-slate-700"
                              >
                                Salle
                              </Label>
                              <Input
                                id={`meeting-room-${meeting.id}`}
                                value={meeting.room}
                                onChange={(e) =>
                                  updateMeeting(
                                    meeting.id,
                                    "room",
                                    e.target.value,
                                  )
                                }
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`meeting-category-${meeting.id}`}
                                className="text-sm font-medium text-slate-700"
                              >
                                Catégorie
                              </Label>
                              <select
                                id={`meeting-category-${meeting.id}`}
                                value={meeting.category}
                                onChange={(e) =>
                                  updateMeeting(
                                    meeting.id,
                                    "category",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                              >
                                {MEETING_CATEGORIES.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMeeting(meeting.id)}
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {meeting.category}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Permanences Tab */}
            {activeTab === "permanences" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Permanences CGT FTM
                    </h2>
                    <p className="text-slate-600 mt-1">
                      Organisez les horaires des délégués syndicaux
                    </p>
                  </div>
                  <Button
                    onClick={addPermanence}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle permanence
                  </Button>
                </div>

                <div className="grid gap-4">
                  {data.permanences.map((permanence) => (
                    <Card
                      key={permanence.id}
                      className="p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`permanence-name-${permanence.id}`}
                            className="text-sm font-medium text-slate-700"
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
                            className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`permanence-time-${permanence.id}`}
                            className="text-sm font-medium text-slate-700"
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
                            className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`permanence-theme-${permanence.id}`}
                            className="text-sm font-medium text-slate-700"
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
                            className="border-slate-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removePermanence(permanence.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Auth Users Tab */}
            {activeTab === "auth-users" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Comptes de connexion
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Gestion des utilisateurs pouvant se connecter à
                    l'administration
                  </p>
                </div>

                {/* Groups Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Groupes et permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {USER_GROUPS.map((group) => (
                      <div
                        key={group.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${group.color}`}
                          >
                            {group.name}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {group.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Add New User */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    Créer un nouveau compte
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-username"
                        className="text-sm font-medium text-slate-700"
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
                        className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-password"
                        className="text-sm font-medium text-slate-700"
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
                        className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Nom complet
                      </Label>
                      <Input
                        id="new-auth-name"
                        value={newAuthUser.name}
                        onChange={(e) =>
                          setNewAuthUser({
                            ...newAuthUser,
                            name: e.target.value,
                          })
                        }
                        placeholder="Marie Dubois"
                        className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-email"
                        className="text-sm font-medium text-slate-700"
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
                        className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-role"
                        className="text-sm font-medium text-slate-700"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                      >
                        <option value="secretaire">Secrétaire</option>
                        <option value="delegue">Délégué syndical</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-group"
                        className="text-sm font-medium text-slate-700"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                      >
                        {USER_GROUPS.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-auth-section"
                        className="text-sm font-medium text-slate-700"
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
                        className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddAuthUser}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Créer
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Users List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Comptes existants
                  </h3>
                  {authUsers.map((user) => {
                    const groupInfo = getGroupInfo(user.group);
                    return (
                      <Card
                        key={user.id}
                        className="p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`auth-username-${user.id}`}
                              className="text-sm font-medium text-slate-700"
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
                              className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`auth-name-${user.id}`}
                              className="text-sm font-medium text-slate-700"
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
                              className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`auth-email-${user.id}`}
                              className="text-sm font-medium text-slate-700"
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
                              className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`auth-role-${user.id}`}
                              className="text-sm font-medium text-slate-700"
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
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                            >
                              <option value="secretaire">Secrétaire</option>
                              <option value="delegue">Délégué</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`auth-group-${user.id}`}
                              className="text-sm font-medium text-slate-700"
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
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                            >
                              {USER_GROUPS.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`auth-section-${user.id}`}
                              className="text-sm font-medium text-slate-700"
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
                              className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Statut
                            </Label>
                            <div className="flex items-center gap-2 pt-2">
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
                                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm">
                                {user.active ? "Actif" : "Inactif"}
                              </span>
                            </div>
                            {groupInfo && (
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${groupInfo.color}`}
                              >
                                {groupInfo.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAuthUser(user.id)}
                              className="w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === "video" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Configuration vidéo et météo
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Gérez le contenu multimédia du tableau de bord
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Vidéo institutionnelle
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="video-url"
                          className="text-sm font-medium text-slate-700"
                        >
                          URL de la vidéo
                        </Label>
                        <Input
                          id="video-url"
                          value={data.videoUrl}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              videoUrl: e.target.value,
                            }))
                          }
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="mt-2 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                          Accepte les liens YouTube, Vimeo ou liens directs vers
                          des vidéos
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Configuration météo
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="weather-city"
                          className="text-sm font-medium text-slate-700"
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
                          className="mt-2 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                          La météo se met à jour automatiquement toutes les
                          minutes
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Alert Tab */}
            {activeTab === "alert" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Bandeau d'alerte
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Diffusez des informations importantes en temps réel
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="alert-text"
                        className="text-sm font-medium text-slate-700"
                      >
                        Texte du bandeau défilant
                      </Label>
                      <Textarea
                        id="alert-text"
                        value={data.alertText}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            alertText: e.target.value,
                          }))
                        }
                        placeholder="🚨 APPEL CGT FTM - Négociation collective métallurgie - Jeudi 21 mars à 14h"
                        rows={4}
                        className="mt-2 border-slate-200 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        Ce texte défilera en haut du tableau de bord. Utilisez
                        des émojis pour plus d'impact.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Message syndical
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Communiquez avec vos adhérents
                  </p>
                </div>

                <Card className="p-6">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="social-name"
                          className="text-sm font-medium text-slate-700"
                        >
                          Nom du délégué
                        </Label>
                        <Input
                          id="social-name"
                          value={data.socialPost.name}
                          onChange={(e) =>
                            updateSocialPost("name", e.target.value)
                          }
                          placeholder="Sophie Lefebvre"
                          className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="social-photo"
                          className="text-sm font-medium text-slate-700"
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
                          className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="social-text"
                        className="text-sm font-medium text-slate-700"
                      >
                        Message
                      </Label>
                      <Textarea
                        id="social-text"
                        value={data.socialPost.text}
                        onChange={(e) =>
                          updateSocialPost("text", e.target.value)
                        }
                        placeholder="Fière de représenter nos adhérents à la négociation salariale..."
                        rows={4}
                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="social-hashtag"
                        className="text-sm font-medium text-slate-700"
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
                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tributes Tab */}
            {activeTab === "tributes" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Gestion des Hommages
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Ajoutez et gérez les hommages qui défilent toutes les 30
                    secondes
                  </p>
                </div>

                {/* Add new tribute */}
                <Card className="p-6 border-pink-200 bg-pink-50/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-pink-600" />
                    Ajouter un hommage
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="tribute-name"
                          className="text-sm font-medium text-slate-700"
                        >
                          Nom de la personne *
                        </Label>
                        <Input
                          id="tribute-name"
                          value={newTribute.name}
                          onChange={(e) =>
                            setNewTribute({
                              ...newTribute,
                              name: e.target.value,
                            })
                          }
                          placeholder="Henri Krasucki"
                          className="border-slate-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="tribute-photo"
                          className="text-sm font-medium text-slate-700"
                        >
                          URL de la photo
                        </Label>
                        <Input
                          id="tribute-photo"
                          value={newTribute.photo}
                          onChange={(e) =>
                            setNewTribute({
                              ...newTribute,
                              photo: e.target.value,
                            })
                          }
                          placeholder="https://..."
                          className="border-slate-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="tribute-text"
                        className="text-sm font-medium text-slate-700"
                      >
                        Texte d'hommage *
                      </Label>
                      <Textarea
                        id="tribute-text"
                        value={newTribute.text}
                        onChange={(e) =>
                          setNewTribute({ ...newTribute, text: e.target.value })
                        }
                        placeholder="Secrétaire général de la CGT de 1982 à 1992. Figure emblématique du syndicalisme français..."
                        rows={3}
                        className="border-slate-200 focus:border-pink-500 focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddTribute}
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                        disabled={
                          !newTribute.name.trim() || !newTribute.text.trim()
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter l'hommage
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Tributes List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Hommages existants ({data.tributes.length})
                    </h3>
                    {data.tributes.length > 1 && (
                      <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        ⏱️ Rotation automatique : 30 secondes
                      </div>
                    )}
                  </div>

                  {data.tributes.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Aucun hommage configuré
                      </h3>
                      <p className="text-gray-500">
                        Ajoutez votre premier hommage pour commencer
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {data.tributes.map((tribute, index) => (
                        <Card
                          key={tribute.id}
                          className="p-6 hover:shadow-md transition-shadow border-l-4 border-pink-500"
                        >
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
                            <div className="flex-1 min-w-0">
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
                                        tribute.dateAdded,
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 text-sm leading-relaxed">
                                    {tribute.text}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveTribute(tribute.id)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
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
