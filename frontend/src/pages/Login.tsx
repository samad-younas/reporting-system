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
import { setUser } from "@/store/slices/authSlice";
import loginimg from "@/assets/login-illustration.svg";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });
    navigate("/dashboard");
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
                  htmlFor="userName"
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
                  type="password"
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
                    onChange={(e) => {
                      const passwordInput = document.getElementById(
                        "password",
                      ) as HTMLInputElement;
                      if (e.target.checked) {
                        passwordInput.type = "text";
                      } else {
                        passwordInput.type = "password";
                      }
                    }}
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
              <Button type="submit" className="w-full cursor-pointer">
                Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
