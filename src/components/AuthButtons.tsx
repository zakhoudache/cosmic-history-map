
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User, Mail, Github } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const AuthButtons = () => {
  const { user, signOut, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    }
  };

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="border-galaxy-nova/30">
        <span className="animate-pulse text-white">Loading...</span>
      </Button>
    );
  }

  // Show login/signup buttons if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Link to="/auth" className="inline-block">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-galaxy-nova/30 hover:border-galaxy-nova/60 text-white hover:text-galaxy-star cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Sign In
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="border-galaxy-nova/30 hover:border-galaxy-nova/60 text-white hover:text-galaxy-star cursor-pointer"
          onClick={handleGoogleSignIn}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In with Google
        </Button>
      </div>
    );
  }

  // Show user menu if authenticated
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-galaxy-nova/30 hover:border-galaxy-nova/60 text-white hover:text-galaxy-star cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          {user.email ? user.email.split('@')[0] : 'Account'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-background/95 backdrop-blur-sm border border-galaxy-nova/30">
        <div className="space-y-3">
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
          </p>
          
          <Separator className="bg-galaxy-nova/20" />
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AuthButtons;
