
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const AuthButtons = () => {
  const { user, signOut, loading } = useAuth();
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
      <Link to="/auth">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-galaxy-nova/30 hover:border-galaxy-nova/60 text-white hover:text-galaxy-star"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  // Show user menu if authenticated
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-galaxy-nova/30 hover:border-galaxy-nova/60 text-white hover:text-galaxy-star"
        >
          <User className="mr-2 h-4 w-4" />
          {user.email ? user.email.split('@')[0] : 'Account'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">{user.email}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
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
