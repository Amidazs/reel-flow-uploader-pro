
import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/App";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ViewData = {
  date: string;
  tiktok: number;
  youtube: number;
  facebook: number;
};

type EngagementData = {
  name: string;
  value: number;
};

type PlatformViewsData = {
  name: string;
  views: number;
};

type VideoPerformanceData = {
  title: string;
  views: number;
  platform: string;
};

const AnalyticsPage = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  
  // Analytics state
  const [viewsData, setViewsData] = useState<ViewData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [totalViewsByPlatform, setTotalViewsByPlatform] = useState<PlatformViewsData[]>([]);
  const [topPerformingVideos, setTopPerformingVideos] = useState<VideoPerformanceData[]>([]);
  const [totalStats, setTotalStats] = useState({
    views: 0,
    engagementRate: 0,
    newFollowers: 0
  });

  // Colors for different platforms
  const COLORS = ["#00f2ea", "#ff0000", "#1877f2"];
  
  // Platform icons mapping
  const platformIcons: Record<string, string> = {
    TikTok: "🎵",
    YouTube: "📺",
    Facebook: "👥"
  };

  // Generate dates for the last X days
  const generateDatesArray = (days: number) => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Format as MM/DD
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${month}/${day}`);
    }
    
    return dates;
  };
  
  // Fetch analytics data from Supabase (or generate synthetic data for demo)
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the number of days based on selected time range
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        
        // Fetch uploads to generate analytics
        const { data: uploads, error } = await supabase
          .from('video_uploads')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;

        // Generate synthetic analytics based on actual uploads
        generateAnalytics(uploads, days);
        
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          title: "Failed to load analytics",
          description: "There was a problem retrieving your analytics data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, timeRange, toast]);

  // Generate synthetic analytics data based on actual uploads
  const generateAnalytics = (uploads: any[] = [], days: number) => {
    if (!uploads.length) {
      // Set empty data for all analytics
      const emptyDates = generateDatesArray(days);
      const emptyViewsData = emptyDates.map(date => ({
        date,
        tiktok: 0,
        youtube: 0,
        facebook: 0
      }));
      
      setViewsData(emptyViewsData);
      setEngagementData([
        { name: "TikTok", value: 0 },
        { name: "YouTube", value: 0 },
        { name: "Facebook", value: 0 }
      ]);
      setTotalViewsByPlatform([
        { name: "TikTok", views: 0 },
        { name: "YouTube", views: 0 },
        { name: "Facebook", views: 0 }
      ]);
      setTopPerformingVideos([]);
      setTotalStats({
        views: 0,
        engagementRate: 0,
        newFollowers: 0
      });
      return;
    }
    
    // Count uploads by platform
    const platforms = ["tiktok", "youtube", "facebook"];
    const platformCounts: Record<string, number> = {};
    platforms.forEach(p => platformCounts[p] = 0);
    
    uploads.forEach(upload => {
      if (platforms.includes(upload.platform_id)) {
        platformCounts[upload.platform_id]++;
      }
    });

    // Generate daily views data
    const dates = generateDatesArray(days);
    const generatedViewsData = dates.map((date, index) => {
      // Create views data with increasing trend and some randomness
      const dayFactor = index / (days - 1); // 0 to 1 representing progress through the date range
      const baseTiktok = platformCounts.tiktok ? Math.round(1000 + dayFactor * 5000 + Math.random() * 1000) : 0;
      const baseYoutube = platformCounts.youtube ? Math.round(800 + dayFactor * 3000 + Math.random() * 800) : 0;
      const baseFacebook = platformCounts.facebook ? Math.round(500 + dayFactor * 1500 + Math.random() * 500) : 0;
      
      return {
        date,
        tiktok: baseTiktok,
        youtube: baseYoutube,
        facebook: baseFacebook
      };
    });

    setViewsData(generatedViewsData);
    
    // Calculate total views by platform
    const totalTiktokViews = generatedViewsData.reduce((sum, day) => sum + day.tiktok, 0);
    const totalYoutubeViews = generatedViewsData.reduce((sum, day) => sum + day.youtube, 0);
    const totalFacebookViews = generatedViewsData.reduce((sum, day) => sum + day.facebook, 0);
    
    const totals = [
      { name: "TikTok", views: totalTiktokViews },
      { name: "YouTube", views: totalYoutubeViews },
      { name: "Facebook", views: totalFacebookViews }
    ];
    
    setTotalViewsByPlatform(totals);
    
    // Generate engagement data based on platform distribution
    const totalViews = totalTiktokViews + totalYoutubeViews + totalFacebookViews;
    
    const engagement = [
      { name: "TikTok", value: totalTiktokViews > 0 ? Math.round(6 + Math.random() * 3) : 0 },
      { name: "YouTube", value: totalYoutubeViews > 0 ? Math.round(5 + Math.random() * 3) : 0 },
      { name: "Facebook", value: totalFacebookViews > 0 ? Math.round(3 + Math.random() * 3) : 0 }
    ];
    
    setEngagementData(engagement);
    
    // Generate top performing videos based on actual uploads
    const topVideos = uploads
      .slice(0, Math.min(5, uploads.length))
      .map((upload: any, idx: number) => {
        // Create synthetic view counts based on upload order
        const views = Math.round(8000 - idx * 1200 + Math.random() * 1000);
        return {
          title: upload.title,
          views: views,
          platform: upload.platform_id.charAt(0).toUpperCase() + upload.platform_id.slice(1)
        };
      })
      .sort((a: VideoPerformanceData, b: VideoPerformanceData) => b.views - a.views);
      
    setTopPerformingVideos(topVideos);
    
    // Calculate overall stats
    const avgEngagement = engagement.reduce((sum, item) => sum + item.value, 0) / 
                         engagement.filter(item => item.value > 0).length;
    
    setTotalStats({
      views: totalViews,
      engagementRate: isNaN(avgEngagement) ? 0 : avgEngagement,
      newFollowers: Math.round((totalViews * 0.02) + Math.random() * 100)
    });
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
        
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 size={36} className="animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Views</CardTitle>
                  <CardDescription>Across all platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalStats.views.toLocaleString()}</div>
                  <p className="text-green-500 text-sm mt-1">↑ 12.5% from last period</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Engagement Rate</CardTitle>
                  <CardDescription>Likes, comments & shares</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalStats.engagementRate.toFixed(1)}%</div>
                  <p className="text-green-500 text-sm mt-1">↑ 1.2% from last period</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">New Followers</CardTitle>
                  <CardDescription>Across all platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalStats.newFollowers.toLocaleString()}</div>
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
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="youtube" 
                          name="YouTube"
                          stroke="#ff0000" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="facebook" 
                          name="Facebook"
                          stroke="#1877f2" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Distribution</CardTitle>
                      <CardDescription>Engagement rate by platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {engagementData.some(d => d.value > 0) ? (
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
                      ) : (
                        <div className="flex justify-center items-center h-[300px]">
                          <p className="text-muted-foreground">No data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Videos</CardTitle>
                      <CardDescription>Videos with the most views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {topPerformingVideos.length > 0 ? (
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
                                      <span className="mr-1">{platformIcons[video.platform] || "📱"}</span>
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
                      ) : (
                        <div className="flex justify-center items-center h-[300px]">
                          <p className="text-muted-foreground">No videos found</p>
                        </div>
                      )}
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
                    {totalViewsByPlatform.some(p => p.views > 0) ? (
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
                    ) : (
                      <div className="flex justify-center items-center h-[300px]">
                        <p className="text-muted-foreground">No platform data available</p>
                      </div>
                    )}
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
                          <span className="font-medium">
                            {totalViewsByPlatform.find(p => p.name === "TikTok")?.views.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Engagement</span>
                          <span className="font-medium">
                            {engagementData.find(p => p.name === "TikTok")?.value.toFixed(1) || "0"}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Followers</span>
                          <span className="font-medium">
                            {Math.round((totalViewsByPlatform.find(p => p.name === "TikTok")?.views || 0) * 0.03).toLocaleString()}
                          </span>
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
                          <span className="font-medium">
                            {totalViewsByPlatform.find(p => p.name === "YouTube")?.views.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Engagement</span>
                          <span className="font-medium">
                            {engagementData.find(p => p.name === "YouTube")?.value.toFixed(1) || "0"}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Subscribers</span>
                          <span className="font-medium">
                            {Math.round((totalViewsByPlatform.find(p => p.name === "YouTube")?.views || 0) * 0.01).toLocaleString()}
                          </span>
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
                          <span className="font-medium">
                            {totalViewsByPlatform.find(p => p.name === "Facebook")?.views.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Engagement</span>
                          <span className="font-medium">
                            {engagementData.find(p => p.name === "Facebook")?.value.toFixed(1) || "0"}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Followers</span>
                          <span className="font-medium">
                            {Math.round((totalViewsByPlatform.find(p => p.name === "Facebook")?.views || 0) * 0.008).toLocaleString()}
                          </span>
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
                    {topPerformingVideos.length > 0 ? (
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
                    ) : (
                      <div className="flex justify-center items-center h-[400px]">
                        <p className="text-muted-foreground">No video data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
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
