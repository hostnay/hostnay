"use client";

import { motion } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

export const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionButton = motion.button;
