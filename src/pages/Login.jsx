import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input"
import {Label} from "@radix-ui/react-label";
import {Button} from "@/components/ui/button.jsx";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === "demo-user" && password === "123pass") {
            navigate("/planner");
        } else {
            setError("Invalid email or password. Try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <Label className="text-gray-700">Email</Label>
                        <Input type="text"
                               className="border-gray-700"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               required
                                />

                    </div>
                    <div className="mb-4">
                        <Label className="text-gray-700">Password</Label>
                        <Input type="password"
                               className="border-gray-700"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                        required/>
                    </div>
                    {/*<button*/}
                    {/*    type="submit"*/}
                    {/*    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"*/}
                    {/*>*/}
                    {/*    Login*/}
                    {/*</button>*/}
                    <Button type="submit" className="w-full p-2">Login</Button>
                </form>
            </div>
        </div>
    );
}

export default Login;
