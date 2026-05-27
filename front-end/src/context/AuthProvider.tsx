import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authClient } from "../lib/auth";
import type { Session, User } from "@neondatabase/neon-js/auth/types";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession().then((result) => {
            if (result.data?.session && result.data?.user) {
                setSession(result.data.session);
                setUser(result.data.user);
            }
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, setSession, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}