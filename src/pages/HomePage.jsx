import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import SignatureDrop from '../components/home/SignatureDrop';
import ArtisanStorySection from '../components/home/ArtisanStorySection';
import CustomBespokeBanner from '../components/home/CustomBespokeBanner';
import ReviewShowcase from '../components/home/ReviewShowcase';
import NewsletterSection from '../components/home/NewsletterSection';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-70px' }}
    transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function HomePage() {
  return (
    <div className="space-y-4">
      {/* 4K Mockup Hero Section */}
      <HeroSection />

      {/* Signature Drop Products */}
      <Reveal>
        <SignatureDrop />
      </Reveal>

      {/* The Artisan Story */}
      <Reveal delay={0.05}>
        <ArtisanStorySection />
      </Reveal>

      {/* Customer Love */}
      <Reveal delay={0.05}>
        <ReviewShowcase />
      </Reveal>

      {/* Custom Bespoke Atelier Banner */}
      <Reveal delay={0.05}>
        <CustomBespokeBanner />
      </Reveal>

      {/* Stay Connected VIP Newsletter */}
      <Reveal delay={0.05}>
        <NewsletterSection />
      </Reveal>
    </div>
  );
}
