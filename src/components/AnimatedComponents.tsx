import React from 'react';
import { motion } from 'framer-motion';

// ──────────────────────────────────────────────────────────────────────────────
// AnimatedList: wraps a list of items with a stagger container so children
// animate in one-by-one. Wrap each child in <AnimatedListItem>.
// ──────────────────────────────────────────────────────────────────────────────

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className }) => (
  <motion.div
    variants={listVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
// AnimatedListItem: each row slides + fades in as part of the stagger list
// ──────────────────────────────────────────────────────────────────────────────

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
};

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ children, className }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
// AnimatedCard: a single card that scales+fades in. Used for dashboard widgets.
// ──────────────────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);
