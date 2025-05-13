
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UploadsPage from "./pages/UploadsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import { useAuth, supabase, createOrUpdatePlatformConnection } from "./lib/supabase";
import { toast } from "sonner";

const queryClient = new QueryClient();

// Create auth context
export const AuthContext = createContext(null);

// Auth provider component
const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// OAuth callback handler component
const OAuthCallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const [processingOAuth, setProcessingOAuth] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setProcessingOAuth(true);
        
        // Extract hash parameters (used by Supabase OAuth)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const provider = hashParams.get('provider');
        const expiresIn = hashParams.get('expires_in');
        
        console.log("OAuth callback detected:", {
          accessToken: accessToken ? "present" : "missing",
          refreshToken: refreshToken ? "present" : "missing", 
          provider,
          expiresIn,
          hash: location.hash,
          url: window.location.href,
          isAuthenticated: !!user
        });
        
        if (accessToken && provider) {
          if (!user) {
            console.log("No authenticated user found, but received OAuth tokens");
            toast.error("Authentication required. Please log in and try again.");
            navigate("/");
            setProcessingOAuth(false);
            return;
          }

          console.log(`Processing ${provider} connection for user:`, user.id);
          
          // Calculate expiry time (convert expires_in from seconds to a date)
          const expiresAt = expiresIn 
            ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() 
            : null;

          // Store the tokens in Supabase with retry logic
          let retryCount = 0;
          let success = false;
          
          while (retryCount < 3 && !success) {
            const { data, error } = await createOrUpdatePlatformConnection(
              user.id,
              provider,
              accessToken,
              refreshToken || null,
              expiresAt
            );

            if (error) {
              console.error(`Attempt ${retryCount + 1}: Error creating platform connection:`, error);
              retryCount++;
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              success = true;
              console.log(`${provider} connection successful!`, data);
              
              // Show success message
              const platformName = provider === 'google' ? 'YouTube' : provider.charAt(0).toUpperCase() + provider.slice(1);
              toast.success(`${platformName} connected successfully!`);
              
              // For Google/YouTube, show a special message
              if (provider === 'google') {
                toast.success("YouTube access granted! You can now upload videos.");
              }
              
              // Navigate to settings page and invalidate queries to refresh data
              navigate('/settings');
              break;
            }
          }
          
          if (!success) {
            toast.error(`Failed to connect ${provider} after multiple attempts. Please try again.`);
          }
          
        } else if (location.hash && location.hash.includes('access_token')) {
          // We have a hash with access_token but something is missing
          console.error("OAuth callback error: Missing required parameters", { 
            accessToken: !!accessToken, 
            provider, 
            userId: user?.id,
            hash: location.hash
          });
          
          if (!user) {
            toast.error("Authentication required. Please log in and try again.");
            navigate("/");
          } else {
            toast.error("Failed to connect account. Please try again.");
            navigate("/settings");
          }
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast.error('Failed to connect account. Please try again.');
        navigate('/settings');
      } finally {
        setProcessingOAuth(false);
      }
    };

    // Only process OAuth callback if we have a hash and not loading
    if (location.hash && location.hash.includes('access_token') && !loading && !processingOAuth) {
      console.log("OAuth callback hash detected, processing...");
      handleOAuthCallback();
    }
  }, [location, navigate, user, loading, processingOAuth]); 

  // Show a loading state while processing the callback
  if ((location.hash && location.hash.includes('access_token') && (loading || processingOAuth))) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autoreel-primary mb-4"></div>
        <p className="text-lg font-medium">Processing connection... Please wait.</p>
        <p className="text-sm text-muted-foreground mt-2">This will only take a moment.</p>
      </div>
    );
  }

  return null;
};

// Protected route component - Improved to show message instead of navigate away
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-card rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">You need to sign in to access this page.</p>
          <Button onClick={() => navigate("/")}>Go to Login</Button>
        </div>
      </div>
    );
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<><OAuthCallbackHandler /><Index /></>} />
            <Route path="/uploads" element={
              <ProtectedRoute>
                <OAuthCallbackHandler />
                <UploadsPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <OAuthCallbackHandler />
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <OAuthCallbackHandler />
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
