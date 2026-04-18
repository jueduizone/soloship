import type { Metadata } from "next";
import "./globals.css";
import "./soloship.css";
import { event } from "./_components/content";

export const metadata: Metadata = {
  title: `${event.name} ${event.volume} · ${event.tagline}`,
  description: "两周，把手里的 idea 做成一个能上线的全球化产品。一场带 deadline、带同伴、带 Demo Day 的 shipping sprint。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="ss-scope">{children}</div>
      </body>
    </html>
  );
}
