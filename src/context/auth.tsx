import React, { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
