import { useState, useEffect } from 'react'
import { Navigation, MobileNavigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Heart, MessageCircle, Sparkles, TrendingUp, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { getEmotionColor } from '@/lib/emotion-detection'


interface EmotionEntry {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  timestamp: string;
  context?: string;
}



export default function Dashboard() {
  const [emotionData, setEmotionData] = useState<any[]>([])
  const [recentEntries, setRecentEntries] = useState<EmotionEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const entries = await api.emotions.getHistory()

      if (entries) {
        setRecentEntries(entries.slice(0, 5))
        
        // Process data for charts
        const emotionCounts = entries.reduce((acc: any, entry) => {
          acc[entry.emotion] = (acc[entry.emotion] || 0) + 1
          return acc
        }, {})

        const chartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
          emotion,
          count,
          color: `hsl(var(--emotion-${emotion}))`
        }))

        setEmotionData(chartData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEmotions = emotionData.reduce((sum, item) => sum + item.count, 0)
  const dominantEmotion = emotionData.length > 0 
    ? emotionData.reduce((prev, current) => prev.count > current.count ? prev : current)
    : null

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navigation />
      <MobileNavigation />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
            Your Emotional Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your emotional journey and discover patterns in your mood
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Heart className="w-8 h-8 animate-emotion-pulse text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Stats Cards */}
            <Card className="gradient-card border-border/20 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Total Conversations
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{totalEmotions}</div>
                <p className="text-xs text-muted-foreground">
                  In the last 7 days
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/20 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Dominant Emotion
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground capitalize">
                  {dominantEmotion?.emotion || 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dominantEmotion ? `${Math.round((dominantEmotion.count / totalEmotions) * 100)}%` : '0%'} of conversations
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-border/20 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Recommendations
                </CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {emotionData.length * 3}
                </div>
                <p className="text-xs text-muted-foreground">
                  Personalized suggestions
                </p>
              </CardContent>
            </Card>

            {/* Emotion Distribution Chart */}
            <Card className="md:col-span-2 gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Emotion Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your emotional patterns over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emotionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emotionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="emotion" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Start chatting to see your emotion patterns!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your latest emotional insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${getEmotionColor(entry.emotion as any)}`} />
                      <div className="flex-1">
                        <p className="text-sm text-card-foreground capitalize font-medium">
                          {entry.emotion}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.context || `Intensity: ${entry.intensity}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity. Start a conversation!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Button variant="emotion" size="lg" className="w-full">
            <MessageCircle className="w-5 h-5" />
            Start New Chat
          </Button>
          <Button variant="calm" size="lg" className="w-full">
            <Sparkles className="w-5 h-5" />
            Get Recommendations
          </Button>
          <Button variant="hero" size="lg" className="w-full">
            <Calendar className="w-5 h-5" />
            View History
          </Button>
        </div>
      </main>
    </div>
  )
}