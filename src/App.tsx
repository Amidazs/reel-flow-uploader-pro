
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button"; // Added Button import
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
  const { user } = useAuthContext();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract hash parameters (used by Supabase OAuth)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const provider = hashParams.get('provider');
        const expiresIn = hashParams.get('expires_in');
        
        if (accessToken && provider && user?.id) {
          // Calculate expiry time (convert expires_in from seconds to a date)
          const expiresAt = expiresIn 
            ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() 
            : null;

          // Store the tokens in Supabase
          const { error } = await createOrUpdatePlatformConnection(
            user.id,
            provider, // 'google' or 'facebook'
            accessToken,
            refreshToken || null,
            expiresAt
          );

          if (error) {
            throw error;
          }

          // Show success message
          toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully!`);
          
          // Reload the page to display updated connections
          // We use replace instead of navigate to clean the URL
          window.location.replace('/settings');
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast.error('Failed to connect account. Please try again.');
        navigate('/settings');
      }
    };

    if (location.hash && location.hash.includes('access_token')) {
      handleOAuthCallback();
    }
  }, [location, navigate, user]);

  // Show a loading state while processing the callback
  if (location.hash && location.hash.includes('access_token')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Processing your login... Please wait.</p>
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
              <>
                <OAuthCallbackHandler />
                <SettingsPage />
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
