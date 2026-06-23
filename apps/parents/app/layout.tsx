import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Stoic Piggy — Panel de padres',
  description: 'Asigna tareas, aprueba el dinero ganado y mira cómo tu familia aprende a ahorrar.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-canvas font-sans text-navy antialiased">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          rel="stylesheet"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
