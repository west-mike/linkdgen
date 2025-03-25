import type { Metadata } from "next";
import { Gamja_Flower } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const gamja = Gamja_Flower({
  weight: '400',
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Job Social Media Post Generator",
  description: "Turn your blog post into something you would see on sites similar to LinkedIn, X, and Facebook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body
        className={`${gamja.className} antialiased bg-orange-200 w-full h-screen min-h-screen text-blue-500 relative`}
      >
        {/* Main content with grid */}
        <div className="w-full h-full grid grid-rows-8 grid-cols-8">
          {children}
          <Analytics />
        </div>

        {/* Absolutely positioned elements that don't affect the grid */}
        <div className="absolute top-4 left-4 text-blue-500 text-3xl z-10">
          LinkdGen
        </div>
        <div className="absolute bottom-4 left-4 text-blue-500 z-10 2xl:text-xl m:text-l s:text-m">
          Font: <a href="https://fonts.google.com/specimen/Gamja+Flower" target="_blank">Gamja Flower</a>
        </div>
        <div className="absolute top-4 right-4 text-blue-500 z-10 text-3xl">
          <a href="https://www.westmike.com" target="_blank">By: Michael West</a>
        </div>
      </body>
    </html>
  );
}
