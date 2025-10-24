import './globals.css'
import { Press_Start_2P } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ClientProviders } from './client-providers'
import ErrorBoundary from '@/components/ErrorBoundary'

const pressStart2P = Press_Start_2P({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start-2p'
})

export const metadata = {
  title: 'PetBase - Virtual Pet Adoption',
  description: 'Adopt and care for virtual pets on Base blockchain. Join tribes, earn rewards, and build your pet collection!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PetBase',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-152x152.png',
  },
  openGraph: {
    title: 'PetBase - Virtual Pet Adoption',
    description: 'Adopt and care for virtual pets on Base blockchain',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetBase - Virtual Pet Adoption',
    description: 'Adopt and care for virtual pets on Base blockchain',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ec4899',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={pressStart2P.className}>
        <ErrorBoundary>
          <ClientProviders>
            {children}
            <Toaster position="top-center" />
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}
