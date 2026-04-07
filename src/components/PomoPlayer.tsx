import { memo } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { usePomo } from "../context/PomoContext";

const formatCountdown = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
};

const PomoPlayerComponent = () => {
  const {
    session,
    currentInterval,
    currentIntervalIndex,
    remainingSeconds,
    isPlaying,
    isSessionComplete,
    startPlayer,
    pausePlayer,
    resumePlayer,
    goToNextInterval,
    goToPreviousInterval,
    activeRadioCandidates,
    activeRadioChannelIndex,
    activeRadioChannelStates,
    isCurrentIntervalUsingRadio,
    selectRadioChannel,
  } = usePomo();

  const totalIntervals = session.intervals.length;
  const currentLabel = currentInterval?.type === "break" ? "Break" : "Pomo";

  return (
    <motion.div
      className="mt-1 flex w-full flex-col items-center rounded-3xl px-4 py-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {totalIntervals === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          Adicione periodos na sessao para iniciar o player.
        </div>
      ) : (
        <>
          <div className="mb-3 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              {isSessionComplete ? "Sessao concluida" : currentLabel}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-800">
              {currentInterval?.name ?? session.intervals[0].name}
            </h2>
            <p className="text-sm text-gray-500">
              {currentIntervalIndex === null ? 1 : currentIntervalIndex + 1} de {totalIntervals}
            </p>
          </div>

          <div className="mb-3 text-5xl font-bold leading-none text-gray-900">
            {formatCountdown(isSessionComplete ? 0 : remainingSeconds || (session.intervals[0]?.duration ?? 0) * 60)}
          </div>

          <div className="flex items-center space-x-5">
            <motion.button
              whileHover={{ scale: 1.1, rotate: -8, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full bg-gray-100 p-3 text-gray-600 shadow-md transition-all hover:bg-gray-200"
              onClick={goToPreviousInterval}
              title="Intervalo anterior"
            >
              <SkipBack size={24} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full bg-red-500 p-5 text-white shadow-xl transition-all"
              onClick={isPlaying ? pausePlayer : currentInterval ? resumePlayer : startPlayer}
              title={isPlaying ? "Pausar" : "Iniciar ou retomar"}
            >
              {isPlaying ? <Pause size={34} /> : <Play size={34} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 8, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full bg-gray-100 p-3 text-gray-600 shadow-md transition-all hover:bg-gray-200"
              onClick={goToNextInterval}
              title="Proximo intervalo"
            >
              <SkipForward size={24} />
            </motion.button>
          </div>

          {isCurrentIntervalUsingRadio && activeRadioCandidates.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              {activeRadioCandidates.slice(0, 3).map((candidate, index) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => selectRadioChannel(index)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeRadioChannelIndex === index
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={candidate.name}
                >
                  {activeRadioChannelStates[candidate.id] === "loading" && (
                    <LoaderCircle size={12} className="animate-spin" />
                  )}
                  {activeRadioChannelStates[candidate.id] === "error" && (
                    <X size={12} />
                  )}
                  Canal {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export const PomoPlayer = memo(PomoPlayerComponent);
