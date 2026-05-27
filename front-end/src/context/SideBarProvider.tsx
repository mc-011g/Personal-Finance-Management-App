import { useState } from "react";
import { SideBarContext } from "./SideBarContext";

export const SideBarProvider = ({ children }: { children: React.ReactNode }) => {

    const [show, setShow] = useState<boolean>(false);

    return (
        <SideBarContext.Provider value={{ show, setShow }}>
            {children}
        </SideBarContext.Provider>
    )
}