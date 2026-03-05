import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, loginWithToken } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
      const payload = isLogin
        ? { email, password }
        : { email, password, name };

      const baseUrl = import.meta.env.VITE_REACT_SERVER_URL || "http://localhost:5000";

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      loginWithToken(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const baseUrl = import.meta.env.VITE_REACT_SERVER_URL || "http://localhost:5000";

      const res = await fetch(`${baseUrl}/api/users/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      loginWithToken(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="border border-gray-200 shadow-lg rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin ? "Sign in to your account to continue" : "Sign up to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Name (Register Only) */}
              {!isLogin && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 border-gray-300 text-gray-900"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-300 text-gray-900"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-indigo-600"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Button>
                {isLogin && (
                  <Button type="button" variant="link" className="p-0 h-auto text-gray-500">
                    Forgot password?
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
                size="lg"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <span className="flex-grow border-t border-gray-200"></span>
              <span className="mx-3 text-xs text-gray-400 uppercase">Or</span>
              <span className="flex-grow border-t border-gray-200"></span>
            </div>

            {/* Social Auth */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
