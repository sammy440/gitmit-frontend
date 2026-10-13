"use client";

import { motion } from "motion/react";
import Image, { type StaticImageData } from "next/image";

/** The hero photo, settling in with a slow zoom. */
export function HeroBackdrop({ src }: { src: StaticImageData }) {
  return (
    <motion.div
      className="absolute inset-0 -z-20"
      initial={{ scale: 1.12, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ scale: { duration: 2.4, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 1 } }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        placeholder="blur"
        fetchPriority="high"
        loading="eager"
        className="object-cover object-[60%_center]"
      />
    </motion.div>
  );
}
