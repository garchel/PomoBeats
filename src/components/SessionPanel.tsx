import { memo, useState, useCallback, useEffect, useRef } from "react";
import { usePomo } from "../context/PomoContext";
import { Coffee, Edit, Play, Trash2, Upload } from "lucide-react";
import { BsFire } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { LuBookmark } from "react-icons/lu";
import { formatDurationLabel, normalizeSession } from "../lib/sessionStorage";
import toast from "react-hot-toast";

const SessionPanelComponent = ({ compact = false }: { compact?: boolean }) => {
  const {
    session,
    setTitle,
    setPage,
    currentPage,
    currentIntervalIndex,
    isSessionComplete,
    isPlaying,
    removeInterval,
    saveSession,
    resumePlayer,
    startPlayer,
  } = usePomo();

  const { title, intervals } = session;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setSelectedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedIndex !== null) {
      removeInterval(selectedIndex);
      setSelectedIndex(null);
    }
  }, [removeInterval, selectedIndex]);

  const handlePage = () => {
    if (currentPage === "player") {
      setPage("sessionControl");
      return;
    }

    setPage("player");

    if (currentIntervalIndex === null || isSessionComplete) {
      startPlayer();
      return;
    }

    if (!isPlaying) {
      resumePlayer();
    }
  };

  const handleExport = useCallback(() => {
    const normalized = normalizeSession(session);

    if (!normalized) {
      toast.error("Adicione um titulo e ao menos um intervalo para exportar.");
      return;
    }

    const blob = new Blob([JSON.stringify(normalized, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${normalized.title}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
    toast.success("Sessao exportada com sucesso.");
  }, [session]);

  return (
    <div className={`flex w-full flex-col ${compact ? "mt-2 h-full min-h-0" : "mt-3"}`} ref={listRef}>
      {!compact && (
        <motion.div
          className="relative mb-4 flex w-full items-center justify-center gap-3"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="peer mb-4 w-[255px] border-b-2 border-gray-300 py-2 text-center text-lg font-semibold text-gray-700 outline-none transition-colors placeholder-transparent focus:border-red-500"
            placeholder="Titulo"
          />
          {title === "" && (
            <label className="pointer-events-none absolute left-2/5 top-2 -translate-x-1/2 text-sm text-gray-400 transition-all">
              Titulo da sessao
            </label>
          )}

          {currentPage === "sessionControl" && (
            <>
              <motion.button
                className="cursor-pointer rounded-full bg-orange-500 p-2 text-white shadow-sm hover:bg-orange-600"
                onClick={saveSession}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Salvar sessao"
              >
                <LuBookmark size={18} />
              </motion.button>
              <motion.button
                className="cursor-pointer rounded-full bg-slate-700 p-2 text-white shadow-sm hover:bg-slate-800"
                onClick={handleExport}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Exportar sessao"
              >
                <Upload size={18} />
              </motion.button>
            </>
          )}

          <motion.button
            className="cursor-pointer rounded-full bg-red-500 p-2 text-white shadow-sm hover:bg-red-600"
            onClick={handlePage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {currentPage === "player" ? <Edit size={18} /> : <Play size={18} />}
          </motion.button>
        </motion.div>
      )}

      {compact && (
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-700">Sequencia da sessao</h3>
          <button
            className="rounded-full bg-red-500 p-2 text-white shadow-sm hover:bg-red-600"
            onClick={handlePage}
            title="Voltar para edicao"
            type="button"
          >
            <Edit size={16} />
          </button>
        </div>
      )}

      <div
        className={`min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
          compact ? "pr-1" : "h-[240px]"
        }`}
      >
        <div className="flex flex-col space-y-2">
          {intervals.length === 0 ? (
            <p className="mt-4 text-center italic text-gray-400">Nenhum periodo adicionado</p>
          ) : (
            intervals.map((interval, idx) => {
              const isSelected = selectedIndex === idx;
              const isCurrent = currentIntervalIndex === idx;
              const isCompletedRow =
                compact &&
                ((isSessionComplete && intervals.length > 0) ||
                  (currentIntervalIndex !== null && idx < currentIntervalIndex));

              return (
                <motion.div
                  key={`${interval.type}-${interval.name}-${idx}`}
                  onClick={() => handleSelect(idx)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition-shadow ${
                    isSelected
                      ? "border-red-400 bg-red-50 shadow-md"
                      : isCompletedRow
                      ? "border-green-400 bg-green-50"
                      : compact && isCurrent
                      ? "border-red-300 bg-red-50/60 shadow-sm"
                      : "border-gray-100 bg-white hover:shadow-md"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="flex min-w-0 items-center space-x-2">
                    {interval.type === "break" ? (
                      <Coffee
                        size={18}
                        className={
                          isSelected
                            ? "text-red-400"
                            : isCompletedRow
                            ? "text-green-600"
                            : "text-orange-500"
                        }
                      />
                    ) : (
                      <BsFire
                        size={18}
                        className={
                          isSelected
                            ? "text-red-400"
                            : isCompletedRow
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      />
                    )}
                    <span
                      className={`truncate font-medium transition-colors duration-300 ${
                        isSelected
                          ? "text-red-600"
                          : isCompletedRow
                          ? "text-green-700"
                          : "text-gray-800"
                      }`}
                    >
                      {interval.name}
                    </span>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center">
                    <motion.span
                      className={`text-sm ${isCompletedRow ? "text-green-700" : "text-gray-600"}`}
                      animate={{ x: isSelected ? -24 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {formatDurationLabel(interval.duration)}
                    </motion.span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="ml-2 cursor-pointer text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                          }}
                        >
                          <Trash2 size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const SessionPanel = memo(SessionPanelComponent);
