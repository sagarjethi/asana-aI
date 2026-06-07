import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yoga Drishti — Competitive Yoga Platform",
  description:
    "Officiating & broadcast platform for competitive yoga — AI suggests, the judge confirms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
