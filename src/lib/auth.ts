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
  role: "secretaire" | "delegue" | "admin";
  group: "admin" | "editor" | "viewer";
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

// Groups with permissions
export const USER_GROUPS: UserGroup[] = [
  {
    id: "admin",
    name: "Administrateur",
    permissions: ["all"],
    color: "bg-red-100 text-red-800",
    description: "Accès complet à toutes les fonctionnalités",
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
    ],
    color: "bg-blue-100 text-blue-800",
    description: "Peut modifier le contenu du tableau de bord",
  },
  {
    id: "viewer",
    name: "Observateur",
    permissions: ["view_dashboard"],
    color: "bg-gray-100 text-gray-800",
    description: "Lecture seule du tableau de bord",
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
    role: "secretaire",
    group: "admin",
    section: "Secrétariat FTM",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "jc.martin",
    password: "cgtftm2024",
    name: "Jean-Claude Martin",
    email: "jc.martin@cgt-ftm.fr",
    role: "delegue",
    group: "editor",
    section: "Délégués du personnel",
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
    section: "Direction",
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

export const authenticateUser = (
  credentials: LoginCredentials,
): AuthUser | null => {
  const users = getAuthUsers();
  const user = users.find(
    (u) => u.username === credentials.username && u.active,
  );

  if (user && credentials.password === user.password) {
    // Update last login
    updateAuthUser(user.id, { lastLogin: new Date().toISOString() });
    return { ...user, lastLogin: new Date().toISOString() };
  }

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
  return user?.group === "admin" || user?.group === "editor";
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
    secretaire: "Secrétaire",
    delegue: "Délégué syndical",
    admin: "Administrateur",
  };
  return roleLabels[role];
};
