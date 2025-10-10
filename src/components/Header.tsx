import { Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";

function Header() {
  return (
    <motion.header
      className="flex items-center justify-center space-x-2 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Coffee size={28} className="text-red-500" aria-hidden />
      <h1 className="text-2xl font-bold text-red-500">PomoBeats</h1>
    </motion.header>
  );
}

export default memo(Header);
