import { useState, useEffect } from 'react'
import { Navigation, MobileNavigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Music, Book, Film, Heart, Sparkles, RefreshCw } from 'lucide-react'
import { EmotionType, getEmotionColor } from '@/lib/emotion-detection'
import { api, Recommendation } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'

interface EmotionSummary {
  emotion: string
  count: number
  percentage: number
}

interface GroupedRecommendations {
  songs: Recommendation[]
  books: Recommendation[]
  movies: Recommendation[]
}

export default function Recommendations() {
  const { user } = useAuth()
  const [emotionSummary, setEmotionSummary] = useState<EmotionSummary[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string>('joy')
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<GroupedRecommendations>({
    songs: [],
    books: [],
    movies: []
  })
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  useEffect(() => {
    loadEmotionSummary()
  }, [])

  useEffect(() => {
    if (selectedEmotion) {
      loadRecommendations()
    }
  }, [selectedEmotion])

  const loadRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      const recommendationData = await api.recommendations.getRecommendations(
        selectedEmotion,
        ['music', 'book', 'movie']
      )

      // Group recommendations by type
      const grouped = recommendationData.reduce((acc, item) => {
        switch (item.type) {
          case 'music':
            acc.songs.push(item)
            break
          case 'book':
            acc.books.push(item)
            break
          case 'movie':
            acc.movies.push(item)
            break
        }
        return acc
      }, { songs: [], books: [], movies: [] } as GroupedRecommendations)

      setRecommendations(grouped)
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const loadEmotionSummary = async () => {
    try {
      const entries = await api.emotions.getHistory()

      if (entries && entries.length > 0) {
        const emotionCounts = entries.reduce((acc: any, entry) => {
          acc[entry.emotion] = (acc[entry.emotion] || 0) + 1
          return acc
        }, {})

        const total = entries.length
        const summary = Object.entries(emotionCounts).map(([emotion, count]) => ({
          emotion,
          count: count as number,
          percentage: Math.round(((count as number) / total) * 100)
        })).sort((a, b) => b.count - a.count)

        setEmotionSummary(summary)
        if (summary.length > 0) {
          setSelectedEmotion(summary[0].emotion)
        }
      }
    } catch (error) {
      console.error('Error loading emotion summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const RecommendationCard = ({ title, type, icon: Icon }: { title: string; type: 'songs' | 'books' | 'movies'; icon: any }) => (
    <Card className="gradient-card border-border/20 shadow-card hover:shadow-glow transition-emotion">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Curated for your {selectedEmotion} mood
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations[type].map((item, index) => (
          <div
            key={item.id}
            className="p-3 rounded-lg glass border border-border/20 hover:border-primary/50 transition-emotion"
          >
            <div className="space-y-1">
              <p className="text-card-foreground font-medium">{item.title}</p>
              {item.description && (
                <p className="text-muted-foreground text-sm">{item.description}</p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {item.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navigation />
      <MobileNavigation />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
            Personalized Recommendations
          </h1>
          <p className="text-muted-foreground">
            Discover content that matches your emotional journey
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Heart className="w-8 h-8 animate-emotion-pulse text-primary" />
          </div>
        ) : (
          <>
            {/* Emotion Summary */}
            <Card className="mb-8 gradient-card border-border/20 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-card-foreground">
                  <Sparkles className="w-5 h-5" />
                  <span>Your Emotional Profile</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Based on your recent conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emotionSummary.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {emotionSummary.map((emotion) => (
                      <button
                        key={emotion.emotion}
                        onClick={() => setSelectedEmotion(emotion.emotion)}
                        className={`p-4 rounded-lg glass border transition-emotion ${
                          selectedEmotion === emotion.emotion
                            ? 'border-primary shadow-glow'
                            : 'border-border/20 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-card-foreground font-medium capitalize">
                            {emotion.emotion}
                          </span>
                          <Badge 
                            variant="secondary"
                            className={`bg-${getEmotionColor(emotion.emotion as any)} text-white border-0`}
                          >
                            {emotion.percentage}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-${getEmotionColor(emotion.emotion as any)}`}
                            style={{ width: `${emotion.percentage}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Start chatting to get personalized recommendations!
                    </p>
                    <Button variant="emotion">
                      Start Your First Chat
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {emotionSummary.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-card-foreground capitalize">
                    Recommendations for {selectedEmotion}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadEmotionSummary()
                      loadRecommendations()
                    }}
                    className="transition-emotion"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingRecommendations ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <Tabs defaultValue="songs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="songs" className="flex items-center space-x-2">
                      <Music className="w-4 h-4" />
                      <span>Songs ({recommendations.songs.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="books" className="flex items-center space-x-2">
                      <Book className="w-4 h-4" />
                      <span>Books ({recommendations.books.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="movies" className="flex items-center space-x-2">
                      <Film className="w-4 h-4" />
                      <span>Movies ({recommendations.movies.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="songs" className="space-y-4">
                    <RecommendationCard title="Songs for You" type="songs" icon={Music} />
                  </TabsContent>

                  <TabsContent value="books" className="space-y-4">
                    <RecommendationCard title="Books to Explore" type="books" icon={Book} />
                  </TabsContent>

                  <TabsContent value="movies" className="space-y-4">
                    <RecommendationCard title="Movies to Watch" type="movies" icon={Film} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}