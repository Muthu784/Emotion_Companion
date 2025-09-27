import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, BarChart3, Sparkles, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut()
  //   navigate('/login')
  // }

  const handleSignOut = () => {
    // Implement sign-out logic here, e.g., clear auth tokens, call API, etc.
    navigate('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/recommendations', icon: Sparkles, label: 'Recommendations' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-primary animate-emotion-pulse" />
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            EmotiChat
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname === item.href ? "emotion" : "ghost"}
                size="sm"
                className="transition-emotion"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="transition-emotion"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}

export function MobileNavigation() {
  const location = useLocation()

  const navItems = [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/recommendations', icon: Sparkles, label: 'Recommendations' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/20">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href} className="flex flex-col items-center space-y-1">
            <Button
              variant={location.pathname === item.href ? "emotion" : "ghost"}
              size="icon"
              className="transition-emotion"
            >
              <item.icon className="w-5 h-5" />
            </Button>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}