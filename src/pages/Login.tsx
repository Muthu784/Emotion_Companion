import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Heart, Mail, Lock, User } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('') // Changed from 'name' to 'username'
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login, register } = useAuth()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()
      const trimmedUsername = username.trim() // Changed from name to username

      if (!trimmedEmail || !trimmedPassword) {
        toast({
          title: "Missing Credentials",  
          description: "Please provide both email and password",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      if (isSignUp && !trimmedUsername) {
        toast({
          title: "Missing username", // Changed from "name"
          description: "Please provide a username for your account", // Changed from "display name"
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (trimmedPassword.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      if (isSignUp) {
        const { error } = await register(trimmedEmail, trimmedPassword, trimmedUsername);
        if (error) {
          toast({
            title: "Authentication Error",
            description: error || 'Failed to create account',
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }

        setNeedsConfirmation(true)
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        })
        // Auto-switch to login after successful registration
        setIsSignUp(false)
        setUsername('')
        setPassword('')
      } else {
        const { error } = await login(trimmedEmail, trimmedPassword)

        if (error) {
          toast({
            title: "Authentication Error",
            description: error || 'Invalid email or password',
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Unexpected error in handleAuth:', error)
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
    setUsername('')
    setNeedsConfirmation(false)
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label> {/* Changed from Name */}
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-white/50" /> {/* Changed icon */}
                    <Input
                      id="username" // Changed from name
                      type="text"
                      placeholder="Choose a username" // Changed placeholder
                      value={username} // Changed from name
                      onChange={(e) => setUsername(e.target.value)} // Changed from setName
                      required={isSignUp}
                      className="pl-10 glass border-white/20 text-white placeholder-white/50"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

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
                    disabled={isLoading}
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
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                <p className="text-green-300 text-sm">
                  Account created successfully! You can now sign in.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-white/80 hover:text-white transition-emotion disabled:opacity-50"
                disabled={isLoading}
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