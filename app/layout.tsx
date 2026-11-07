import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "selembar — for you",
  description: "Our letters, our photos, and the small things we want to keep.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
