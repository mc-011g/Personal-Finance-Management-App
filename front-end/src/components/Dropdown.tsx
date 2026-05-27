import { useContext, type RefObject } from "react";
import { DropdownContext } from "../context/DropdownContext";

const Dropdown = ({ items, ref, dateSelector }: { dateSelector?: boolean, items: React.ReactNode[], ref: RefObject<HTMLDivElement | null> | undefined }) => {

    const dropdownContext = useContext(DropdownContext);

    const containerStyle = () => {
        if (dateSelector) {
            return "top-full";
        } else {
            return "bottom-full";
        }
    }

    return (
        <div ref={ref} className={`${containerStyle()} border-1 border-gray-400 rounded-sm absolute left-full flex flex-col text-start z-30 bg-white`}>

            {items.map((item, index) => {
                return dateSelector ?
                    <div className={`z-10 inline-flex gap-2 items-center justify-center`} key={index}>
                        {item}
                    </div>
                    :
                    <div className={`hover:cursor-pointer hover:bg-gray-200 z-10 inline-flex gap-2 items-center justify-center`} key={index} onClick={() => dropdownContext?.handleCloseDropdown()}>
                        {item}
                    </div>
            }
            )}

        </div>
    )
}

export default Dropdown;