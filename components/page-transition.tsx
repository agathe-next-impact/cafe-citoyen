"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 1, filter: "blur(0px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 1, filter: "blur(3px)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}