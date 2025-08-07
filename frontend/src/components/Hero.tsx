'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import TwoDLogo from '@/components/TwoDLogo';
import ThreeLogo from '@/components/ThreeLogo';

export function Hero() {
  const { scrollY } = useScroll();
  const bgOffset = useTransform(scrollY, [0, 300], [0, -50]);

  return (
    <section
      id="hero"
      role="banner"
      aria-label="Learn with Andy"
      className="relative overflow-hidden h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-blue-50 to-white px-4"
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 bg-[url('/backgrounds/stars.svg')] bg-cover opacity-50"
        style={{ y: bgOffset }}
        aria-hidden="true"
      />

      {/* Headline */}
      <motion.h1
        className="z-10 text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        Master Your Learning Journey
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="z-10 max-w-xl text-base sm:text-lg md:text-xl text-gray-600 mb-6"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        One tutor. Every subject. Real results.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="z-10 flex flex-col sm:flex-row gap-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Button
          size="lg"
          asChild
          className="hover:-translate-y-1 transform transition"
        >
          <Link href="/signup" aria-label="Sign up for free">
            Get Started
          </Link>
        </Button>

        <Button
          variant="outline"
          size="lg"
          asChild
          className="hover:-translate-y-1 transform transition"
        >
          <Link href="#features" aria-label="Learn more about features">
            Learn More
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
