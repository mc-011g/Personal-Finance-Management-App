import type { Session, User } from "@neondatabase/neon-js/auth/types";
import { createContext } from "react";

interface AuthContextType {
    session: Session | null,
    user: User | null,
    loading: boolean,
    setSession: (session: Session | null) => void,
    setUser: (user: User | null) => void
}

export const AuthContext = createContext<AuthContextType | null>(null);