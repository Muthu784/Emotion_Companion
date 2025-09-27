import { useState, useEffect, useRef } from 'react'
import { Navigation, MobileNavigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Heart, Sparkles } from 'lucide-react'
import { detectEmotion, getEmotionColor, getEmotionRecommendations, EmotionResult } from '@/lib/emotion-detection'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  emotion?: EmotionResult
  timestamp: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your emotional wellness companion. Share what's on your mind, and I'll help you understand your emotions better. 💙",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const saveEmotionEntry = async (message: string, emotion: EmotionResult) => {
    try {
      await api.emotions.addEmotion({
        emotion: emotion.emotion,
        intensity: emotion.confidence,
        context: message
        })
    } catch (error) {
      console.error('Error saving emotion entry:', error)
    }
  }

  const generateResponse = (emotion: EmotionResult): string => {
    const responses = {
      joy: [
        "I can sense your happiness! That's wonderful. What's bringing you such joy today?",
        "Your positive energy is contagious! It sounds like you're having a great time.",
        "I love hearing about moments of joy. Would you like some recommendations to keep this feeling going?"
      ],
      love: [
        "There's so much warmth in your message. Love is a beautiful emotion to experience.",
        "I can feel the affection in your words. Love in all its forms is truly special.",
        "Your heart seems full right now. That's a precious feeling to cherish."
      ],
      sadness: [
        "I hear that you're going through a difficult time. It's okay to feel sad - your emotions are valid.",
        "Sometimes sadness helps us process important experiences. I'm here to listen.",
        "Thank you for sharing something so personal. Would you like to talk more about what you're feeling?"
      ],
      anger: [
        "I can sense some frustration in your words. Anger often signals that something important to you has been affected.",
        "It sounds like you're dealing with something challenging. Your feelings are completely understandable.",
        "Sometimes anger is a sign that we need to set boundaries or make changes. What do you think might help?"
      ],
      fear: [
        "I notice some worry or concern in your message. It takes courage to share when we're feeling afraid.",
        "Fear can be overwhelming, but you're not alone. What's been on your mind lately?",
        "It's natural to feel uncertain sometimes. Would it help to talk through what's worrying you?"
      ],
      surprise: [
        "Something unexpected seems to have happened! I'd love to hear more about it.",
        "Life has a way of surprising us, doesn't it? How are you processing this new development?",
        "Surprises can bring such interesting emotions. What's been the most surprising part?"
      ]
    }

    const emotionResponses = responses[emotion.emotion] || responses.joy
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)
    setIsModelLoading(true)

    // Add user message
    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessageObj])

    try {
      // Detect emotion
      const emotionResult = await detectEmotion(userMessage)
      
      // Update user message with emotion
      userMessageObj.emotion = emotionResult
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageObj.id ? { ...msg, emotion: emotionResult } : msg
      ))

      // Save to database
      await saveEmotionEntry(userMessage, emotionResult)

      // Generate bot response
      const botResponse = generateResponse(emotionResult)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

      // Show recommendations if confidence is high
      if (emotionResult.confidence > 0.7) {
        const recommendations = getEmotionRecommendations(emotionResult.emotion)
        toast({
          title: "New recommendations available!",
          description: `Based on your ${emotionResult.emotion}, I have some suggestions for you.`,
        })
      }

    } catch (error) {
      console.error('Error processing message:', error)
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsModelLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navigation />
      <MobileNavigation />
      
      <main className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
            Emotional Chat
          </h1>
          <p className="text-muted-foreground">
            Express yourself freely and discover your emotional patterns
          </p>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-slide-up ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <Card className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'gradient-card border-primary/20 shadow-emotion' 
                  : 'gradient-card border-border/20 shadow-card'
              }`}>
                <CardContent className="p-4">
                  <p className="text-card-foreground mb-2">{message.content}</p>
                  
                  {message.emotion && (
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge 
                        variant="secondary" 
                        className={`bg-${getEmotionColor(message.emotion.emotion)} text-white border-0`}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {message.emotion.emotion}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(message.emotion.confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-emotion flex items-center justify-center shadow-emotion">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isModelLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
                <Bot className="w-4 h-4 text-white animate-pulse" />
              </div>
              <Card className="gradient-card border-border/20 shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span className="text-muted-foreground text-sm ml-2">Analyzing emotions...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <Card className="gradient-card border-border/20 shadow-card">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share what's on your mind..."
                className="flex-1 glass border-border/20 text-card-foreground placeholder-muted-foreground"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                variant="emotion"
                size="icon"
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>AI-powered emotion detection</span>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Real-time analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}