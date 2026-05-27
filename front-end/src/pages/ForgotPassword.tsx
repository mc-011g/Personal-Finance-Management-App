import { useState } from "react";
import Input from "../components/Input";
import { authClient } from "../lib/auth";
import Button from "../components/Button";
import { useNavigate } from "react-router";

export const ForgotPassword = () => {

    const [email, setEmail] = useState<string>("");
    const [sentPasswordResetLink, setSentPasswordResetLink] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        try {
            const { error, data } = await authClient.requestPasswordReset({
                email,
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

    return (
        <div className="w-screen h-screen flex justify-center items-center flex-col gap-2">

            <div className="p-4">
                <div className="pb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Forgot Password</h1>
                </div>
            </div>

            <form className="p-4 border-1 border-gray-400 flex flex-col gap-4 rounded-sm" onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} >
                {!sentPasswordResetLink &&
                    <>
                        <p>Enter your email to request a password reset link:</p>

                        <label className="flex flex-col gap-1">
                            Email:
                            <Input
                                name="email" type="email" value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                maxLength={100}
                            />
                        </label>

                        <Button
                            type="submit"
                            text="Send Request"
                            variant="primary"
                            disabled={sentPasswordResetLink} />
                    </>
                }

                {message && !error &&
                    <div className="text-green-600 h-full flex items-end">{message}</div>
                }
                {error && !message &&
                    <div className="text-red-600 h-full flex items-end">{error}</div>
                }

                {sentPasswordResetLink &&
                    <Button text={'Back to Login'} variant="primary" type="button" onClick={() => navigate('/auth/sign-in')} />
                }

            </form>
        </div>
    )
}