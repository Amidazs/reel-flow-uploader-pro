import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InfoIcon, Loader2 } from 'lucide-react';

const AuthSection = () => {
  const { user, signInWithOAuth, signOut, loading } = useAuthContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      setAuthError(null);
      
      toast({
        title: "Starting authentication process",
        description: `You'll be redirected to ${provider} to complete the sign-in process.`,
      });
      
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        throw error;
      }
      
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setAuthError(`Unable to sign in with ${provider}. Please ensure you've allowed pop-ups for this site.`);
      toast({
        title: "Authentication failed",
        description: `Unable to sign in with ${provider}. Please check your browser settings and try again.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(prev => ({ ...prev, 'signout': true }));
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "Unable to sign out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, 'signout': false }));
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
          <div className="flex justify-center mt-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{user ? 'Welcome!' : 'Sign in to AutoReel'}</CardTitle>
        <CardDescription>
          {user ? `Signed in as ${user.email || user.id}` : 'Connect with your favorite platforms to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user ? (
          <>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Sign in options</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">About authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      When you click a sign-in button, you'll be redirected to the provider's authentication page.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      After signing in, you'll be redirected back to this application automatically.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <AlertDescription className="text-blue-800">
                You'll be redirected to complete authentication. Make sure you're using the production URL, not localhost.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleSignIn('google')}
              disabled={isLoading['google']}
            >
              {isLoading['google'] ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <div className="bg-white p-1 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
              )}
              <span>{isLoading['google'] ? 'Redirecting...' : 'Continue with Google'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleSignIn('facebook')}
              disabled={isLoading['facebook']}
            >
              {isLoading['facebook'] ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <div className="bg-[#1877F2] p-1 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              )}
              <span>{isLoading['facebook'] ? 'Redirecting...' : 'Continue with Facebook'}</span>
            </Button>
          </>
        ) : (
          <div className="text-center">
            <p className="mb-4">You're now logged in and can access all features of AutoReel!</p>
            <Button 
              onClick={handleSignOut} 
              disabled={isLoading['signout']}
              className="min-w-[120px]"
            >
              {isLoading['signout'] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <span>Sign Out</span>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to AutoReel's Terms of Service and Privacy Policy
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthSection;
