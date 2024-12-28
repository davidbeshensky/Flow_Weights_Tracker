import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Locked-In-Gains",
  applicationName: "Locked-In Gains",
  description: "Track your gym progress, get better every session",
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico", sizes: "any" }, // Default favicon
      { rel: "icon", url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { rel: "apple-touch-icon", url: "/apple-icon.png", sizes: "180x180" }, // Apple icon
    ],
    apple: "/apple-icon.png", // Shortcut for Apple icon
    shortcut: "/favicon.ico", // Shortcut for the default favicon
    other: [
      {
        rel: "manifest",
        url: "/manifest.json", // PWA manifest
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/icon-96x96.png" sizes="96x96" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Optional SVG Favicon (if supported) */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body className="main-container">{children}</body>
    </html>
  );
}
