
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const EnvironmentSetup = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isConfigured = supabaseUrl && supabaseAnonKey && 
                       !supabaseUrl.includes('your-project-id') && 
                       !supabaseAnonKey.includes('your-anon-key');

  if (isConfigured) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Supabase Configuration Required
        </CardTitle>
        <CardDescription>
          Your application needs Supabase credentials to function properly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Missing Environment Variables</AlertTitle>
          <AlertDescription>
            <p className="mb-2">To connect to Supabase, you need to set the following environment variables:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="bg-muted p-1 rounded">VITE_SUPABASE_URL</code>: Your Supabase project URL</li>
              <li><code className="bg-muted p-1 rounded">VITE_SUPABASE_ANON_KEY</code>: Your Supabase anonymous key</li>
            </ul>
            <p className="mt-2">
              These can be found in your Supabase project dashboard under Project Settings &gt; API.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnvironmentSetup;
