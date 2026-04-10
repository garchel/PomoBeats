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
      <div className="min-h-0 flex-1">{renderContent()}</div>
      <BottomNav/>
    </div>
  );
}

export default function MainScreen() {
  return (
    <PomoProvider>
      <div className="mx-auto flex h-[640px] w-[420px] flex-col overflow-hidden rounded-3xl bg-white p-4 shadow-lg">
        <MainContent />
      </div>
    </PomoProvider>
  );
}
