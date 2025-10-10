// components/BottomNav.tsx
import { FaTasks  } from "react-icons/fa"
import { BiExport, BiImport } from "react-icons/bi";
import { LuBookHeart, LuSettings2 } from "react-icons/lu";
import { memo, useRef } from "react";
import { usePomo } from "../context/PomoContext";
import NavButton from "./utils/NavButton"

function BottomNav() {
  const { session, setSession, setPage } = usePomo();
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Salvar em arquivo JSON
  const exportList = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.title || "sessão"}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Abrir seletor de arquivos
  const handleImportList = () => {
    fileInputRef.current?.click();
  };

  // Importar JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sessions && Array.isArray(data.sessions)) {
          setSession(data);
        } else {
          alert("Arquivo inválido!");
        }
      } catch {
        alert("Erro ao ler o arquivo.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <nav className="flex justify-between mt-6 pt-4 border-t text-gray-600 px-16 gap-6">
        <NavButton icon={LuBookHeart} label="Minhas Sessões" onClick={() => setPage("myLists")} />
        {/* <NavButton icon={BiExport} label="Exportar" onClick={handleSaveList} /> */}
        <NavButton icon={FaTasks} label="Sessão Atual" onClick={() => setPage("sessionControl")} />
        {/* <NavButton icon={BiImport} label="Importar" onClick={handleImportList} /> */}
        <NavButton icon={LuSettings2} label="Configurações" onClick={() => setPage("settings")} />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </nav>
    </>
  );
}

export default memo(BottomNav);
