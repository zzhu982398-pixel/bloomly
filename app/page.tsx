import type { Metadata } from "next";
import BloomlyApp from "./BloomlyApp";

export const metadata: Metadata = {
  title: "Bloomly — Turn a feeling into something alive",
  description:
    "A private, playful mood ritual that grows a one-of-a-kind generative flower in your browser.",
};

export default function Home() {
  return <BloomlyApp />;
}
