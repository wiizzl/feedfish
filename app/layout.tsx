import "./globals.css";

import { type Metadata } from "next";
import { Fira_Code } from "next/font/google";

const font = Fira_Code();

export const metadata: Metadata = {
  title: "FeedFish",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout(props: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={font.className}>
        <main>{props.children}</main>
      </body>
    </html>
  );
}
