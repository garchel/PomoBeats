import Header from "./components/Header";
import { PomoPlayer } from "./components/PomoPlayer";
import { SessionPanel } from "./components/SessionPanel";
import SessionControl from "./components/SessionControl";
import BottomNav from "./components/BottomNav";
import SettingsPanel from "./components/SettingsPanel";
import { PomoProvider, usePomo } from "./context/PomoContext";
import SavedListsPanel from "./components/SavedListsPanel";

function MainContent() {
  const { currentPage } = usePomo();

  const renderContent = () => {
    switch (currentPage) {
      case "settings":
        return <SettingsPanel/>
      case "myLists":
        return <SavedListsPanel/>
      case "player":
        return (
          <div className="flex h-full min-h-0 flex-col">
            <PomoPlayer />
            <SessionPanel compact />
          </div>
        ) 
      case "sessionControl":
      default:
        return (
          <div className="flex h-full min-h-0 flex-col">
            <SessionControl />
            <SessionPanel />
          </div>
        );
      }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      <div className="min-h-0 flex-1 pt-3">{renderContent()}</div>
      <BottomNav/>
    </div>
  );
}

export default function MainScreen() {
  return (
    <PomoProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,0.96)_35%,_rgba(226,232,240,0.98)_100%)] p-3 text-slate-900">
        <MainContent />
      </div>
    </PomoProvider>
  );
}
