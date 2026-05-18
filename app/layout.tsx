import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContextPRD | Engineering-ready PRDs from company context",
  description:
    "Generate engineering-ready PRDs grounded in internal documentation, organizational standards, SDLC workflows, and internal templates."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
