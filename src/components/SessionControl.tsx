import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { usePomo } from "../context/PomoContext";
import toast, { Toaster } from "react-hot-toast";

export default function SessionControl() {
  const { addPomo, addBreak, isBreak, toggleBreak } = usePomo();

  const [name, setName] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [selectedPart, setSelectedPart] = useState<"hours" | "minutes" | null>(
    null
  );
  const [durationFocused, setDurationFocused] = useState(false);

  const intervalLabel = isBreak ? "Intervalo" : "Pomo";

  const handleAddInterval = useCallback(() => {
    const totalMinutes = hours * 60 + minutes;

    if (!name.trim()) {
      toast.error(`Digite um nome para o ${isBreak ? "intervalo" : "pomo"}.`);
      return;
    }

    if (totalMinutes < 1) {
      toast.error("O periodo deve ter ao menos 1 minuto.");
      return;
    }

    const newInterval = {
      name,
      duration: totalMinutes,
    };

    if (isBreak) {
      addBreak(newInterval);
    } else {
      addPomo(newInterval);
    }

    setName("");
    setHours(0);
    setMinutes(0);
    setSelectedPart(null);
    setDurationFocused(false);
    toast.success(`${isBreak ? "Intervalo" : "Pomo"} adicionado com sucesso.`);
  }, [addBreak, addPomo, hours, isBreak, minutes, name]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!selectedPart) return;

      if (/^\d$/.test(e.key)) {
        const num = parseInt(e.key, 10);
        if (selectedPart === "hours") {
          setHours((prev) => {
            const digits = prev
              .toString()
              .padStart(2, "0")
              .split("")
              .map(Number);
            return Math.min(digits[1] * 10 + num, 23);
          });
        } else {
          setMinutes((prev) => {
            const digits = prev
              .toString()
              .padStart(2, "0")
              .split("")
              .map(Number);
            return Math.min(digits[1] * 10 + num, 59);
          });
        }
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedPart === "hours") {
          setHours((prev) => parseInt(prev.toString().padStart(2, "0")[0], 10));
        } else {
          setMinutes((prev) => parseInt(prev.toString().padStart(2, "0")[0], 10));
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        setSelectedPart(selectedPart === "hours" ? "minutes" : "hours");
      }
    },
    [selectedPart]
  );

  return (
    <>
      <motion.div
        className="mb-2 flex h-[140px] w-full flex-col items-center space-y-4"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-4 py-2 font-medium transition-colors ${
              !isBreak ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
            onClick={() => isBreak && toggleBreak()}
          >
            🍅 Pomo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-4 py-2 font-medium transition-colors ${
              isBreak ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
            onClick={() => !isBreak && toggleBreak()}
          >
            ☕ Break
          </motion.button>
        </div>

        <div className="flex w-full items-center justify-center space-x-3">
          <motion.div
            className="relative w-40"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              className="peer w-full border-b-2 border-gray-300 py-2 font-medium text-gray-800 outline-none transition-colors placeholder-transparent focus:border-red-500"
              placeholder={`Nome do ${intervalLabel.toLowerCase()}`}
            />
            <label className="pointer-events-none absolute left-0 -top-2.5 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-red-500">
              Nome do {intervalLabel.toLowerCase()}
            </label>
          </motion.div>

          <motion.div
            className={`flex cursor-text space-x-1 border-b-2 px-2 py-1 text-lg font-semibold transition-colors ${
              durationFocused ? "border-red-500" : "border-gray-300"
            }`}
            tabIndex={0}
            onKeyDown={handleKey}
            onFocus={() => setDurationFocused(true)}
            onBlur={() => {
              setDurationFocused(false);
              setSelectedPart(null);
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className={`px-1 ${selectedPart === "hours" ? "rounded bg-red-100 text-red-600" : ""}`}
              onClick={() => setSelectedPart("hours")}
            >
              {hours.toString().padStart(2, "0")}
            </span>
            <span>:</span>
            <span
              className={`px-1 ${selectedPart === "minutes" ? "rounded bg-red-100 text-red-600" : ""}`}
              onClick={() => setSelectedPart("minutes")}
            >
              {minutes.toString().padStart(2, "0")}
            </span>
          </motion.div>

          <motion.button
            className="cursor-pointer rounded-full bg-gray-100 p-3 text-red-500 shadow-md hover:bg-gray-200"
            onClick={handleAddInterval}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </motion.div>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
