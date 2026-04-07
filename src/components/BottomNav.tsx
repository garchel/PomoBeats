import { memo } from "react";
import { FaTasks } from "react-icons/fa";
import { LuBookHeart, LuSettings2 } from "react-icons/lu";
import { usePomo } from "../context/PomoContext";
import NavButton from "./utils/NavButton";

function BottomNav() {
  const { currentPage, setPage } = usePomo();
  const currentSection =
    currentPage === "settings"
      ? "settings"
      : currentPage === "myLists"
        ? "myLists"
        : "session";

  return (
    <nav className="mt-auto flex w-full items-start justify-between gap-1 border-t px-1 pt-3">
      <NavButton
        icon={LuBookHeart}
        label="Minhas sessoes"
        onClick={() => setPage("myLists")}
        active={currentSection === "myLists"}
      />
      <NavButton
        icon={FaTasks}
        label="Sessao atual"
        onClick={() => setPage("sessionControl")}
        active={currentSection === "session"}
      />
      <NavButton
        icon={LuSettings2}
        label="Configuracoes"
        onClick={() => setPage("settings")}
        active={currentSection === "settings"}
      />
    </nav>
  );
}

export default memo(BottomNav);
