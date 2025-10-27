import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography } from "@mui/material";
import tyreImg from "../assets/tyre.png"; // 🛞 place tyre.png in src/assets/

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 6000); // keep for 6 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 2000;
  // Generate a smooth x-position vector [0, 2, 4, ..., 2000]
  let xPositions = Array.from({ length: 1001 }, (_, i) => i * 2);
  const holdFrames = 200; // ≈ first 0.9s if duration = 6s
  xPositions = [
    ...Array(holdFrames).fill(0),
    ...xPositions.slice(holdFrames).map((x) => x - xPositions[holdFrames]), // keep continuity
  ];
  // Rotate one full turn (360°) every ~200px of travel for realism
  const rotation = xPositions.map((x) => (x / 170) * 360);
  // Generate 150-frame fall from -700 → -330 (accelerating)
  const yFall = Array.from({ length: 150 }, (_, i) => {
    const t = i / 149; // normalized 0 → 1
    return -750 + t ** 2 * (800 - 380); // quadratic ease-in
  });

  const yBounce = Array.from({ length: 850 }, (_, i) => {
    const t = i / 850;
  });

  const yPositions = [...yFall, ...yBounce];

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2.3, ease: "easeInOut" }}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #DA291C 0%, #101820 100%)",
          color: "#EFEFEF",
          overflow: "hidden",
          zIndex: 9999,
        }}
      >
        {/* --- Tyre animation --- */}
        <motion.img
          src={tyreImg}
          alt="tyre"
          style={{
            width: 120,
            height: 120,
            position: "absolute",
            bottom: "20%",
          }}
          initial={{ y: -340, rotate: 0 }}
          animate={{
            opacity: [0, 0.5, 1, 1, 1, 1],
            y: yPositions,
            rotate: rotation,
            x: xPositions,
          }}
          transition={{
            duration: 6.2,
            ease: "linear",
          }}
        />

        {/* --- Text --- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.1 }}
        >
          <Typography
            variant="h5"
            sx={{
              mt: 4,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            Garage Inventory System
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ opacity: 0.8, mt: 1, fontStyle: "italic" }}
          >
            dev: joey curran | github.com/joeycurran
          </Typography>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
