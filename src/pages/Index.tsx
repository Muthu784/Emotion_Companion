import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const Index = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        navigate('/dashboard')
      }
    }
    checkUser()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <Heart className="w-20 h-20 mx-auto text-white animate-emotion-pulse mb-8" />
        
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
          EmotiChat
        </h1>
        
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
          Your AI-powered emotional wellness companion. Understand your feelings, 
          track your mood, and get personalized recommendations.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="glass p-6 rounded-xl border border-white/20">
            <MessageCircle className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">AI Conversation</h3>
            <p className="text-white/70 text-sm">
              Chat with our AI to express your feelings and get emotional insights
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <BarChart3 className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Emotion Tracking</h3>
            <p className="text-white/70 text-sm">
              Visualize your emotional patterns and mood trends over time
            </p>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <Sparkles className="w-8 h-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-white/70 text-sm">
              Get personalized songs, books, and movies based on your mood
            </p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate('/login')}
            className="w-full md:w-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            size="xl"
            className="w-full md:w-auto glass border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>

        <p className="text-white/60 text-sm mt-8">
          Free to use • Privacy focused • AI-powered
        </p>
      </div>
    </div>
  );
};

export default Index;
