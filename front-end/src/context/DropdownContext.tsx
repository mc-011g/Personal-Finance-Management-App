import { createContext, type RefObject } from "react";

interface DropdownContextType {
    dropdownRef: RefObject<HTMLDivElement | null>,
    handleShowDropdown: (id: string) => void,
    dropdown: { id: string } | null,
    handleCloseDropdown: () => void
}

export const DropdownContext = createContext<DropdownContextType | null>(null);