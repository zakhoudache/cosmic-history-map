
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LockKeyhole, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || "Failed to sign in");
      } else {
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const { error } = await signUp(email, password);
      
      if (error) {
        toast.error(error.message || "Failed to sign up");
      } else {
        toast.success("Signed up successfully! Please check your email for verification.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(91,33,182,0.15),rgba(0,0,0,0)_70%)]"></div>
      <div className="fixed inset-0 -z-10 bg-background"></div>
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      <div className="w-full max-w-md p-4 relative z-10">
        <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden">
          {/* Glowing Orb Top Right */}
          <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-2xl pointer-events-none"></div>
          {/* Glowing Orb Bottom Left */}
          <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="p-6">
            <div className="mb-6 text-center relative">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent">
                Chronicle Nexus
              </h1>
              <p className="text-foreground/70 mt-2 text-sm">Your portal to historical connections</p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-galaxy-nova/30">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/30 border-galaxy-nova/20 focus:border-galaxy-nova/50 text-foreground placeholder:text-foreground/30"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground/80 text-sm">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-black/30 border-galaxy-nova/20 focus:border-galaxy-nova/50 text-foreground placeholder:text-foreground/30"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant hover:from-galaxy-blue-giant hover:to-galaxy-nova text-white shadow-lg shadow-galaxy-nova/20 hover:shadow-xl hover:shadow-galaxy-nova/30 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground/80 text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/30 border-galaxy-nova/20 focus:border-galaxy-nova/50 text-foreground placeholder:text-foreground/30"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground/80 text-sm">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-black/30 border-galaxy-nova/20 focus:border-galaxy-nova/50 text-foreground placeholder:text-foreground/30"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant hover:from-galaxy-blue-giant hover:to-galaxy-nova text-white shadow-lg shadow-galaxy-nova/20 hover:shadow-xl hover:shadow-galaxy-nova/30 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm">
              <Link to="/" className="text-galaxy-nova hover:text-galaxy-blue-giant transition-colors duration-300 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </Card>
        
        <div className="mt-4 text-center text-xs text-foreground/50">
          <p>Protected by <span className="text-galaxy-nova">Chronicle Nexus</span> encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
