export const metadata = {
  title: 'Crib Card Game',
  description: 'Play crib against the computer',
  manifest: '/manifest.json',
  themeColor: '#0f0e17',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}