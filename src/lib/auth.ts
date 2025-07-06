export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  name: string;
  email: string;
  role: "admin" | "editor";
  group: "admin" | "editor";
  section: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UserGroup {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description: string;
}

// Groups with permissions - Seulement 2 types
export const USER_GROUPS: UserGroup[] = [
  {
    id: "admin",
    name: "Administrateur",
    permissions: ["all"],
    color: "bg-red-100 text-red-800",
    description: "Accès complet - Gère tout y compris les utilisateurs",
  },
  {
    id: "editor",
    name: "Éditeur",
    permissions: [
      "edit_content",
      "manage_meetings",
      "manage_permanences",
      "edit_social",
      "edit_video",
      "manage_tributes",
      "edit_divers",
      "view_settings",
    ],
    color: "bg-blue-100 text-blue-800",
    description: "Peut tout modifier sauf les utilisateurs",
  },
];

// Default admin users for CGT FTM
const DEFAULT_USERS: AuthUser[] = [
  {
    id: "1",
    username: "marie.dubois",
    password: "cgtftm2024",
    name: "Marie Dubois",
    email: "marie.dubois@cgt-ftm.fr",
    role: "admin",
    group: "admin",
    section: "CGT FTM",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "jc.martin",
    password: "cgtftm2024",
    name: "Jean-Claude Martin",
    email: "jc.martin@cgt-ftm.fr",
    role: "editor",
    group: "editor",
    section: "CGT FTM",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    username: "admin.cgt",
    password: "cgtftm2024",
    name: "Administrateur CGT FTM",
    email: "admin@cgt-ftm.fr",
    role: "admin",
    group: "admin",
    section: "CGT FTM",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

// Auth users management
export const getAuthUsers = (): AuthUser[] => {
  const stored = localStorage.getItem("cgt-ftm-auth-users");
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
};

export const saveAuthUsers = (users: AuthUser[]): void => {
  localStorage.setItem("cgt-ftm-auth-users", JSON.stringify(users));
};

export const addAuthUser = (user: Omit<AuthUser, "id" | "createdAt">): void => {
  const users = getAuthUsers();
  const newUser: AuthUser = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveAuthUsers(users);
};

export const updateAuthUser = (
  id: string,
  updates: Partial<AuthUser>,
): void => {
  const users = getAuthUsers();
  const updatedUsers = users.map((user) =>
    user.id === id ? { ...user, ...updates } : user,
  );
  saveAuthUsers(updatedUsers);
};

export const deleteAuthUser = (id: string): void => {
  const users = getAuthUsers();
  const filteredUsers = users.filter((user) => user.id !== id);
  saveAuthUsers(filteredUsers);
};

export const authenticateUser = async (
  credentials: LoginCredentials,
): Promise<AuthUser | null> => {
  try {
    console.log("🔍 Authentification UNIQUEMENT avec Supabase");

    // Utiliser UNIQUEMENT les utilisateurs Supabase
    const { getUsers } = await import("./database");
    const supabaseUsers = await getUsers();

    console.log(
      "👥 Utilisateurs Supabase disponibles:",
      supabaseUsers.map((u) => ({
        username: u.username,
        role: u.role,
        is_admin: u.is_admin,
        is_active: u.is_active,
      })),
    );

    // Chercher l'utilisateur dans Supabase UNIQUEMENT
    const supabaseUser = supabaseUsers.find(
      (u) => u.username === credentials.username && u.is_active,
    );

    if (supabaseUser) {
      console.log(
        "✅ Utilisateur trouvé dans Supabase:",
        supabaseUser.username,
      );

      // Pour la démo, vérifier avec des mots de passe simples
      // En production, utilisez bcrypt.compare avec le hash stocké
      const validPasswords = ["cgtftm2024", "admin", "test", "password"];

      if (validPasswords.includes(credentials.password)) {
        console.log("✅ Authentification réussie");

        // Debug des rôles
        console.log("🔍 Détails utilisateur Supabase:", {
          username: supabaseUser.username,
          is_admin: supabaseUser.is_admin,
          is_admin_type: typeof supabaseUser.is_admin,
          role: supabaseUser.role,
        });

        // Convertir l'utilisateur Supabase vers le format AuthUser
        // Seulement 2 types : Admin (gère tout) et Éditeur (tout sauf users)
        // Détecter admin : soit is_admin=true, soit username contient "admin"
        const isAdmin =
          supabaseUser.is_admin === true ||
          supabaseUser.is_admin === "true" ||
          supabaseUser.username.toLowerCase().includes("admin");

        const authUser: AuthUser = {
          id: supabaseUser.id,
          username: supabaseUser.username,
          password: credentials.password, // Ne pas stocker le vrai mot de passe
          name: supabaseUser.username,
          email: supabaseUser.email || "",
          role: isAdmin ? "admin" : "editor", // admin ou editor
          group: isAdmin ? "admin" : "editor", // admin ou editor
          section: "CGT FTM",
          active: supabaseUser.is_active,
          lastLogin: new Date().toISOString(),
          createdAt: supabaseUser.created_at,
        };

        console.log("✅ AuthUser créé:", {
          username: authUser.username,
          role: authUser.role,
          group: authUser.group,
          isAdmin: isAdmin,
        });

        return authUser;
      } else {
        console.log("❌ Mot de passe incorrect");
      }
    } else {
      console.log("❌ Utilisateur non trouvé ou inactif dans Supabase");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'authentification Supabase:", error);
  }

  console.log("❌ Authentification échouée - utilisateur non autorisé");
  return null;
};

export const getCurrentUser = (): AuthUser | null => {
  const stored = sessionStorage.getItem("cgt-ftm-auth-user");
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: AuthUser): void => {
  sessionStorage.setItem("cgt-ftm-auth-user", JSON.stringify(user));
};

export const logout = (): void => {
  sessionStorage.removeItem("cgt-ftm-auth-user");
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasAdminAccess = (user: AuthUser | null): boolean => {
  return user?.group === "admin";
};

export const hasEditorAccess = (user: AuthUser | null): boolean => {
  return user?.group === "admin" || user?.group === "editor";
};

export const canManageUsers = (user: AuthUser | null): boolean => {
  return user?.group === "admin";
};

export const hasPermission = (
  user: AuthUser | null,
  permission: string,
): boolean => {
  if (!user || !user.active) return false;

  const group = USER_GROUPS.find((g) => g.id === user.group);
  if (!group) return false;

  return (
    group.permissions.includes("all") || group.permissions.includes(permission)
  );
};

export const getGroupInfo = (groupId: string): UserGroup | undefined => {
  return USER_GROUPS.find((g) => g.id === groupId);
};

export const getRoleLabel = (role: AuthUser["role"]): string => {
  const roleLabels = {
    admin: "Administrateur",
    editor: "Éditeur",
  };
  return roleLabels[role];
};
