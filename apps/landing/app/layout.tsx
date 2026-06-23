import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Stoic Piggy — Tareas que enseñan. Dinero con propósito.',
  description:
    'Stoic Piggy convierte las tareas del hogar en lecciones de dinero. Tú las asignas, tus hijos las completan y ganan — y aprenden a ahorrar y gastar con calma, guiados por una cochinita estoica.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-canvas font-sans text-navy antialiased">
        {/* Fonts + icons (matches the design: DM Sans, Space Mono, Font Awesome 4.7) */}
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
        {children}
      </body>
    </html>
  );
}
