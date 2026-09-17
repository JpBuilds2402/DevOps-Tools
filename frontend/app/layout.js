import './globals.css'

export const metadata = { title: 'Catálogo DevOps' }

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}