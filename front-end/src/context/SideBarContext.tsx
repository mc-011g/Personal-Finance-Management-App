import { createContext } from "react";

interface SideBarContextType {
    show: boolean
    setShow: (show: boolean) => void  
}

export const SideBarContext = createContext<SideBarContextType | null>(null);