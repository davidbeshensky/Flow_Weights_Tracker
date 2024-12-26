import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Locked-In",
  applicationName: "Locked-In Gains",
  description: "Track your gym progress, get better every session",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "manifest",
        url: "/manifest.json",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Theme color for the app */}
        <meta name="theme-color" content="#ffffff" />
        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-title" content="Locked-In" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" href="/icon.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/icon.png" sizes="96x96" />
      </head>
      <body className="main-container">{children}</body>
    </html>
  );
}
