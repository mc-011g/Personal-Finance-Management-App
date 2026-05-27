import { useContext, useState } from "react";
import { MonthContext } from "../context/MonthContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Button from "./Button";
import { DropdownContext } from "../context/DropdownContext";

const YearMonthDateSelectorDropdown = () => {

    const monthContext = useContext(MonthContext);
    const dropdownContext = useContext(DropdownContext);

    const [date, setDate] = useState<Date>(
        new Date(monthContext?.month ? monthContext.month : new Date())
    );

    const setContextCurrentDateFormat = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-02`;
    }

    const handleChangeYear = (direction: string) => {
        const newDate = new Date(date);      

        if (direction === "left") {
            newDate.setFullYear(newDate.getFullYear() - 1);
        } else if (direction === "right") {
            newDate.setFullYear(newDate.getFullYear() + 1);
        }

        setDate(newDate);
    }

    const handleChangeMonth = (monthNumber: number) => {
        const newDate = new Date(date);
        newDate.setMonth(monthNumber);
        setDate(newDate);
    }

    const handleSaveNewDate = () => {
        monthContext?.setMonth(setContextCurrentDateFormat(date));
        dropdownContext?.handleCloseDropdown();
    }

    const handleCancelSelection = () => {
        setDate(new Date(monthContext?.month ? monthContext.month : new Date()));
        dropdownContext?.handleCloseDropdown();
    }

    const months = [
        { id: 1, name: "Jan" },
        { id: 2, name: "Feb" },
        { id: 3, name: "Mar" },
        { id: 4, name: "Apr" },
        { id: 5, name: "May" },
        { id: 6, name: "Jun" },
        { id: 7, name: "Jul" },
        { id: 8, name: "Aug" },
        { id: 9, name: "Sep" },
        { id: 10, name: "Oct" },
        { id: 11, name: "Nov" },
        { id: 12, name: "Dec" },
    ]

    return (
        <div className="flex flex-col gap-2 rounded-md w-[256px]">

            <div className="p-4 inline-flex justify-between gap-2 items-center rounded-t-md bg-gray-100">
                <button className="hover:cursor-pointer p-2 rounded-md hover:bg-green-200 transition" onClick={() => handleChangeYear("left")} >
                    <ChevronLeftIcon className="size-4" />
                </button>              
                    <span className="transition">{date.toLocaleDateString("default", { month: "long", year: "numeric" })}</span>
                <button className="hover:cursor-pointer p-2 rounded-md hover:bg-green-200 transition" onClick={() => handleChangeYear("right")} >
                    <ChevronRightIcon className="size-4" />
                </button>
            </div>

            <div className="p-4 grid grid-cols-4 gap-2 h-full rounded-b-md bg-white">
                {months.map(month =>
                    <>
                        {date.getMonth() === (month.id - 1)
                            ?
                            <div key={month.id} className="flex transition justify-center items-center rounded-md bg-green-600 text-white p-2 w-full h-full">
                                {month.name}
                            </div>
                            :
                            <div key={month.id} 
                            className="flex transition items-center justify-center rounded-md hover:bg-green-200 hover:cursor-pointer p-2 w-full h-full"
                            onClick={() => handleChangeMonth(month.id-1)}
                            >
                                {month.name}
                            </div>
                        }
                    </>
                )}
            </div>

            <div className="inline-flex gap-2 justify-between p-4">
                <Button text="Cancel" variant="secondary" onClick={() => handleCancelSelection()} />
                <Button text="Change" variant="primary" onClick={() => handleSaveNewDate()} />
            </div>

        </div>
    )
}

export default YearMonthDateSelectorDropdown;