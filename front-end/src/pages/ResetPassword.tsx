import { useContext, useEffect, useState } from "react";
import { authClient } from "../lib/auth";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import { AuthContext } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export const ResetPassword = () => {

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const authContext = useContext(AuthContext);

    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

    const token = new URLSearchParams(window.location.search).get('token');

    const navigate = useNavigate();
    const [passwordChangeSubmitted, setPasswordChangeSubmitted] = useState<boolean>(false);

    const handleNavigate = () => {
        let destination = '/auth/sign-in';

        if (authContext?.session && authContext.user) {
            destination = '/';
        }

        navigate(destination);
    }

    useEffect(() => {
        const checkPasswordMatch = () => {
            setMessage(null);
            setError(null);
            if (newPassword !== confirmNewPassword) {
                setPasswordsMatch(false);
            } else {
                setPasswordsMatch(true);
            }
        }
        checkPasswordMatch();
    }, [newPassword, confirmNewPassword]);

    const handleChangePassword = async () => {
        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        if ((newPassword.length < 8) && (confirmNewPassword.length < 8)) {
            setError("Please enter a password at least 8 characters long.");
            return;
        }
        if (passwordsMatch === false || !passwordsMatch) {
            setError("Please make sure new passwords match.");
            return;
        }

        try {      
            const { error } = await authClient.resetPassword({ token, newPassword });

            if (error) {
                throw error;
            }

            setError(null);
            setMessage('Password changed successfully.');
            setPasswordChangeSubmitted(true);
        } catch (error) {
            setError((error as { message?: string })?.message || 'Password change failed');
            return;
        }
        if (error) {
            setError((error as { message?: string })?.message ?? "An unexpected error occured.");
            return;
        }

    }

    return (
        <div className="w-screen h-screen flex justify-center items-center flex-col gap-2">

            <div className="p-4">
                <div className="pb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Reset Password</h1>
                </div>
            </div>

            <form className="p-4 border-1 border-gray-400 flex flex-col gap-4 rounded-sm" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}  >

                <div className="flex flex-col gap-2 pt-4">
                    {!passwordChangeSubmitted &&
                        <>
                            <label className="flex flex-col gap-1">
                                New Password:
                                <PasswordInput
                                    name="newPassword" type="password" value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    maxLength={50}
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                Confirm New Password:
                                <PasswordInput
                                    name="confirmNewPassword" type="password" value={confirmNewPassword}
                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                    required
                                    maxLength={50}
                                />
                            </label>
                            {passwordsMatch === false &&
                                <div className="text-red-600">New passwords do not match.</div>
                            }
                        </>
                    }

                    {(message && !error) &&
                        <div className="text-green-600">{message}</div>
                    }
                    {(error && !message) &&
                        <div className="text-red-600">{error}</div>
                    }
                </div>

                {!passwordChangeSubmitted ?
                    <Button text="Submit" variant="primary" type="submit" />
                    :
                    <Button text={authContext?.session && authContext.user ? 'Back to Dashboard' : 'Back to Login'} variant="primary" type="button" onClick={() => handleNavigate()} />
                }
            </form>

        </div>
    )
}