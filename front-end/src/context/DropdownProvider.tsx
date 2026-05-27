import { useEffect, useRef, useState } from "react";
import { DropdownContext } from "./DropdownContext";

export const DropdownProvider = ({ children }: { children: React.ReactNode }) => {

    const [dropdown, setDropdown] = useState<{ id: string } | null>(null);

    const handleShowDropdown = (id: string) => {        
        if (!dropdown) {
            setDropdown({ id });
        } else {         
            setDropdown(null);
        }
    }

    const handleCloseDropdown = () => {
        setDropdown(null);
    }

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutsideDropdown = (e: MouseEvent) => {

            if (dropdown?.id === "changeMonthYearSelector") {
                if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
                    return;
                }
                setDropdown(null);
                return;
            }

            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdown(null);
            }
        }

        document.addEventListener('mouseup', handleClickOutsideDropdown);

        return () => {
            document.removeEventListener('mouseup', handleClickOutsideDropdown);
        }
    }, [dropdown?.id]);

    return (
        <DropdownContext.Provider value={{ dropdownRef, handleShowDropdown, dropdown, handleCloseDropdown }}>
            {children}
        </DropdownContext.Provider>
    )

}