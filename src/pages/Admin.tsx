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
  getUsersData,
  addUser,
  updateUser,
  deleteUser,
  getRoleLabel,
  getRoleColor,
  type User,
} from "@/lib/users";
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
import { ArrowLeft, Save, Plus, Trash2, Users, LogOut } from "lucide-react";
import { logout, getCurrentUser } from "@/lib/auth";

const Admin = () => {
  const [data, setData] = useState(getDashboardData());
  const [usersData, setUsersData] = useState(getUsersData());
  const [authUsers, setAuthUsers] = useState(getAuthUsers());
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "secretaire" as User["role"],
    phone: "",
    section: "",
  });
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

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      addUser(newUser);
      setUsersData(getUsersData());
      setNewUser({
        name: "",
        email: "",
        role: "secretaire",
        phone: "",
        section: "",
      });
    }
  };

  const handleUpdateUser = (id: string, field: keyof User, value: string) => {
    updateUser(id, { [field]: value });
    setUsersData(getUsersData());
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      deleteUser(id);
      setUsersData(getUsersData());
    }
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
    <div className="min-h-screen cgt-gradient">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Professional Admin Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-cgt-red font-black text-xl">CGT</span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white text-shadow">
                  Administration CGT FTM
                </h1>
                <p className="text-white/90 text-lg font-medium">
                  Gestion du tableau de bord - Fédération des Travailleurs de la
                  Métallurgie
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="text-white/90 text-right mr-4">
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs opacity-80">{currentUser.section}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  size="lg"
                  className="bg-white/95 text-cgt-red hover:bg-white hover:shadow-lg transition-all duration-200 font-semibold border-0"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Tableau de bord
                </Button>

                <Button
                  onClick={handleSave}
                  size="lg"
                  className="bg-white text-cgt-red hover:bg-white/90 hover:shadow-lg transition-all duration-200 font-bold border-0"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="lg"
                  className="bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transition-all duration-200 font-semibold border-0"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="meetings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-7 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border-0">
            <TabsTrigger
              value="meetings"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Réunions
            </TabsTrigger>
            <TabsTrigger
              value="permanences"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Permanences
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Contacts
            </TabsTrigger>
            <TabsTrigger
              value="auth-users"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Connexions
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Vidéo
            </TabsTrigger>
            <TabsTrigger
              value="alert"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Alerte
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-cgt-red data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all text-sm"
            >
              Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meetings">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-cgt-gray">
                  Gestion des réunions CGT
                </h2>
                <Button
                  onClick={addMeeting}
                  className="bg-cgt-red text-white hover:bg-cgt-red-dark font-semibold px-6 py-3 rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une réunion
                </Button>
              </div>

              <div className="space-y-4">
                {data.meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <Label htmlFor={`meeting-title-${meeting.id}`}>
                        Titre
                      </Label>
                      <Input
                        id={`meeting-title-${meeting.id}`}
                        value={meeting.title}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "title", e.target.value)
                        }
                        placeholder="Titre de la réunion"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`meeting-time-${meeting.id}`}>
                        Heure
                      </Label>
                      <Input
                        id={`meeting-time-${meeting.id}`}
                        value={meeting.time}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "time", e.target.value)
                        }
                        placeholder="14:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`meeting-room-${meeting.id}`}>
                        Salle
                      </Label>
                      <Input
                        id={`meeting-room-${meeting.id}`}
                        value={meeting.room}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "room", e.target.value)
                        }
                        placeholder="Salle principale"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMeeting(meeting.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-cgt-gray">
                  Gestion des utilisateurs CGT FTM
                </h2>
              </div>

              {/* Add new user form */}
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-cgt-gray mb-4">
                  Ajouter un nouvel utilisateur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="new-user-name">Nom complet</Label>
                    <Input
                      id="new-user-name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="Marie Dubois"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-user-email">Email</Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="marie.dubois@cgt-ftm.fr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-user-role">Rôle</Label>
                    <select
                      id="new-user-role"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as User["role"],
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="secretaire">Secrétaire</option>
                      <option value="delegue">Délégué syndical</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="new-user-phone">Téléphone</Label>
                    <Input
                      id="new-user-phone"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      placeholder="01.23.45.67.89"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-user-section">Section</Label>
                    <Input
                      id="new-user-section"
                      value={newUser.section}
                      onChange={(e) =>
                        setNewUser({ ...newUser, section: e.target.value })
                      }
                      placeholder="Secrétariat FTM"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddUser}
                      className="bg-cgt-red text-white hover:bg-cgt-red-dark font-semibold px-6 py-3 rounded-xl w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Users list */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-cgt-gray">
                  Utilisateurs existants
                </h3>
                {usersData.users.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <Label htmlFor={`user-name-${user.id}`}>Nom</Label>
                      <Input
                        id={`user-name-${user.id}`}
                        value={user.name}
                        onChange={(e) =>
                          handleUpdateUser(user.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`user-email-${user.id}`}>Email</Label>
                      <Input
                        id={`user-email-${user.id}`}
                        type="email"
                        value={user.email}
                        onChange={(e) =>
                          handleUpdateUser(user.id, "email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`user-role-${user.id}`}>Rôle</Label>
                      <select
                        id={`user-role-${user.id}`}
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateUser(user.id, "role", e.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="secretaire">Secrétaire</option>
                        <option value="delegue">Délégué syndical</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`user-phone-${user.id}`}>Téléphone</Label>
                      <Input
                        id={`user-phone-${user.id}`}
                        value={user.phone || ""}
                        onChange={(e) =>
                          handleUpdateUser(user.id, "phone", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`user-section-${user.id}`}>Section</Label>
                      <Input
                        id={`user-section-${user.id}`}
                        value={user.section || ""}
                        onChange={(e) =>
                          handleUpdateUser(user.id, "section", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="auth-users">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-cgt-gray">
                    Comptes de connexion CGT FTM
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Gestion des utilisateurs pouvant se connecter à
                    l'administration
                  </p>
                </div>
              </div>

              {/* Groups info */}
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-cgt-gray mb-4">
                  Groupes et permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {USER_GROUPS.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${group.color}`}
                        >
                          {group.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {group.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add new auth user form */}
              <div className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-200">
                <h3 className="text-xl font-bold text-cgt-gray mb-4">
                  Ajouter un compte de connexion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="new-auth-username">Nom d'utilisateur</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-auth-password">Mot de passe</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-auth-name">Nom complet</Label>
                    <Input
                      id="new-auth-name"
                      value={newAuthUser.name}
                      onChange={(e) =>
                        setNewAuthUser({ ...newAuthUser, name: e.target.value })
                      }
                      placeholder="Marie Dubois"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-auth-email">Email</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-auth-role">Rôle</Label>
                    <select
                      id="new-auth-role"
                      value={newAuthUser.role}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          role: e.target.value as AuthUser["role"],
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="secretaire">Secrétaire</option>
                      <option value="delegue">Délégué syndical</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="new-auth-group">Groupe</Label>
                    <select
                      id="new-auth-group"
                      value={newAuthUser.group}
                      onChange={(e) =>
                        setNewAuthUser({
                          ...newAuthUser,
                          group: e.target.value as AuthUser["group"],
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {USER_GROUPS.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="new-auth-section">Section</Label>
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
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddAuthUser}
                      className="bg-cgt-red text-white hover:bg-cgt-red-dark font-semibold px-6 py-3 rounded-xl w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer le compte
                    </Button>
                  </div>
                </div>
              </div>

              {/* Auth users list */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-cgt-gray">
                  Comptes de connexion existants
                </h3>
                {authUsers.map((user) => {
                  const groupInfo = getGroupInfo(user.group);
                  return (
                    <div
                      key={user.id}
                      className="grid grid-cols-1 md:grid-cols-8 gap-4 p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div>
                        <Label htmlFor={`auth-username-${user.id}`}>
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
                        />
                      </div>
                      <div>
                        <Label htmlFor={`auth-name-${user.id}`}>Nom</Label>
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
                        />
                      </div>
                      <div>
                        <Label htmlFor={`auth-email-${user.id}`}>Email</Label>
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
                        />
                      </div>
                      <div>
                        <Label htmlFor={`auth-role-${user.id}`}>Rôle</Label>
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
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="secretaire">Secrétaire</option>
                          <option value="delegue">Délégué</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`auth-group-${user.id}`}>Groupe</Label>
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
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {USER_GROUPS.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`auth-section-${user.id}`}>
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
                        />
                      </div>
                      <div>
                        <Label>Statut</Label>
                        <div className="flex items-center gap-2 mt-2">
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
                            className="rounded"
                          />
                          <span className="text-sm">
                            {user.active ? "Actif" : "Inactif"}
                          </span>
                        </div>
                        {groupInfo && (
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${groupInfo.color}`}
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
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="permanences">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-cgt-gray">
                  Gestion des permanences CGT
                </h2>
                <Button
                  onClick={addPermanence}
                  className="bg-cgt-red text-white hover:bg-cgt-red-dark font-semibold px-6 py-3 rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une permanence
                </Button>
              </div>

              <div className="space-y-4">
                {data.permanences.map((permanence) => (
                  <div
                    key={permanence.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                  >
                    <div>
                      <Label htmlFor={`permanence-name-${permanence.id}`}>
                        Nom
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
                      />
                    </div>
                    <div>
                      <Label htmlFor={`permanence-time-${permanence.id}`}>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor={`permanence-theme-${permanence.id}`}>
                        Thème
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
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePermanence(permanence.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <h2 className="text-3xl font-black text-cgt-gray mb-8">
                Configuration vidéo institutionnelle
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-url">URL de la vidéo</Label>
                  <Input
                    id="video-url"
                    value={data.videoUrl}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepte les liens YouTube, Vimeo ou liens directs vers des
                    vidéos
                  </p>
                </div>

                <div>
                  <Label htmlFor="weather-city">Ville pour la météo</Label>
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
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="alert">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <h2 className="text-3xl font-black text-cgt-gray mb-8">
                Bandeau d'alerte CGT
              </h2>

              <div>
                <Label htmlFor="alert-text">Texte du bandeau</Label>
                <Textarea
                  id="alert-text"
                  value={data.alertText}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, alertText: e.target.value }))
                  }
                  placeholder="🔴 MANIFESTATION NATIONALE - Jeudi 21 mars à 14h - Place de la République"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ce texte défilera en haut de l'écran. Utilisez des émojis pour
                  plus d'impact.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 professional-shadow rounded-2xl">
              <h2 className="text-3xl font-black text-cgt-gray mb-8">
                Message syndical officiel
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="social-name">Nom</Label>
                  <Input
                    id="social-name"
                    value={data.socialPost.name}
                    onChange={(e) => updateSocialPost("name", e.target.value)}
                    placeholder="Sophie Lefebvre"
                  />
                </div>

                <div>
                  <Label htmlFor="social-photo">URL de la photo</Label>
                  <Input
                    id="social-photo"
                    value={data.socialPost.photo}
                    onChange={(e) => updateSocialPost("photo", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="social-text">Message</Label>
                  <Textarea
                    id="social-text"
                    value={data.socialPost.text}
                    onChange={(e) => updateSocialPost("text", e.target.value)}
                    placeholder="Fière de représenter nos adhérents..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="social-hashtag">Hashtag</Label>
                  <Input
                    id="social-hashtag"
                    value={data.socialPost.hashtag}
                    onChange={(e) =>
                      updateSocialPost("hashtag", e.target.value)
                    }
                    placeholder="#SolidaritéSyndicale"
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
