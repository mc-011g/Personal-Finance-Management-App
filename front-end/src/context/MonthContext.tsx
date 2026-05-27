import { createContext } from "react";

interface MonthContextType {
    month: string,
    setMonth: (month: string) => void
}

export const MonthContext = createContext<MonthContextType | null>(null);