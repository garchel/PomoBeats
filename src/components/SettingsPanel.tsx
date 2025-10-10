// components/SettingsPanel.tsx
import { useCallback } from "react";
import { motion } from "framer-motion";
import { usePomo } from "../context/PomoContext";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { FaAngleLeft } from "react-icons/fa";
import NavButton from "./utils/NavButton";

// Tipos de alarmes e músicas padrão
const alarmOptions = ["Beep", "Chime", "Bell"];
const intervalTracks = ["Track 1", "Track 2", "Track 3"];


export default function SettingsPanel() {
  const { settings, updateSettings, setPage } = usePomo();

  // Handle file upload for alarm
  const handleAlarmFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        updateSettings({
          customAlarmPath: URL.createObjectURL(e.target.files[0]),
        });
      }
    },
    [updateSettings]
  );

  // Handle file upload for interval music
  const handleIntervalFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        updateSettings({
          customIntervalTrackPath: URL.createObjectURL(e.target.files[0]),
        });
      }
    },
    [updateSettings]
  );

  return (
    <motion.div
      className="flex flex-col w-full h-full px-6 py-4 overflow-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
        <NavButton icon={FaAngleLeft} onClick={() => setPage("sessionControl")} ClassName="self-start" />
        <h2 className="text-2xl text-center mb-5 font-semibold text-gray-800">Configurações</h2>

      {/* Tasks */}
      <section className="mb-8">
        <h3 className="font-medium text-gray-800 mb-3">Tasks</h3>
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Auto Check Tasks"
            enabled={settings.autoCheckTasks}
            onChange={() =>
              updateSettings({ autoCheckTasks: !settings.autoCheckTasks })
            }
          />
          <ToggleRow
            label="Auto Start Breaks"
            enabled={settings.autoStartBreaks}
            onChange={() =>
              updateSettings({ autoStartBreaks: !settings.autoStartBreaks })
            }
          />
          <ToggleRow
            label="Auto Start Pomos"
            enabled={settings.autoStartPomos}
            onChange={() =>
              updateSettings({ autoStartPomos: !settings.autoStartPomos })
            }
          />
        </div>
      </section>

      {/* Alarm */}
      <section className="mb-10">
        <h3 className="font-medium text-gray-700 mb-3">Alarm</h3>
        <div className="flex flex-col gap-4">
          <DropdownRow
            label="Alarm Sound"
            options={alarmOptions}
            selected={settings.selectedAlarm}
            onSelect={(option) => updateSettings({ selectedAlarm: option })}
          />
          <ToggleRow
            label="Custom Alarm Sound"
            enabled={settings.customAlarm}
            onChange={() =>
              updateSettings({ customAlarm: !settings.customAlarm })
            }
          />
          {settings.customAlarm && (
            <input
              type="file"
              accept="audio/*"
              onChange={handleAlarmFileChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          )}
          {settings.customAlarmPath && (
            <span className="text-gray-500 text-sm mt-1">
              Selecionado: {settings.customAlarmPath}
            </span>
          )}
        </div>
      </section>

      {/* Interval Music */}
      <section className="mb-8">
        <h3 className="font-medium text-gray-700 mb-3">Interval Music</h3>
        <div className="flex flex-col gap-4">
          <DropdownRow
            label="Interval Track"
            options={intervalTracks}
            selected={settings.selectedIntervalTrack}
            onSelect={(option) =>
              updateSettings({ selectedIntervalTrack: option })
            }
          />
          <ToggleRow
            label="Custom Interval Track"
            enabled={settings.customIntervalTrackEnabled}
            onChange={() =>
              updateSettings({
                customIntervalTrackEnabled:
                  !settings.customIntervalTrackEnabled,
              })
            }
          />
          {settings.customIntervalTrackEnabled && (
            <input
              type="file"
              accept="audio/*"
              onChange={handleIntervalFileChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          )}
          {settings.customIntervalTrackPath && (
            <span className="text-gray-500 text-sm mt-1">
              Selecionado: {settings.customIntervalTrackPath}
            </span>
          )}
        </div>
      </section>
    </motion.div>
  );
}

// Toggle reutilizável
function ToggleRow({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-800">{label}</span>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-red-500"
      />
    </div>
  );
}

// Dropdown reutilizável (Select shadcn)
function DropdownRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-800">{label}</span>
      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger className="w-40 border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none">
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent className="w-40 ">
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="hover:bg-red-100 focus:bg-red-200 cursor-pointer"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
