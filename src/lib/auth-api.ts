import { supabase } from './supabase'
import { AuthError, Session, User, AuthApiError } from '@supabase/supabase-js'

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | any | null;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Trim whitespace from credentials
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (error) {
        const message = (error.message || '').toLowerCase()

        // Handle email not confirmed error specifically (covers different Supabase versions/messages)
        if (message.includes('email not confirmed')) {
          return {
            user: null,
            session: null,
            error: {
              message: 'Please verify your email before logging in. Check your inbox for a confirmation link.',
              status: 401,
              isEmailNotConfirmed: true
            }
          }
        }

        // Normalize invalid credentials to a consistent message
        if (message.includes('invalid') || message.includes('invalid login credentials')) {
          return {
            user: null,
            session: null,
            error: {
              message: 'Invalid email or password',
              status: 400
            }
          }
        }

        // Fallback: bubble up other auth errors
        throw error
      }

      return { 
        user: data.user, 
        session: data.session, 
        error: null 
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: {
          message: error?.message || 'Authentication failed',
          status: error?.status || 400
        }
      }
    }
  },

  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate & normalize
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()
      if (trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            full_name: trimmedEmail.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (error) throw error

      return {
        user: data.user,
        session: data.session,
        error: null
      }
    } catch (error: any) {
      const message = (error?.message || '').toLowerCase()
      if (message.includes('user already registered') || message.includes('already registered')) {
        return {
          user: null,
          session: null,
          error: {
            message: 'Email already registered. Please sign in instead.',
            status: 400
          }
        }
      }
      return {
        user: null,
        session: null,
        error: {
          message: error?.message || 'Failed to create account',
          status: error?.status || 400
        }
      }
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },

  async resendConfirmationEmail(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { 
        error: new Error(error.message || 'Failed to resend confirmation email') 
      }
    }
  }
}