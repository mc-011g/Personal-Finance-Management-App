import { useContext, useEffect, useState, type SubmitEvent } from "react";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import Button from "../components/Button";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { authClient } from "../lib/auth";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { SideBarContext } from "../context/SideBarContext";

const Profile = () => {

    const authContext = useContext(AuthContext);
    const token = authContext?.session?.token;

    const initialEmail = authContext?.user?.email ?? "";
    const initialFirstName = authContext?.user?.name.trim().split(" ")[0] ?? "";
    const initialLastName = authContext?.user?.name.trim().split(" ")[1] ?? "";

    const [firstName, setFirstName] = useState<string>(initialFirstName);
    const [lastName, setLastName] = useState<string>(initialLastName);

    const [showButtons, setShowButtons] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sentPasswordResetLink, setSentPasswordResetLink] = useState<boolean>(false);

    const [message, setMessage] = useState<string | null>(null);

    const sideBarContext = useContext(SideBarContext);

    useEffect(() => {
        const getProfileInformation = () => {
            setFirstName(initialFirstName);
            setLastName(initialLastName);
        }
        getProfileInformation();
    }, [authContext?.user, initialFirstName, initialLastName]);

    useEffect(() => {
        const checkForProfileChanges = () => {
            if (
                (firstName !== initialFirstName) ||
                (lastName !== initialLastName)
            ) {
                setMessage(null);
                setShowButtons(true);
            } else {
                setShowButtons(false);
            }
        }
        checkForProfileChanges();
    }, [firstName, initialFirstName, initialLastName, lastName]);

    const handleResetProfileInformation = () => {
        setFirstName(initialFirstName);
        setLastName(initialLastName);
    }

    const handleResetPassword = async () => {

        try {
            const { error, data } = await authClient.requestPasswordReset({
                email: initialEmail,
                redirectTo: `${import.meta.env.VITE_FRONTEND_URL}/reset-password`
            })
            setMessage(data?.message ?? "");
            setSentPasswordResetLink(true);

            if (error) {
                setError(error?.message ?? "An unexpected error occured.");
                return;
            }
        } catch (error) {
            setError((error as { message: string }).message || 'Password change failed.');
            return;
        }
    }

    const handleSaveNames = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { error } = await authClient.updateUser({ name: (firstName + " " + lastName) });
            if (error) {
                setError(error.message ?? "An unexpected error occurred.");
            }
        } catch (error) {
            setError((error as { message: string }).message || "An unexpected error occurred.");
            return;
        }

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/users`,
                {
                    firstName,
                    lastName
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
                return;
            } else {
                setError("An unexpected error occurred.");
                return;
            }
        }

        const refreshUser = async () => {
            try {
                const { data, error } = await authClient.getSession();
                if (data?.session) {
                    authContext?.setUser(data.user);
                }
                if (error) {
                    setError(error.message ?? "An unexpected error occurred.");
                    return;
                }
            } catch (error) {
                setError((error as { message: string }).message || "An unexpected error occurred.");
                return;
            }
        };
        refreshUser();

        setShowButtons(false);
        setMessage("Saved name changes.");
    }

    return (
        <PageContainer>
            <div className="bg-gray-100 p-4 flex flex-row justify-between items-start">
                <div className="pb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Your Profile</h1>
                </div>

                <button className={`${sideBarContext?.show ? 'hidden md:block' : 'block md:hidden'} hover:cursor-pointer`} onClick={() => sideBarContext?.setShow(true)}>
                    <Bars3Icon className="size-8" />
                </button>
            </div>

            <form className="p-4 flex flex-col bg-white gap-2 sm:gap-4 h-full w-full justify-between" onSubmit={(e) => handleSaveNames(e)}>

                <div className="flex flex-col gap-2 sm:max-w-[65%]">
                    <label className="flex flex-col gap-1 mb-4">
                        Email Address:
                        <div>{initialEmail}</div>
                    </label>

                    <div className="flex flex-col gap-2" >
                        <label className="flex flex-col gap-1">
                            First Name:
                            <Input required maxLength={50} name="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        </label>

                        <label className="flex flex-col gap-1 mb-4">
                            Last Name:
                            <Input required maxLength={50} name="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                        </label>
                    </div>

                    <div>
                        <Button type="button" text="Reset Password" variant="secondary" disabled={sentPasswordResetLink} onClick={() => handleResetPassword()} />
                    </div>
                </div>

                {message && !error &&
                    <div className="text-green-600 h-full flex items-end">{message}</div>
                }
                {error && !message &&
                    <div className="text-red-600 h-full flex items-end">{error}</div>
                }

                {
                    showButtons &&
                    <div className="inline-flex gap-2 justify-end">
                        <Button text="Reset" variant="secondary" type="button" onClick={() => handleResetProfileInformation()} />
                        <Button text="Save Changes" variant="primary" type="submit" />
                    </div>
                }
            </form>

        </PageContainer>
    )
}

export default Profile;