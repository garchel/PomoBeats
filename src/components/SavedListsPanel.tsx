import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2 } from "lucide-react";
import { usePomo } from "../context/PomoContext";
import type { SessionObject } from "../context/PomoContext";
import { FaAngleLeft } from "react-icons/fa";
import NavButton from "./utils/NavButton";
import toast from "react-hot-toast";

interface SavedListItem {
  title: string;
  sessions: number;
  timestamp: string;
}

export default function SavedListsPanel() {
  const { setPage, setSession } = usePomo();

  const [savedLists, setSavedLists] = useState<SavedListItem[]>([]);

  useEffect(() => {
    // A chave do localStorage deve ser a mesma utilizada para salvar a lista.
    // No seu último código, você mudou para 'savedPomoSessions'.
    // Mantenha a consistência.
    const savedListsRaw = localStorage.getItem("savedPomoSessions");
    const lists: SavedListItem[] = savedListsRaw ? JSON.parse(savedListsRaw) : [];
    setSavedLists(lists);
  }, []);

  const handleLoad = useCallback(
    (list: SavedListItem) => {
      const parsedList: SessionObject = JSON.parse(
        localStorage.getItem(list.title) || "{}"
      );
      if (parsedList.intervals?.length) {
        setSession(parsedList);
        setPage("sessionControl");
        toast.success(`Sessão "${list.title}" carregada com sucesso! ✨`);
      } else {
        // CORREÇÃO: substitui o alert por toast.error para manter a consistência da UI
        toast.error("Não foi possível carregar esta lista. 😕");
      }
    },
    [setSession, setPage]
  );

  const handleDelete = useCallback(
    (list: SavedListItem) => {
      localStorage.removeItem(list.title);

      // A chave do localStorage deve ser a mesma utilizada para salvar a lista
      const savedSessionsRaw = localStorage.getItem("savedPomoSessions");
      const existingSessions = savedSessionsRaw ? JSON.parse(savedSessionsRaw) : [];

      const allLists = existingSessions.filter((l: SavedListItem) => l.title !== list.title);

      localStorage.setItem("savedPomoSessions", JSON.stringify(allLists));
      setSavedLists(allLists);

      // ADIÇÃO: toast para notificar o sucesso da exclusão
      toast.success(`Sessão "${list.title}" excluída com sucesso! 🗑️`);
    },
    [] // Removi savedLists pois a nova implementação busca a lista atualizada do localStorage
  );

  return (
    <motion.div
      className="flex flex-col w-full h-full px-6 py-4 overflow-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <NavButton icon={FaAngleLeft} onClick={() => setPage("sessionControl")} ClassName="self-start" />

      <h2 className="text-2xl text-center mb-5 font-semibold text-gray-800">
        Sessões Salvas
      </h2>

      {savedLists.length === 0 ? (
        <p className="text-gray-600 text-center">
          Você ainda não possui sessões salvas.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {savedLists.map((list) => (
            <li
              key={list.title}
              className="flex justify-between items-center border-b border-gray-200 py-2 hover:bg-gray-50 transition-colors rounded"
            >
              <div>
                <span className="font-medium text-gray-800">{list.title}</span>
                <p className="text-xs text-gray-500">
                  {list.sessions} sessões • {list.timestamp}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(list)}
                  className="p-1 hover:text-green-500"
                  title="Carregar lista"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(list)}
                  className="p-1 hover:text-red-500"
                  title="Deletar lista"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}