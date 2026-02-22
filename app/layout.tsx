import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({
  subsets: ["vietnamese"],
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "Cào Thẻ Tết Bính Ngọ 2026",
  description: "Web app cào thẻ may mắn dịp năm mới Bính Ngọ!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${dancingScript.variable} antialiased selection:bg-yellow-400 selection:text-red-900`}
      >
        {children}
      </body>
    </html>
  );
}
