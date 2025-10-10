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
          <>
            <PomoPlayer />
            <SessionPanel />
          </>
        ) 
      case "sessionControl":
      default:
        return (
          <>
            <SessionControl />
            <SessionPanel />
          </>
        );
      }
  }

  return (
    <>
      <Header />
        {renderContent()}
      <BottomNav/>
    </>
  );
}

export default function MainScreen() {
  return (
    <PomoProvider>
      <div className="w-[420px] h-[640px] mx-auto p-4 bg-white rounded-3xl shadow-lg flex flex-col items-center">
        <MainContent />
      </div>
    </PomoProvider>
  );
}
