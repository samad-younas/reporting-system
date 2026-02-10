import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "@/store/slices/authSlice";
import loginimg from "@/assets/login-illustration.svg";
import { useSubmit } from "@/hooks/useSubmit";
import { toast } from "react-toastify";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/config/authConfig";

const Login: React.FC = () => {
  const { isPending, mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/login",
    isAuth: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instance } = useMsal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleMicrosoftLogin = async () => {
    try {
      const result = await instance.loginPopup(loginRequest);
      if (result && result.account) {
        const { name, username } = result.account;
        const userData = {
          name: name || "User",
          email: username,
          role: "User",
        };

        dispatch(setUser({ userdata: userData }));
        dispatch(setToken({ token: result.accessToken }));

        toast.success(`Welcome ${name || "User"}!`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Microsoft Login error", error);
      toast.error("Microsoft Login failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await mutateAsync({ email, password });
      dispatch(setToken({ token: data.token }));
      dispatch(setUser({ userdata: data.user }));
      toast.success(data.message || "Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden h-full flex-col justify-center items-center bg-gray-100 lg:flex dark:bg-gray-800">
        <img
          src={loginimg}
          alt="Authentication"
          className="max-w-[80%] max-h-[80%] object-contain"
        />
      </div>
      <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-900">
        <Card className="mx-auto w-full max-w-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  User Name
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your password"
                />

                {/* show password */}
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="showPassword"
                    className="text-sm cursor-pointer"
                  >
                    Show Password
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-5">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isPending}
              >
                {isPending ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>

          <div className="px-6 pb-6">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground dark:bg-gray-950">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full flex items-center gap-2"
              onClick={handleMicrosoftLogin}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 21 21"
              >
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              Sign in with Microsoft
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
