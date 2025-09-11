import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { PropsWithChildren } from "react";

export { motion, AnimatePresence };

// Simple fade-in
export function FadeIn({ children, delay = 0, className = "", ...rest }: PropsWithChildren<{ delay?: number } & MotionProps> & { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Slide up with fade
export function SlideUp({ children, delay = 0, className = "", ...rest }: PropsWithChildren<{ delay?: number } & MotionProps> & { className?: string }) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for lists
export function Stagger({ children, delay = 0, className = "", ...rest }: PropsWithChildren<{ delay?: number } & MotionProps> & { className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Item variant to be used inside Stagger
export function StaggerItem({ children, className = "", ...rest }: PropsWithChildren<MotionProps> & { className?: string }) {
  return (
    <motion.div
      variants={{ hidden: { y: 10, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Hover/tap scale wrapper for buttons or cards
export function TapScale({ children, className = "", ...rest }: PropsWithChildren<MotionProps> & { className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
