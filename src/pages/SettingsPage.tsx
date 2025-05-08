
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const [uploadSettings, setUploadSettings] = useState({
    defaultVisibility: "public",
    autoTagging: true,
    scheduledUploads: true,
    autoDescription: false,
    uploadQuality: "high",
    maxVideoLength: "60",
    defaultHashtags: "#autoreeluploader #videocreator #contentcreator",
  });

  const [connectedAccounts, setConnectedAccounts] = useState({
    tiktok: true,
    youtube: true,
    facebook: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    uploadSuccess: true,
    uploadFailure: true,
    processingComplete: true,
    newComment: false,
    milestoneReached: true,
    emailNotifications: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    themeMode: "system",
    accentColor: "purple",
    density: "default",
  });

  const handleSaveUploadSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your upload settings have been updated.",
    });
    // In a real app, this would save to Supabase
  };

  const handleConnectAccount = (platform: string) => {
    toast({
      title: `Connect ${platform}`,
      description: `Redirecting to ${platform} authorization...`,
    });
    // In a real app, this would redirect to the platform's OAuth flow
  };

  const handleDisconnectAccount = (platform: string) => {
    setConnectedAccounts({
      ...connectedAccounts,
      [platform.toLowerCase()]: false,
    });
    
    toast({
      title: `${platform} disconnected`,
      description: `Your ${platform} account has been disconnected.`,
    });
    // In a real app, this would revoke the token in Supabase
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
    // In a real app, this would save to Supabase
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance settings saved",
      description: "Your visual preferences have been updated.",
    });
    // In a real app, this would save to localStorage or Supabase
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="account" className="mb-8">
          <TabsList className="grid grid-cols-4 max-w-2xl mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your profile and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Jane Doe" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="jane@example.com" type="email" />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-[#00f2ea]/10 rounded-full flex items-center justify-center">
                          <span className="text-lg">🎵</span>
                        </div>
                        <div>
                          <p className="font-medium">TikTok</p>
                          <p className="text-sm text-muted-foreground">
                            {connectedAccounts.tiktok ? "Connected as @janedoe" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      
                      {connectedAccounts.tiktok ? (
                        <Button 
                          variant="outline" 
                          onClick={() => handleDisconnectAccount("TikTok")}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button onClick={() => handleConnectAccount("TikTok")}>Connect</Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-[#ff0000]/10 rounded-full flex items-center justify-center">
                          <span className="text-lg">📺</span>
                        </div>
                        <div>
                          <p className="font-medium">YouTube</p>
                          <p className="text-sm text-muted-foreground">
                            {connectedAccounts.youtube ? "Connected as Jane Doe" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      
                      {connectedAccounts.youtube ? (
                        <Button 
                          variant="outline" 
                          onClick={() => handleDisconnectAccount("YouTube")}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button onClick={() => handleConnectAccount("YouTube")}>Connect</Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-[#1877f2]/10 rounded-full flex items-center justify-center">
                          <span className="text-lg">👥</span>
                        </div>
                        <div>
                          <p className="font-medium">Facebook</p>
                          <p className="text-sm text-muted-foreground">
                            {connectedAccounts.facebook ? "Connected as Jane Doe" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      
                      {connectedAccounts.facebook ? (
                        <Button 
                          variant="outline" 
                          onClick={() => handleDisconnectAccount("Facebook")}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button onClick={() => handleConnectAccount("Facebook")}>Connect</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Settings</CardTitle>
                <CardDescription>Configure your default upload preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultVisibility">Default Visibility</Label>
                  <Select
                    value={uploadSettings.defaultVisibility}
                    onValueChange={value => setUploadSettings({...uploadSettings, defaultVisibility: value})}
                  >
                    <SelectTrigger id="defaultVisibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uploadQuality">Upload Quality</Label>
                  <RadioGroup
                    id="uploadQuality"
                    value={uploadSettings.uploadQuality}
                    onValueChange={value => setUploadSettings({...uploadSettings, uploadQuality: value})}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High (Original Quality)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium (Optimized for Web)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low (Faster Upload)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxVideoLength">Maximum Video Length (seconds)</Label>
                  <Input 
                    id="maxVideoLength"
                    type="number"
                    value={uploadSettings.maxVideoLength}
                    onChange={e => setUploadSettings({...uploadSettings, maxVideoLength: e.target.value})}
                    min="1"
                    max="180"
                  />
                  <p className="text-xs text-muted-foreground">
                    For short-form content (1-180 seconds)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultHashtags">Default Hashtags</Label>
                  <Input 
                    id="defaultHashtags"
                    value={uploadSettings.defaultHashtags}
                    onChange={e => setUploadSettings({...uploadSettings, defaultHashtags: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with spaces, include # symbol
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-tagging</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate relevant tags based on video content
                      </p>
                    </div>
                    <Switch
                      checked={uploadSettings.autoTagging}
                      onCheckedChange={checked => setUploadSettings({...uploadSettings, autoTagging: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Scheduled Uploads</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow scheduling uploads for future dates and times
                      </p>
                    </div>
                    <Switch
                      checked={uploadSettings.scheduledUploads}
                      onCheckedChange={checked => setUploadSettings({...uploadSettings, scheduledUploads: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-generate Descriptions</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate video descriptions based on content
                      </p>
                    </div>
                    <Switch
                      checked={uploadSettings.autoDescription}
                      onCheckedChange={checked => setUploadSettings({...uploadSettings, autoDescription: checked})}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveUploadSettings} className="mt-4">
                  Save Upload Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Upload Success</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a video upload completes successfully
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.uploadSuccess}
                      onCheckedChange={checked => setNotificationSettings({...notificationSettings, uploadSuccess: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Upload Failure</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a video upload fails
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.uploadFailure}
                      onCheckedChange={checked => setNotificationSettings({...notificationSettings, uploadFailure: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Processing Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a platform finishes processing your video
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.processingComplete}
                      onCheckedChange={checked => setNotificationSettings({...notificationSettings, processingComplete: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Comment</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone comments on your video
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.newComment}
                      onCheckedChange={checked => setNotificationSettings({...notificationSettings, newComment: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Milestone Reached</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your video reaches a view milestone
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.milestoneReached}
                      onCheckedChange={checked => setNotificationSettings({...notificationSettings, milestoneReached: checked})}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email in addition to in-app
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={checked => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveNotifications} className="mt-4">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <RadioGroup
                    value={appearanceSettings.themeMode}
                    onValueChange={value => setAppearanceSettings({...appearanceSettings, themeMode: value})}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System Default</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {["purple", "blue", "green", "orange", "pink"].map((color) => (
                      <div 
                        key={color}
                        className={`h-10 rounded-md cursor-pointer border-2 ${
                          appearanceSettings.accentColor === color ? "ring-2 ring-offset-2 ring-offset-background" : ""
                        }`}
                        style={{ 
                          backgroundColor: 
                            color === "purple" ? "#9b87f5" :
                            color === "blue" ? "#3b82f6" :
                            color === "green" ? "#10b981" :
                            color === "orange" ? "#f97316" : "#ec4899",
                          borderColor: appearanceSettings.accentColor === color ? 
                            "white" : "transparent",
                        }}
                        onClick={() => setAppearanceSettings({...appearanceSettings, accentColor: color})}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Interface Density</Label>
                  <Select
                    value={appearanceSettings.density}
                    onValueChange={value => setAppearanceSettings({...appearanceSettings, density: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSaveAppearance} className="mt-4">
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AutoReel Uploader. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SettingsPage;
