import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: {
      default: "Bloomly — A garden for how you feel",
      template: "%s · Bloomly",
    },
    description:
      "Choose a feeling, grow a unique flower, and keep a private meadow on your device.",
    applicationName: "Bloomly",
    keywords: [
      "generative art",
      "mood tracker",
      "creative coding",
      "digital wellbeing",
    ],
    icons: {
      icon: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: "Bloomly — Turn a feeling into something alive",
      description:
        "A tiny mood ritual that grows a one-of-a-kind generative flower.",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Bloomly mood garden",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bloomly — Turn a feeling into something alive",
      description:
        "A tiny mood ritual that grows a one-of-a-kind generative flower.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
