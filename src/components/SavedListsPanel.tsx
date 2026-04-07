import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, Upload } from "lucide-react";
import { usePomo } from "../context/PomoContext";
import { FaAngleLeft } from "react-icons/fa";
import NavButton from "./utils/NavButton";
import toast from "react-hot-toast";
import {
  deleteSessionFromStorage,
  formatDurationLabel,
  getSavedSessions,
  importSessionToStorage,
  loadSessionByTitle,
  normalizeSession,
} from "../lib/sessionStorage";
import type { SavedSessionMetadata } from "../types/pomo";

export default function SavedListsPanel() {
  const { setPage, setSession } = usePomo();
  const [savedLists, setSavedLists] = useState<SavedSessionMetadata[]>([]);

  const refreshSavedLists = useCallback(() => {
    setSavedLists(getSavedSessions());
  }, []);

  useEffect(() => {
    refreshSavedLists();
  }, [refreshSavedLists]);

  const handleLoad = useCallback(
    (list: SavedSessionMetadata) => {
      const parsedList = loadSessionByTitle(list.title);

      if (parsedList) {
        setSession(parsedList);
        setPage("sessionControl");
        toast.success(`Sessao "${list.title}" carregada com sucesso.`);
      } else {
        toast.error("Nao foi possivel carregar esta sessao.");
      }
    },
    [setPage, setSession]
  );

  const handleDelete = useCallback(
    (list: SavedSessionMetadata) => {
      deleteSessionFromStorage(list.title);
      refreshSavedLists();
      toast.success(`Sessao "${list.title}" excluida com sucesso.`);
    },
    [refreshSavedLists]
  );

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const parsed = JSON.parse(loadEvent.target?.result as string);
          const normalized = normalizeSession(parsed);

          if (!normalized) {
            toast.error("Arquivo invalido. Use uma sessao exportada pelo app.");
            return;
          }

          const importedSession = importSessionToStorage(normalized);
          refreshSavedLists();
          setSession(importedSession);
          setPage("sessionControl");
          toast.success(`Sessao "${importedSession.title}" importada com sucesso.`);
        } catch {
          toast.error("Nao foi possivel ler o arquivo selecionado.");
        } finally {
          event.target.value = "";
        }
      };

      reader.readAsText(file);
    },
    [refreshSavedLists, setPage, setSession]
  );

  return (
    <motion.div
      className="flex flex-col w-full h-full px-6 py-4 overflow-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <NavButton icon={FaAngleLeft} onClick={() => setPage("sessionControl")} ClassName="self-start" />

      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Sessoes salvas</h2>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600">
          <Upload size={16} />
          Importar sessao
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>

      {savedLists.length === 0 ? (
        <p className="text-center text-gray-600">Voce ainda nao possui sessoes salvas.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {savedLists.map((list) => (
            <li
              key={list.title}
              className="flex items-center justify-between rounded border-b border-gray-200 py-2 transition-colors hover:bg-gray-50"
            >
              <div>
                <span className="font-medium text-gray-800">{list.title}</span>
                <p className="text-xs text-gray-500">
                  {list.intervalCount} intervalos • {formatDurationLabel(list.totalDuration)} • {new Date(list.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(list)}
                  className="p-1 hover:text-green-500"
                  title="Carregar sessao"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(list)}
                  className="p-1 hover:text-red-500"
                  title="Excluir sessao"
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
