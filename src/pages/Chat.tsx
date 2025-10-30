import { useState, useEffect, useRef } from 'react'
import { Navigation, MobileNavigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Heart, Sparkles } from 'lucide-react'
import { getEmotionColor, EmotionType, EmotionResult } from '@/lib/emotion-detection'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface AIServiceResponse {
  response: string;
  emotion?: string;
  suggested_emotion?: string;
  timestamp: string;
}

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

  // Removed model initialization check - now handled by backend

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

  // Removed local response generation - now handled by backend

  // Simple error handling for API calls
  const handleAPIError = (error: any) => {
    console.error('API Error:', error);
    throw error;
  };

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
      // Helper function to validate emotion
      const validateEmotion = (emotion: string): EmotionType => {
        const validEmotions = ['joy', 'sadness', 'anger', 'fear', 'love', 'surprise', 'neutral'] as const;
        const normalizedEmotion = emotion.toLowerCase();
        if (validEmotions.includes(normalizedEmotion as EmotionType)) {
          return normalizedEmotion as EmotionType;
        }
        return 'neutral' as EmotionType;
      };

      // Get emotion analysis from backend
      const emotionResponse = await api.emotions.analyze(userMessage).catch(handleAPIError)
      const emotionResult: EmotionResult = {
        emotion: emotionResponse.emotion as EmotionType,
        confidence: emotionResponse.confidence,
        allScores: emotionResponse.scores
      }
      
      // Update user message with emotion
      userMessageObj.emotion = emotionResult
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageObj.id ? { ...msg, emotion: emotionResult } : msg
      ))

      // Get AI response from backend
      console.log('Sending message to AI service:', userMessage);
      const aiResponse: AIServiceResponse = await api.chat.sendMessage(userMessage)
      console.log('Received AI response:', aiResponse);
      
      // Create bot message
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: aiResponse.response,
        timestamp: new Date(aiResponse.timestamp || Date.now()),
        ...(aiResponse.suggested_emotion && {
          emotion: {
            emotion: validateEmotion(aiResponse.suggested_emotion),
            confidence: 1,
            allScores: []
          }
        })
      }
      
      // Add bot message to chat
      setMessages(prev => [...prev, botMessage])
      console.log('Added bot message:', botMessage);

      // Show recommendations if confidence is high
      if (emotionResult.confidence > 0.7) {
        try {
          const recommendations = await api.recommendations.getRecommendations(emotionResult.emotion)
          if (recommendations.length > 0) {
            toast({
              title: "New recommendations available!",
              description: `Based on your ${emotionResult.emotion}, I have some suggestions for you.`,
            })
          }
        } catch (recError) {
          console.error('Failed to fetch recommendations:', recError)
        }
      }

    } catch (error: any) {
      console.error('Error processing message:', error);
      
      // Remove the failed message from the chat
      setMessages(prev => prev.filter(msg => msg.id !== userMessageObj.id));
      
      // Extract error message based on different possible error structures
      let errorMessage = "Sorry, I couldn't process your message. Please try again.";
      let title = "Error";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = "Please log in to continue the conversation";
          title = "Authentication Required";
        } else {
          errorMessage = 
            error.response.data.error || 
            error.response.data.message || 
            (typeof error.response.data === 'string' ? error.response.data : errorMessage);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error toast to user
      toast({
        title: title,
        description: errorMessage,
        variant: "destructive"
      });

      // Add an error message from the bot
      const botErrorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: "I'm having trouble analyzing emotions right now. Could you try rephrasing your message or try again later?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botErrorMessage]);

    } finally {
      setIsLoading(false);
      setIsModelLoading(false);
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