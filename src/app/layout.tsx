import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SisuKai - Step 1: Basic Next.js Test",
  description: "Testing basic Next.js functionality on Vercel deployment",
  keywords: ["sisukai", "learning", "nextjs", "test"],
  authors: [{ name: "SisuKai Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

