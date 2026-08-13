"use client";

import { motion } from "motion/react";
import { motionTheme } from "@/lib/motion-theme";

const springs = Object.entries(motionTheme.spring);

export function DesignSystemDemo() {
  return (
    <div className="token-demo__springs">
      {springs.map(([name, spring]) => (
        <motion.button
          type="button"
          key={name}
          whileHover={{ y: -7, scale: 1.025 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", ...spring }}
        >
          {name}
          <small>{spring.stiffness} / {spring.damping}</small>
        </motion.button>
      ))}
    </div>
  );
}

