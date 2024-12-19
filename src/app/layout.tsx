import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Locked-In",
  description: "Track your gym progress, get better every session",
  icons: {
    icon: "/favicon.ico",
    apple: "/pngs/apple-icon.png",
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "manifest",
        url: "/manifest.json",
      },
    ],
  },
};

// Move themeColor into a meta tag manually
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add theme-color as a <meta> tag */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
