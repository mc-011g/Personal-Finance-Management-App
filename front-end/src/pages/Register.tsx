import { useContext, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate } from "react-router";
import axios from "axios";
import { authClient } from "../lib/auth";
import { AuthContext } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const Register = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");

    const [error, setError] = useState<string | null>(null);

    const authContext = useContext(AuthContext);

    const navigate = useNavigate();

    const handleRegister = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Please enter a password with at least 8 characters.")
            return;
        }

        try {
            const result = await authClient.signUp.email({ name: firstName + " " + lastName || 'User', email, password });

            if (result.error) {
                setError(result.error.message ?? "An unexpected error occurred.");
                return;
            }
        } catch (error) {
            setError((error as { message: string }).message ?? "An unexpected error occurred");
            return;
        }

        try {
            const sessionResult = await authClient.getSession();
            if (sessionResult.data?.session && sessionResult.data?.user) {
                authContext?.setSession(sessionResult.data.session);
                authContext?.setUser(sessionResult.data.user);
            }

            const token = sessionResult.data?.session.token;
            if (!token) {
                setError("Authentication token not available. Please try logging in again.");
                return;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, {
                id: sessionResult.data?.user.id,
                email,
                firstName,
                lastName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });     

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/setup/complete-status`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const onboardingComplete = response.data;
            if (onboardingComplete) {
                navigate('/dashboard');
            } else {
                navigate('/account-setup');
            }

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
            } else {
                setError("An unexpected error occured");
            }
            return;
        }      
    }

    if (authContext?.loading) return <div>Loading...</div>

    return (
        <div className="w-screen h-screen flex justify-center items-center flex-col gap-2">

            <form className="w-96 p-4 border-1 border-gray-400 flex flex-col gap-4 rounded-sm" onSubmit={(e) => { e.preventDefault(); handleRegister(e); }}  >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold pb-4">Register</h1>

                <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                        Email Address:
                        <Input required value={email} maxLength={100} type="email" onChange={(e) => setEmail(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-1">
                        First Name:
                        <Input required maxLength={50} value={firstName} type="text" onChange={(e) => setFirstName(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-1">
                        Last Name:
                        <Input required maxLength={50} value={lastName} type="text" onChange={(e) => setLastName(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-1">
                        Password:
                        <PasswordInput required maxLength={50} value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
                    </label>

                    {error &&
                        <div className="text-red-600">
                            {error}
                        </div>
                    }
                </div>

                <div className="text-center w-full flex flex-col sm:flex-row">
                    <Button variant="primary" text="Register" type="submit" extraClasses="w-full text-center" />
                    <Button variant="secondary" text="Login" type="button" onClick={() => { navigate('/auth/sign-in'); }} extraClasses="w-full" />
                </div>

                <span className="hover:cursor-pointer hover:text-green-800">Forgot password?</span>
            </form>

        </div>
    )
}

export default Register;