import { memo, useState, useCallback, useEffect, useRef } from "react";
import { usePomo } from "../context/PomoContext";
import { Coffee } from "lucide-react";
import { BsFire } from "react-icons/bs";
import { Play, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LuBookmark } from "react-icons/lu";

const SessionPanelComponent = () => {
  const { session, setTitle, setPage, currentPage, removeInterval, saveSession } =
    usePomo();

  const { title, intervals } = session;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Função para debug (ou futura exportação)
  useEffect(() => {
    console.log("Objeto completo atualizado:", session);
  }, [session]);

  const formatDuration = useCallback((totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }, []);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedIndex !== null) {
      removeInterval(selectedIndex); // atualização já é refletida no contexto
      setSelectedIndex(null);
    }
  }, [selectedIndex, removeInterval]);

  // Desselecionar quando clicar fora da lista
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setSelectedIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handlePage = () => {
    currentPage === "player"? setPage("sessionControl") : setPage("player")
  }

  return (
    <div className="mt-3 w-full flex flex-col" ref={listRef}>
        {/* Campo editável para o título */}
        <motion.div
          className="flex gap-3 relative w-full mb-4 items-center justify-center"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="peer w-[255px] border-b-2 mb-4 py-2 text-gray-700 text-lg font-semibold placeholder-transparent transition-colors outline-none border-gray-300 focus:border-red-500 text-center"
            placeholder="Título"
          />
          {title === "" && (
            <label className="absolute left-2/5 -translate-x-1/2 top-2 text-sm text-gray-400 pointer-events-none transition-all">
              Título da Sessão
            </label>
          )}
          
          {/*Botão de Salvar a lista */}
          { currentPage === "sessionControl" && 
          <motion.button
            className="cursor-pointer p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
            onClick={saveSession}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <LuBookmark size={18}/>
          </motion.button>
          }

          {/* Botão play/editar */}
          <motion.button
            className="cursor-pointer p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm"
            onClick={handlePage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            >
            {currentPage === "player" ? <Edit size={18} /> : <Play size={18} />}
          </motion.button>
        </motion.div>


      {/* Lista de sessões */}
      <div className="h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex flex-col space-y-2">
        {intervals.length === 0 ? (
          <p className="text-gray-400 text-center italic mt-4">
            Nenhum período adicionado
          </p>
        ) : (
          intervals.map((s, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <motion.div
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm border transition-shadow cursor-pointer
                  ${
                    isSelected
                      ? "bg-red-50 border-red-400 shadow-md"
                      : "bg-white border-gray-100 hover:shadow-md"
                  }
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="flex items-center space-x-2">
                  {s.type === "break" ? (
                    <Coffee
                      size={18}
                      className={`${
                        isSelected ? "text-red-400" : "text-orange-500"
                      }`}
                    />
                  ) : (
                    <BsFire
                      size={18}
                      className={`${
                        isSelected ? "text-red-400" : "text-red-500"
                      }`}
                    />
                  )}
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      isSelected ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center">
                  {/* Indicador de duração deslocado suavemente */}
                  <motion.span
                    className="text-sm text-gray-600"
                    animate={{ x: isSelected ? -24 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {formatDuration(s.duration)}
                  </motion.span>

                  {/* Botão de exclusão com animação */}
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
  );
};

export const SessionPanel = memo(SessionPanelComponent);
