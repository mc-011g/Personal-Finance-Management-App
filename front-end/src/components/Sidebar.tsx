import { ArrowRightStartOnRectangleIcon, ChartBarIcon, CreditCardIcon, CurrencyDollarIcon, FolderIcon, PercentBadgeIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Link, NavLink } from "react-router";
import Dropdown from "./Dropdown";
import { useContext } from "react";
import { DropdownContext } from "../context/DropdownContext";
import { SideBarContext } from "../context/SideBarContext";
import { AuthContext } from "../context/AuthContext";
import { authClient } from "../lib/auth";

const Sidebar = () => {

    const dropdownContext = useContext(DropdownContext);
    const dropdownRef = dropdownContext?.dropdownRef;
    const dropdown = dropdownContext?.dropdown;
    const sideBarContext = useContext(SideBarContext);
    const authContext = useContext(AuthContext);

    const getUserFirstAndLastName = () => {
        let name = '';

        if (authContext?.user?.name) {
            const nameString = authContext?.user?.name.trim().split(" ");

            if (nameString.length === 1) {
                name = nameString[0];
            } else {
                name = nameString[0] + " " + nameString[1];
            }
        }
        return name;
    }

    const getUserFirstInitial = () => {
        if (authContext?.user?.name) {
            return authContext.user.name.charAt(0).toUpperCase();
        } else {
            return '';
        }
    }

    const handleLogout = async () => {
        await authClient.signOut();
        authContext?.setSession(null);
        authContext?.setUser(null);
    }

    return (
        <>
            <div className={`z-100 ${sideBarContext?.show ? 'absolute bg-white flex h-full shadow-lg shadow-black' : 'hidden md:flex'} flex-col p-4 border-r-1 border-r-gray-300 flex-col w-full max-w-[256px]`}>

                <div className="flex items-start justify-between gap-3">
                    <p className="text-md/[18px] sm:text-lg/[20px] md:text-xl/[24px] pb-8 font-bold">
                        Personal Financial Management App
                    </p>
                    <button className={`${sideBarContext?.show ? 'block' : 'hidden'} hover:cursor-pointer`} onClick={() => sideBarContext?.setShow(false)}>
                        <XMarkIcon className="size-8" />
                    </button>
                </div>

                <nav className="flex flex-col gap-4">
                    <NavLink
                        to={'/dashboard'}
                        className={"inline-flex items-center gap-2 transition hover:text-green-700"}
                        onClick={() => sideBarContext?.setShow(false)
                        }
                    >
                        <ChartBarIcon className="size-4" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to={'/transactions'}
                        className={"inline-flex items-center gap-2 transition hover:text-green-700"}
                        onClick={() => sideBarContext?.setShow(false)}
                    >
                        <CurrencyDollarIcon className="size-4" />
                        Transactions
                    </NavLink>
                    <NavLink
                        to={'/budgets'}
                        className={"inline-flex items-center gap-2 transition hover:text-green-700"}
                        onClick={() => sideBarContext?.setShow(false)}
                    >
                        <PercentBadgeIcon className="size-4" />
                        Budgets
                    </NavLink>
                    <NavLink
                        to={'/categories'}
                        className={"inline-flex items-center gap-2 transition hover:text-green-700"}
                        onClick={() => sideBarContext?.setShow(false)}
                    >
                        <FolderIcon className="size-4" />
                        Categories
                    </NavLink>
                    <NavLink
                        to={'/financial-accounts'}
                        className={"inline-flex items-center gap-2 transition hover:text-green-700"}
                        onClick={() => sideBarContext?.setShow(false)}
                    >
                        <CreditCardIcon className="size-4" />
                        Financial Accounts
                    </NavLink>
                </nav>

                <div className="flex pt-4 flex-col h-full justify-between">

                    <div className="flex flex-row gap-2 items-center mt-auto">
                        <div className="relative">
                            {
                                dropdown?.id === "userProfileIcon" &&
                                <Dropdown ref={dropdownRef} items={[
                                    <Link
                                        className="inline-flex gap-2 items-center px-2 py-1"
                                        to={'/profile'}
                                        onClick={() => sideBarContext?.setShow(false)}
                                    >
                                        <UserIcon className="size-4" /> Profile
                                    </Link>
                                    ,
                                    <button className="inline-flex gap-2 items-center px-2 py-1 hover:cursor-pointer" onClick={() => handleLogout()}>
                                        <ArrowRightStartOnRectangleIcon className="size-4" /> Logout
                                    </button>
                                ]} />
                            }

                            {/* user image or initial */}
                            <button
                                role="button" tabIndex={0}
                                className="text-xl font-semibold hover:cursor-pointer bg-red-400 size-12 md:min-w-12 md:min-h-12 rounded-full flex items-center justify-center"
                                onClick={() => dropdownContext?.handleShowDropdown?.("userProfileIcon")}
                            >
                                {getUserFirstInitial()}
                            </button>

                        </div>
                        <p className="flex flex-col h-fit break-words">
                            {getUserFirstAndLastName()}
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${sideBarContext?.show ? 'block' : 'hidden'} absolute bg-black/40 inset-0 z-90`} onClick={() => sideBarContext?.setShow(false)}>
            </div>

        </>
    )
}

export default Sidebar;