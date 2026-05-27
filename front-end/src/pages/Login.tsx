import { useContext, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router";
import { authClient } from "../lib/auth";
import { AuthContext } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import axios from "axios";

const Login = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const result = await authClient.signIn.email({ email, password });
    
            if (result.error) {
                setError(result.error.message ?? "An unexpected error occurred.");
                return;
            }
        } catch (error) {
            setError((error as { message: string }).message ?? "An unexpected error occurred.");
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
                return;
            }      

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

        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
                return;
            } else if (error) {
                setError((error as { message: string }).message ?? "An unexpected error occurred.");
                return;
            } else {
                setError("An unexpected error occurred.");
                return;
            }
        }
    }

    if (authContext?.loading) return <div>Loading...</div>

    return (
        <div className="w-screen h-screen flex justify-center items-center">

            <form className="p-4 border-1 border-gray-400 flex flex-col gap-4 rounded-sm" onSubmit={(e) => { e.preventDefault(); handleLogin(e); }}  >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold pb-4">Login</h1>

                <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                        Email Address:
                        <Input required maxLength={100} value={email} type="email" onChange={(e) => setEmail(e.target.value)} />
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

                <div className="text-center w-full flex flex-col sm:flex-row gap-2">
                    <Button variant="primary" text="Login" type="submit" extraClasses="w-full text-center" />
                    <Button variant="secondary" text="Register" type="button" onClick={() => { navigate('/auth/register'); }} extraClasses="w-full" />
                </div>

                <Link
                    className="hover:cursor-pointer hover:text-green-800"
                    to={'/forgot-password'}>
                    Forgot password?
                </Link>

            </form>
        </div>
    )
}

export default Login;