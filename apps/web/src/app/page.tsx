"use client";

import Header from "@/components/Header";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Download from "@/components/home/Download";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Download />
      <Footer />
    </main>
  );
}
