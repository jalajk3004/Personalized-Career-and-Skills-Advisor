import {  useState } from "react";
import { auth, googleProvider,db } from "@/config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup,  } from "firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

    

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.uid) {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, {
          email: user.email,
          profilePicture: user.photoURL,
          name: user.displayName || null,
        });
      }

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const SignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.uid) {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, {
          email: user.email,
          profilePicture: user.photoURL,
          name: user.displayName,
        });
      }

      navigate("/"); 
    } catch (err) {
      console.log(err);
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={signIn} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Enter your email"
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button variant="link" className="p-0 h-auto text-sm text-indigo-600">
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <span className="flex-grow border-t border-gray-200"></span>
              <span className="mx-3 text-xs text-gray-400 uppercase">Or</span>
              <span className="flex-grow border-t border-gray-200"></span>
            </div>

            {/* Social Auth */}
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={SignInWithGoogle}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 
                      1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 
                      3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 
                      7.28-2.66l-3.57-2.77c-.98.66-2.23 
                      1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 
                      20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 
                      8.55 1 10.22 1 12s.43 3.45 1.18 
                      4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 
                      4.21 1.64l3.15-3.15C17.45 2.09 14.97 
                      1 12 1 7.7 1 3.99 3.47 2.18 
                      7.07l3.66 2.84c.87-2.6 3.3-4.53 
                      6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
