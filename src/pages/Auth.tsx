
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-galaxy-core/30 to-galaxy-spiral/30 p-4">
      <div className="w-full max-w-md">
        <Card className="p-6 backdrop-blur-lg border border-galaxy-nova/30 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome to Chronicle Nexus</h1>
            <p className="text-muted-foreground mt-2">Sign in to visualize historical connections</p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-galaxy-nova/20 focus:border-galaxy-nova/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-galaxy-nova/20 focus:border-galaxy-nova/50"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full cosmic-button"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-galaxy-nova/20 focus:border-galaxy-nova/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-galaxy-nova/20 focus:border-galaxy-nova/50"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full cosmic-button"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="text-galaxy-nova hover:underline">
              Return to Home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
