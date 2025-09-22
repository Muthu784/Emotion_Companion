Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

EmotiChat is an AI-powered emotional wellness companion application. Here's a detailed breakdown:

### Core Features
1. **Emotion Detection & Analysis**
- Uses AI to analyze text and detect emotions from user conversations
- Supports multiple emotion types: joy, love, sadness, anger, fear, and surprise
- Real-time emotion analysis during chats

2. **Interactive Chat Interface**
- AI-powered conversational interface
- Contextual responses based on detected emotions
- Real-time emotion feedback and analysis

3. **Emotion Dashboard**
- Visual representation of emotional patterns
- Charts showing emotion distribution
- Recent activity tracking
- Summary statistics of emotional states

4. **Personalized Recommendations**
- Mood-based content recommendations including:
  - Songs
  - Books
  - Movies
- Recommendations tailored to user's emotional state

### Technical Stack
- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **AI/ML**: Hugging Face transformers for emotion detection
- **Build Tool**: Vite
- **Routing**: React Router

### Design System
- Custom emotion-based color system
- Gradient themes for different emotional states
- Responsive design for mobile and desktop
- Glass-morphism UI effects
- Animated components and transitions

### Security & Privacy
- Protected routes requiring authentication
- Secure user authentication flow
- Email verification system
- Privacy-focused design

This application aims to help users track, understand, and manage their emotions while providing personalized content recommendations based on their emotional state. The UI is modern and user-friendly, with a focus on accessibility and responsive design.
