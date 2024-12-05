import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Locked-In",
  description: "Track your gym progress, get better every session",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
