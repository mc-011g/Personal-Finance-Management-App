import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { RedirectToSignIn, SignedIn, SignedOut } from "@neondatabase/neon-js/auth/react";
import { useLocation } from "react-router";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const location = useLocation();

    const isAccountSetup = location.pathname === "/account-setup";

    return (
        <>
            <SignedIn>
                <div className="flex flex-row w-screen h-screen overflow-y-auto overflow-x-hidden">

                    {!isAccountSetup &&
                        <Sidebar />
                    }

                    {children}
                </div>
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    )
}

export default ProtectedRoute;