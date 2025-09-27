import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Heart, Mail, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      if (!trimmedEmail || !trimmedPassword) {
        toast({
          title: "Missing Crendentials",  
          description: "Please provide both email and password",
          variant: "destructive"
        })
      }

      if (trimmedPassword.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters.",
          variant: "destructive"
        })
        return
      }

      if (isSignUp) {
        const { error } = await authApi.register(trimmedEmail, trimmedPassword);
        if (error) {
          toast({
            title: "Authentication Error",
            description: error || 'Failed to create account',
            variant: "destructive"
          })
          return
        }

        setNeedsConfirmation(true)
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })
      } else {
        const { error } = await authApi.login(trimmedEmail, trimmedPassword)

        if (error) {
          toast({
            title: "Authentication Error",
            description: error || 'Invalid email or password',
            variant: "destructive"
          })
          return
        }

        navigate('/dashboard')
      }
    } catch (_error: any) {
      // Unexpected error fallback already handled in branches above
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-white animate-emotion-pulse mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">EmotiChat</h1>
          <p className="text-white/80">Your AI-powered emotional wellness companion</p>
        </div>

        <Card className="glass border-white/20 shadow-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {isSignUp 
                ? 'Start your emotional wellness journey'
                : 'Sign in to continue your journey'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 glass border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="pl-10 glass border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {needsConfirmation && (
              <div className="mt-4 text-center">
                <p className="text-white/80 mb-2">
                  Please check your email for verification instructions
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white/80 hover:text-white transition-emotion"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}