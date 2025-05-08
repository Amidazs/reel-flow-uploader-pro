
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-autoreel-primary/10 flex items-center justify-center">
            <AlertOctagon size={48} className="text-autoreel-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold mb-2">
          <span className="gradient-text">404</span>
        </h1>
        
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild className="button-gradient text-white">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
