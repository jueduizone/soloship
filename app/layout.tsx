import type { Metadata } from "next";
import "./globals.css";
import "./soloship.css";
import { event } from "./_components/content";
import { WeChatBrowserNotice } from "./_components/WeChatBrowserNotice";

export const metadata: Metadata = {
  title: `${event.name} ${event.volume} · ${event.tagline}`,
  description: "SoloShip Vol.1 AI OPC 共学营：1 天线下开营 + 3 周线上共学 + 1 天 Demo Day，把 idea 做成能上线、能收款的全球化 AI 产品。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="ss-scope">
          <WeChatBrowserNotice />
          {children}
        </div>
      </body>
    </html>
  );
}
