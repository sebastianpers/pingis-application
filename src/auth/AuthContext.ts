import { createContext, useContext } from "react";

export type AuthContextValue = {
  /* Visar modal och resolve:ar true/false när användaren godkänner/avbryter */
  requestAuth: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth måste användas inuti <AuthProvider>.");

  return ctx;
}
