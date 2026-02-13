import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
  title: 'GoalPulse',
  description: 'Set goals. Stay on track. Get things done.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}