import React from "react";
import { motion } from "framer-motion";

export const GameCardSkeleton: React.FC = () => (
  <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 p-4 space-y-4">
    <div className="w-full h-40 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse w-3/4" />
      <div className="h-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse w-1/2" />
    </div>
  </div>
);

export const ChessBoardSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full max-w-2xl mx-auto"
  >
    <div className="border-4 border-gray-700 rounded-lg overflow-hidden bg-black">
      <div className="grid grid-cols-8 gap-0">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className={`w-16 h-16 ${
              (i + Math.floor(i / 8)) % 2 === 0 ? "bg-gray-600" : "bg-gray-800"
            }`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export const LoadingOverlay: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50"
  >
    <div className="text-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-cyan-500 border-t-purple-500 rounded-full mx-auto"
      />
      <p className="text-cyan-300 font-semibold">{text}</p>
    </div>
  </motion.div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center py-2">
        <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded animate-pulse w-1/4" />
      </div>
    ))}
  </div>
);
