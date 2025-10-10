import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { usePomo } from "../context/PomoContext";
import toast, { Toaster } from "react-hot-toast";

export default function SessionControl() {
  const {
    session,
    addPomo,
    addBreak,
    currentIntervalIndex,
    isBreak,
    toggleBreak,
    playerActive,
  } = usePomo();

  const intervals = session.intervals;

  const [name, setName] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [selectedPart, setSelectedPart] = useState<"hours" | "minutes" | null>(
    null
  );
  const [durationFocused, setDurationFocused] = useState(false);

  const handleAddInterval = useCallback(() => {
    const totalMinutes = hours * 60 + minutes;

    if (!name.trim()) {
      toast.error(" Digite um nome para a sessão 😅 ✏️");
      return;
    }

    if (totalMinutes < 1) {
      toast.error("A sessão deve ter ao menos 1 minuto 😅 ⏰", {
        style: {
          minWidth: "280px", // largura mínima
          maxWidth: "400px", // largura máxima
          whiteSpace: "nowrap", // impede quebra de linha
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      });
      return;
    }

    const newInterval = {
      name,
      duration: totalMinutes,
    };

    isBreak? addBreak(newInterval) : addPomo(newInterval)

    setName("");
    setHours(0);
    setMinutes(0);
    setSelectedPart(null);
    setDurationFocused(false);
    toast.success("Sessão adicionada com sucesso! 🫡");
  }, [name, hours, minutes, isBreak, addPomo, addBreak]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!selectedPart) return;

      if (/^\d$/.test(e.key)) {
        const num = parseInt(e.key);
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
          setHours((prev) => parseInt(prev.toString().padStart(2, "0")[0]));
        } else {
          setMinutes((prev) => parseInt(prev.toString().padStart(2, "0")[0]));
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        setSelectedPart(selectedPart === "hours" ? "minutes" : "hours");
      }
    },
    [selectedPart]
  );

  // Mostrar intervalo ativo
  if (playerActive && currentIntervalIndex !== null) {
    const current = intervals[currentIntervalIndex];
    return (
      <>
        <motion.div
          className="flex flex-col items-center mt-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-medium text-gray-800">
            {current.name} | {isBreak ? "break" : "pomo"}
          </h2>
          <div className="text-5xl font-bold mt-2">{current.duration}:00</div>
        </motion.div>
        <Toaster position="top-center" reverseOrder={false} />
      </>
    );
  }

  return (
    <>
      <motion.div
        className="flex flex-col items-center space-y-4 w-full mb-2  h-[140px]"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Toggle Pomo / Break */}
        <div className="flex items-center space-x-2 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              !isBreak ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
            onClick={() => isBreak && toggleBreak()}
          >
            Pomo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              isBreak ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
            onClick={() => !isBreak && toggleBreak()}
          >
            Break
          </motion.button>
        </div>

        {/* Inputs */}
        <div className="flex items-center space-x-3 w-full justify-center">
          {/* Nome da sessão */}
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
              className="peer w-full border-b-2 py-2 text-gray-800 placeholder-transparent font-medium transition-colors outline-none border-gray-300 focus:border-red-500"
              placeholder="Nome do período"
            />
            <label className="absolute left-0 -top-2.5 text-sm transition-all pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-red-500 peer-focus:text-sm">
              Nome do período
            </label>
          </motion.div>

          {/* Duração HH:MM interativa */}
          <motion.div
            className={`flex space-x-1 text-lg font-semibold border-b-2 px-2 py-1 cursor-text transition-colors ${
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
              className={`px-1 ${
                selectedPart === "hours"
                  ? "bg-red-100 text-red-600 rounded"
                  : ""
              }`}
              onClick={() => setSelectedPart("hours")}
            >
              {hours.toString().padStart(2, "0")}
            </span>
            <span>:</span>
            <span
              className={`px-1 ${
                selectedPart === "minutes"
                  ? "bg-red-100 text-red-600 rounded"
                  : ""
              }`}
              onClick={() => setSelectedPart("minutes")}
            >
              {minutes.toString().padStart(2, "0")}
            </span>
          </motion.div>

          {/* Botão adicionar */}
          <motion.button
            className="cursor-pointer p-3 bg-gray-100 rounded-full text-red-500 shadow-md hover:bg-gray-200"
            onClick={handleAddInterval}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </motion.div>
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* ✅ toast container */}
    </>
  );
}
