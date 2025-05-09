
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EnvironmentSetup = () => {
  // Since we're now using the integrated Supabase client, we don't need to check for env variables
  // Just check if the Supabase client exists and is properly configured
  const isConfigured = !!supabase;

  if (isConfigured) {
    return (
      <Card className="mb-8 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Supabase Connected
          </CardTitle>
          <CardDescription>
            Your application is successfully connected to Supabase
          </CardDescription>
        </CardHeader>
      </Card>
    );
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
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Unable to connect to Supabase. Please make sure your project is properly connected.</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnvironmentSetup;
