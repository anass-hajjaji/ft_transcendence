import React from "react";

export interface User {
  id_user: number; // Correct ID from backend
  id?: number;     // Legacy support if needed
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
  wins?: number;
  losses?: number;
  createdAt?: string;
  twofa_enabled ?: boolean;
  
}

export const GlobalContext = React.createContext<{
  user: User | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
} | null>(null);

export function useGlobalContext() {
  const context = React.useContext(GlobalContext);
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContext.Provider"
    );
  }
  return context;
}