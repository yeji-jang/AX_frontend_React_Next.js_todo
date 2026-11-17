import type { Metadata } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 동글동글한 한글 폰트 (제목, 말풍선, 카드 제목)
// 한글 폰트는 preload 서브셋이 없어서 preload: false로 설정합니다.
const jua = Jua({
  weight: "400",
  variable: "--font-jua",
  preload: false,
});

export const metadata: Metadata = {
    title: 'Bunny Post',
    description: '토끼 배달원이 오늘의 할 일을 배달해 드려요.',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
