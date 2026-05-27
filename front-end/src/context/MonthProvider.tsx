import { useState } from "react";
import { MonthContext } from "./MonthContext";

export const MonthProvider = ({ children }: { children: React.ReactNode }) => {

    const setCurrentDateFormat = () => {  
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-02`;
    }

    const [month, setMonth] = useState<string>(setCurrentDateFormat());

    return (
        <MonthContext.Provider value={{ month, setMonth }}>
            {children}
        </MonthContext.Provider>
    )
}