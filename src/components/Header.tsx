import { motion } from "framer-motion";
import { memo, type ReactNode } from "react";
import { Coffee } from "lucide-react";
import { LuMinus, LuMousePointerClick, LuX } from "react-icons/lu";
import { usePomo } from "../context/PomoContext";

function Header() {
  const {
    settings,
    toggleWindowClickThrough,
    minimizeWindow,
    closeWindow,
  } = usePomo();

  return (
    <motion.header
      className="drag-region flex items-center justify-between gap-3 rounded-[24px] border border-white/65 bg-white/70 px-4 py-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.9)] backdrop-blur"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-200/80">
          <Coffee size={22} aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold uppercase tracking-[0.08em] text-slate-800">
              PomoBeats
            </h1>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white">
              Desktop
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {settings.clickThroughEnabled ? "Click-through ativo" : "Janela clicavel"}
          </p>
        </div>
      </div>

      <div className="no-drag flex items-center gap-2">
        <button
          type="button"
          onClick={() => void toggleWindowClickThrough()}
          className={`inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-sm font-medium transition ${
            settings.clickThroughEnabled
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          aria-pressed={settings.clickThroughEnabled}
          title="Alternar click-through"
        >
          <LuMousePointerClick size={16} aria-hidden />
          <span className="hidden sm:inline">
            {settings.clickThroughEnabled ? "Liberar cliques" : "Ignorar cliques"}
          </span>
        </button>
        <WindowButton
          label="Minimizar"
          onClick={() => void minimizeWindow()}
          icon={<LuMinus size={18} aria-hidden />}
        />
        <WindowButton
          label="Fechar"
          onClick={() => void closeWindow()}
          danger
          icon={<LuX size={18} aria-hidden />}
        />
      </div>
    </motion.header>
  );
}

function WindowButton({
  label,
  icon,
  danger = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`no-drag inline-flex h-10 w-10 items-center justify-center rounded-2xl transition ${
        danger
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

export default memo(Header);
