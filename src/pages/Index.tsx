
import Header from "@/components/layout/Header";
import AuthSection from "@/components/auth/AuthSection";
import { useAuthContext } from "@/App";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to AutoReel</h1>
          <p className="text-xl text-muted-foreground">
            Streamline your video uploads across multiple platforms
          </p>
        </div>
        
        {user ? (
          <div className="max-w-md mx-auto my-8 text-center">
            <p className="mb-4">Welcome back! You're signed in as {user.email || 'a registered user'}.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/uploads')}>Go to Uploads</Button>
              <Button onClick={() => navigate('/settings')} variant="outline">Manage Settings</Button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto my-8">
            <AuthSection />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          <div className="bg-card rounded-lg p-6 text-center border">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-medium mb-2">Bulk Uploads</h3>
            <p className="text-muted-foreground">
              Upload videos to multiple platforms simultaneously
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 text-center border">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-medium mb-2">Analytics</h3>
            <p className="text-muted-foreground">
              Track performance across all your social accounts
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 text-center border">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-medium mb-2">Scheduling</h3>
            <p className="text-muted-foreground">
              Plan your content calendar with scheduled uploads
            </p>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AutoReel Uploader. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
