
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
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  Line,
  Cell,
  Pie
} from "recharts";
import Header from "@/components/layout/Header";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for analytics
const viewsData = [
  { date: "05/01", tiktok: 2400, youtube: 1398, facebook: 980 },
  { date: "05/02", tiktok: 1398, youtube: 3500, facebook: 1100 },
  { date: "05/03", tiktok: 4200, youtube: 2300, facebook: 1300 },
  { date: "05/04", tiktok: 3800, youtube: 2800, facebook: 1550 },
  { date: "05/05", tiktok: 5100, youtube: 3100, facebook: 1700 },
  { date: "05/06", tiktok: 4900, youtube: 3700, facebook: 2000 },
  { date: "05/07", tiktok: 5700, youtube: 4100, facebook: 2300 },
];

const engagementData = [
  { name: "TikTok", value: 72 },
  { name: "YouTube", value: 63 },
  { name: "Facebook", value: 48 },
];

const COLORS = ["#00f2ea", "#ff0000", "#1877f2"];

const totalViewsByPlatform = [
  { name: "TikTok", views: 27498 },
  { name: "YouTube", views: 20898 },
  { name: "Facebook", views: 10930 },
];

const topPerformingVideos = [
  { title: "How to Make Pancakes - Quick Recipe", views: 8620, platform: "TikTok" },
  { title: "5 Tips for Better Sleep", views: 7450, platform: "TikTok" },
  { title: "Morning Routine for Productivity", views: 6320, platform: "YouTube" },
  { title: "DIY Home Decoration Ideas", views: 4920, platform: "Facebook" },
  { title: "Summer Fashion Trends 2025", views: 2890, platform: "YouTube" },
];

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const platformIcons: Record<string, string> = {
    TikTok: "🎵",
    YouTube: "📺",
    Facebook: "👥"
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Analytics</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7d")}
            >
              7 days
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30d")}
            >
              30 days
            </Button>
            <Button
              variant={timeRange === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("90d")}
            >
              90 days
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Views</CardTitle>
              <CardDescription>Across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">59,326</div>
              <p className="text-green-500 text-sm mt-1">↑ 12.5% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Engagement Rate</CardTitle>
              <CardDescription>Likes, comments & shares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">6.8%</div>
              <p className="text-green-500 text-sm mt-1">↑ 1.2% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">New Followers</CardTitle>
              <CardDescription>Across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">1,245</div>
              <p className="text-green-500 text-sm mt-1">↑ 8.3% from last period</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid grid-cols-3 max-w-md mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">By Platform</TabsTrigger>
            <TabsTrigger value="videos">By Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
                <CardDescription>Daily views across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tiktok" 
                      name="TikTok"
                      stroke="#00f2ea" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="youtube" 
                      name="YouTube"
                      stroke="#ff0000" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="facebook" 
                      name="Facebook"
                      stroke="#1877f2" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Total views by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Videos</CardTitle>
                  <CardDescription>Videos with the most views</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {topPerformingVideos.map((video, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg font-medium">{idx + 1}.</span>
                            <div>
                              <p className="font-medium line-clamp-1">{video.title}</p>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <span className="mr-1">{platformIcons[video.platform]}</span>
                                {video.platform}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{video.views.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">views</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Platform</CardTitle>
                <CardDescription>Compare total views across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={totalViewsByPlatform}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#9b87f5">
                      {totalViewsByPlatform.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-[#00f2ea]/10 to-[#00f2ea]/5 border-[#00f2ea]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">TikTok</CardTitle>
                    <span className="text-2xl">🎵</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-medium">27,498</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement</span>
                      <span className="font-medium">7.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <span className="font-medium">820</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average View Time</span>
                      <span className="font-medium">18s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-[#ff0000]/10 to-[#ff0000]/5 border-[#ff0000]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">YouTube</CardTitle>
                    <span className="text-2xl">📺</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-medium">20,898</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement</span>
                      <span className="font-medium">6.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Subscribers</span>
                      <span className="font-medium">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average View Time</span>
                      <span className="font-medium">22s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-[#1877f2]/10 to-[#1877f2]/5 border-[#1877f2]/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Facebook</CardTitle>
                    <span className="text-2xl">👥</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-medium">10,930</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement</span>
                      <span className="font-medium">4.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <span className="font-medium">83</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average View Time</span>
                      <span className="font-medium">15s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Performance Comparison</CardTitle>
                <CardDescription>Views across your top videos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={topPerformingVideos}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="title" 
                      type="category" 
                      width={150}
                      tick={props => {
                        const { x, y, payload } = props;
                        return (
                          <text x={x} y={y} dy={3} textAnchor="end" fontSize={12} fill="#666">
                            {payload.value.length > 18
                              ? `${payload.value.substring(0, 18)}...`
                              : payload.value}
                          </text>
                        );
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="views" 
                      fill="#9b87f5" 
                      name="Total Views"
                    >
                      {topPerformingVideos.map((entry, index) => {
                        const platformColor = 
                          entry.platform === "TikTok" ? "#00f2ea" :
                          entry.platform === "YouTube" ? "#ff0000" : "#1877f2";
                        
                        return <Cell key={`cell-${index}`} fill={platformColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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

export default AnalyticsPage;
