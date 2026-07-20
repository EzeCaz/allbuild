import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Hearthwork — A crew that handles the busywork",
  description:
    "Hearthwork is your always-on crew for small business. We handle the follow-ups, the scheduling, the busywork — so you can do the human work.",
  keywords: [
    "Hearthwork",
    "AI crew",
    "small business",
    "entrepreneurs",
    "automation",
    "workflow",
  ],
  authors: [{ name: "Hearthwork" }],
  openGraph: {
    title: "Hearthwork — A crew that handles the busywork",
    description:
      "Your always-on crew for small business. Warm, human, and quietly competent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} antialiased`}
        style={{ backgroundColor: "#FAE3E3", color: "#2D1B2E" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
