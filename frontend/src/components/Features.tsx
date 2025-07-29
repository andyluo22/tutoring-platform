'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

const FEATURES = [
  {
    title: 'Real-Time Dashboard',
    desc: 'Track sessions, credits, and progress all in one place.',
    icon: '/icons/dark-mac.svg',
  },
  {
    title: 'Flexible Booking',
    desc: 'Choose Zoom, Discord, or custom call types.',
    icon: '/icons/collabing.svg',
  },
  {
    title: 'AI-Powered Q&A',
    desc: 'Instant answers powered by GPT-4.',
    icon: '/icons/chatbot.svg',
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const card = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section
      id="features"
      ref={ref}
      className="py-20 bg-white px-4"
      aria-labelledby="features-heading"
    >
      <h2
        id="features-heading"
        className="text-3xl sm:text-4xl font-bold text-center mb-12"
      >
        Awesome Features
      </h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {FEATURES.map(({ title, desc, icon }) => (
          <motion.div
            key={title}
            className="p-6 bg-gray-50 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-2xl transition-shadow"
            variants={card}
          >
            <Image
              src={icon}
              alt=""
              width={100}
              height={100}
              aria-hidden="true"
              className="mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
