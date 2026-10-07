import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLoginUserMutation, useRegisterUserMutation } from "@/features/api/authApi"
import { useState, useEffect } from "react"
import { Loader2, User, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { userLoggedIn } from "@/features/authSlice"

export default function Login() {

  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    inviteCode: ""
  });

  const [loginInput, setLoginInput] = useState({
    email: "",
    password: ""
  });

  const [
    registerUser,
    { data: registerData, error: registerError, isLoading: isRegisterLoading, isSuccess: isRegisterSuccess }
  ] = useRegisterUserMutation();

  const [
    loginUser,
    { data: loginData, error: loginError, isLoading: isLoginLoading, isSuccess: isLoginSuccess }
  ] = useLoginUserMutation();

  const navigate = useNavigate();
  const [params] = useSearchParams();

  // State update handler for input fields
  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;

    if (type === "signup") {
      setSignupInput(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setLoginInput(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handler for select dropdown (role)
  const handleRoleChange = (value) => {
    setSignupInput(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleRegistration = async (type) => {
    try {
      const inputData = type === "signup" ? signupInput : loginInput;
      const action = type === "signup" ? registerUser : loginUser;

      // Basic validation
      if (type === "signup" && (!inputData.name || !inputData.email || !inputData.password)) {
        return toast.error("All signup fields are required");
      }

      if (type === "login" && (!inputData.email || !inputData.password)) {
        return toast.error("Email and password required");
      }

      // Send role only for signup
      const payload = type === "signup"
        ? { ...inputData, role: inputData.role }
        : inputData;

      await action(payload).unwrap();

    } catch (err) {
      console.log("Auth error:", err);
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (isRegisterSuccess && registerData) {
      toast.success(registerData.message || "Registration successful");
      dispatch(userLoggedIn({ user: registerData.user }));
      navigate('/');
    }

    if (isLoginSuccess && loginData) {
      toast.success(loginData.message || "Login successful");
      dispatch(userLoggedIn({ user: loginData.user }));
      navigate('/');
    }

    if (registerError) {
      toast.error(registerError.data?.message || "Registration failed");
    }

    if (loginError) {
      toast.error(loginError.data?.message || "Login failed");
    }
  }, [
    isRegisterSuccess,
    isLoginSuccess,
    registerData,
    loginData,
    registerError,
    loginError,
    navigate,
    dispatch
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/40 px-5 py-12">
      <Tabs defaultValue={params.get("tab") === "signup" ? "signup" : "login"} className="w-full max-w-md">

        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        {/* LOGIN */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Pick up where you left off.
              </CardDescription>
            </CardHeader>

            <CardContent><form className="space-y-4" onSubmit={e => {e.preventDefault();handleRegistration("login");}}>
              <div className="space-y-1">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    required autoComplete="email"
                    type="email"
                    name="email"
                    value={loginInput.email}
                    placeholder="you@example.com"
                    onChange={(e) => changeInputHandler(e, "login")}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    required autoComplete="current-password"
                    type="password"
                    name="password"
                    value={loginInput.password}
                    placeholder="••••••••"
                    onChange={(e) => changeInputHandler(e, "login")}
                    className="pl-9"
                  />
                </div>
              </div>

              {loginError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{loginError.data?.message || "Could not sign in. Please try again."}</p>}
              <Button
                disabled={isLoginLoading}
                type="submit"
                className="w-full"
              >
                {
                  isLoginLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : "Login"
                }
              </Button>
            </form></CardContent>
          </Card>
        </TabsContent>

        {/* SIGNUP */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create account</CardTitle>
              <CardDescription>
                Sign up to get started with your learning journey
              </CardDescription>
            </CardHeader>

            <CardContent><form className="space-y-4" onSubmit={e => {e.preventDefault();handleRegistration("signup");}}>
              <div className="space-y-1">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    required autoComplete="name"
                    placeholder="Your full name"
                    name="name"
                    value={signupInput.name}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    required autoComplete="email"
                    type="email"
                    name="email"
                    value={signupInput.email}
                    placeholder="you@example.com"
                    onChange={(e) => changeInputHandler(e, "signup")}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    required autoComplete="new-password"
                    type="password"
                    name="password"
                    value={signupInput.password}
                    placeholder="••••••••"
                    onChange={(e) => changeInputHandler(e, "signup")}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-role">I want to</Label>
                <Select
                  value={signupInput.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="signup-role" className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Learn and enroll in courses</SelectItem>
                    <SelectItem value="instructor">Create and teach courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {signupInput.role === "instructor" && (
                <div className="space-y-1">
                  <Label htmlFor="signup-invite-code">Instructor invite code</Label>
                  <Input
                    id="signup-invite-code"
                    required autoComplete="off"
                    type="text"
                    name="inviteCode"
                    value={signupInput.inviteCode}
                    placeholder="Required for instructor accounts"
                    onChange={(e) => changeInputHandler(e, "signup")}
                  />
                </div>
              )}

              {registerError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{registerError.data?.message || "Could not create account. Please try again."}</p>}
              <Button
                disabled={isRegisterLoading}
                type="submit"
                className="w-full"
              >
                {
                  isRegisterLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : "Create Account"
                }
              </Button>
            </form></CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}