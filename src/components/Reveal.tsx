'use client';

import { motion } from 'motion/react';

/** ページを開いたときに下からふわっと出す。物を手に取った感じにする */
export default function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 190, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
