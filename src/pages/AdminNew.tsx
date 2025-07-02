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
} from "lucide-react";

// Import des styles améliorés
import "../styles/admin-improvements.css";

// Types temporaires pour éviter les erreurs
interface Meeting {
  id: string;
  title: string;
  time: string;
  room: string;
  category: string;
  date: string;
}

interface Tribute {
  id: string;
  name: string;
  photo: string;
  text: string;
  date_added: string;
}

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

const AdminNew = () => {
  const [activeTab, setActiveTab] = useState("meetings");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // États temporaires avec données par défaut
  const [meetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Assemblée Générale",
      time: "14:00",
      room: "Salle Rouge",
      category: "Assemblée Générale",
      date: new Date().toISOString().split("T")[0],
    },
  ]);

  const [tributes] = useState<Tribute[]>([
    {
      id: "1",
      name: "Henri Krasucki",
      photo: "",
      text: "Secrétaire général de la CGT",
      date_added: new Date().toISOString(),
    },
  ]);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "",
    room: "",
    category: "Assembl��e Générale",
    date: new Date().toISOString().split("T")[0],
  });

  const [newTribute, setNewTribute] = useState({
    name: "",
    photo: "",
    text: "",
  });

  const navigate = useNavigate();

  const navigationItems = [
    { id: "meetings", label: "Réunions", icon: Calendar, color: "blue" },
    { id: "tributes", label: "Hommages", icon: Heart, color: "pink" },
    { id: "video", label: "Médias", icon: Video, color: "orange" },
  ];

  const handleSave = () => {
    console.log("Sauvegarde...");
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
                    ? `bg-${item.color}-50 text-${item.color}-700 shadow-sm`
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? `text-${item.color}-600` : "text-slate-400 group-hover:text-slate-600"}`}
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
            <Button onClick={handleSave} className="admin-btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
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
                      <h2 className="text-2xl font-bold text-slate-800">
                        Réunions CGT FTM
                      </h2>
                      <p className="text-slate-600">
                        Planifiez et organisez les assemblées syndicales
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <span className="admin-connection-status">
                      <div className="admin-connection-dot"></div>
                      Base de données connectée
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
                      <h3 className="text-lg font-semibold text-slate-800">
                        Ajouter une réunion
                      </h3>
                      <p className="text-sm text-slate-600">
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
                      onClick={() => console.log("Ajouter réunion")}
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
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
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
                              onChange={() => {}}
                              className="admin-input w-full"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Heure</label>
                            <input
                              type="time"
                              value={meeting.time}
                              onChange={() => {}}
                              className="admin-input w-full"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Salle</label>
                            <input
                              type="text"
                              value={meeting.room}
                              onChange={() => {}}
                              className="admin-input w-full"
                            />
                          </div>
                          <div>
                            <label className="admin-label">Catégorie</label>
                            <select
                              value={meeting.category}
                              onChange={() => {}}
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
                        <div className="ml-4">
                          <button
                            onClick={() => console.log("Supprimer", meeting.id)}
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
                      <h2 className="text-2xl font-bold text-slate-800">
                        Hommages
                      </h2>
                      <p className="text-slate-600">
                        Gérez les hommages avec rotation automatique
                      </p>
                    </div>
                  </div>
                  <div className="admin-section-stats">
                    <span className="admin-connection-status">
                      <div className="admin-connection-dot"></div>
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
                      onClick={() => console.log("Ajouter hommage")}
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
                              onClick={() =>
                                console.log("Supprimer", tribute.id)
                              }
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

            {/* Other tabs would go here */}
            {activeTab === "video" && (
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNew;
