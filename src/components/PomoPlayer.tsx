import { memo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePomo } from "../context/PomoContext";

const PomoPlayerComponent = () => {
  const { isPlaying, togglePlay } = usePomo();

  return (
    <motion.div
      className="flex flex-col items-center mt-2 h-[140px]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-8 mb-6">
        <motion.button
          whileHover={{ scale: 1.1, rotate: -10, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 shadow-md transition-all"
        >
          <SkipBack size={28} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.9 }}
          className="p-6 bg-red-500 rounded-full shadow-xl text-white transition-all"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={36} /> : <Play size={36} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.2, rotate: 10, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 shadow-md transition-all"
        >
          <SkipForward size={28} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export const PomoPlayer = memo(PomoPlayerComponent);