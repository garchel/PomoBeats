import { useCallback } from "react";
import { motion } from "framer-motion";
import { FaAngleLeft } from "react-icons/fa";
import { usePomo } from "../context/PomoContext";
import { RADIO_CATEGORIES } from "../lib/radioCatalog";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { MusicSource } from "../types/pomo";
import NavButton from "./utils/NavButton";

const alarmOptions = ["Beep", "Chime", "Bell"];
const trackOptions = ["Track 1", "Track 2", "Track 3"];
const musicSourceOptions: Array<{ value: MusicSource; label: string }> = [
  { value: "generated", label: "Gerado" },
  { value: "radio", label: "Radio" },
  { value: "custom", label: "Arquivo customizado" },
];

export default function SettingsPanel() {
  const { settings, updateSettings, setPage } = usePomo();

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

  const handleStudyFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        updateSettings({
          customStudyTrackPath: URL.createObjectURL(e.target.files[0]),
        });
      }
    },
    [updateSettings]
  );

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

  const studySourceLabel =
    musicSourceOptions.find((option) => option.value === settings.studyMusicSource)
      ?.label ?? musicSourceOptions[0].label;
  const intervalSourceLabel =
    musicSourceOptions.find((option) => option.value === settings.intervalMusicSource)
      ?.label ?? musicSourceOptions[0].label;
  const studyRadioLabel =
    RADIO_CATEGORIES.find((option) => option.value === settings.studyRadioCategory)
      ?.label ?? RADIO_CATEGORIES[0].label;
  const intervalRadioLabel =
    RADIO_CATEGORIES.find((option) => option.value === settings.intervalRadioCategory)
      ?.label ?? RADIO_CATEGORIES[0].label;

  return (
    <motion.div
      className="flex h-full w-full flex-col overflow-auto px-6 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <NavButton
        icon={FaAngleLeft}
        onClick={() => setPage("sessionControl")}
        ClassName="self-start"
      />
      <h2 className="mb-5 text-center text-2xl font-semibold text-gray-800">
        Configuracoes
      </h2>

      <section className="mb-8">
        <h3 className="mb-3 font-medium text-gray-800">Tasks</h3>
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

      <section className="mb-8">
        <h3 className="mb-3 font-medium text-gray-800">Som</h3>
        <div className="flex flex-col gap-5">
          <SoundSection>
            <ToggleRow
              label="Alarme"
              enabled={settings.alarmEnabled}
              onChange={() =>
                updateSettings({ alarmEnabled: !settings.alarmEnabled })
              }
            />
            {settings.alarmEnabled && (
              <>
                <DropdownRow
                  label="Som"
                  options={alarmOptions}
                  selected={settings.selectedAlarm}
                  onSelect={(option) => updateSettings({ selectedAlarm: option })}
                />
                <RangeRow
                  label="Alarm Volume"
                  value={settings.alarmVolume}
                  onChange={(value) => updateSettings({ alarmVolume: value })}
                />
                <ToggleRow
                  label="Usar arquivo customizado"
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
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                )}
                {settings.customAlarmPath && (
                  <span className="text-sm text-gray-500">
                    Selecionado: {settings.customAlarmPath}
                  </span>
                )}
              </>
            )}
          </SoundSection>

          <SoundSection>
            <ToggleRow
              label="Musica de estudo"
              enabled={settings.studyMusicEnabled}
              onChange={() =>
                updateSettings({
                  studyMusicEnabled: !settings.studyMusicEnabled,
                })
              }
            />
            {settings.studyMusicEnabled && (
              <>
                <DropdownRow
                  label="Origem"
                  options={musicSourceOptions.map((option) => option.label)}
                  selected={studySourceLabel}
                  onSelect={(option) =>
                    updateSettings({
                      studyMusicSource:
                        musicSourceOptions.find((item) => item.label === option)
                          ?.value ?? "generated",
                    })
                  }
                />
                {settings.studyMusicSource === "generated" && (
                  <DropdownRow
                    label="Som"
                    options={trackOptions}
                    selected={settings.selectedStudyTrack}
                    onSelect={(option) =>
                      updateSettings({ selectedStudyTrack: option })
                    }
                  />
                )}
                {settings.studyMusicSource === "radio" && (
                  <DropdownRow
                    label="Categoria"
                    options={RADIO_CATEGORIES.map((option) => option.label)}
                    selected={studyRadioLabel}
                    onSelect={(option) =>
                      updateSettings({
                        studyRadioCategory:
                          RADIO_CATEGORIES.find((item) => item.label === option)
                            ?.value ?? "lofi",
                      })
                    }
                  />
                )}
                {settings.studyMusicSource === "custom" && (
                  <>
                    <ToggleRow
                      label="Usar arquivo customizado"
                      enabled={settings.customStudyTrackEnabled}
                      onChange={() =>
                        updateSettings({
                          customStudyTrackEnabled: !settings.customStudyTrackEnabled,
                        })
                      }
                    />
                    {settings.customStudyTrackEnabled && (
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleStudyFileChange}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    )}
                    {settings.customStudyTrackPath && (
                      <span className="text-sm text-gray-500">
                        Selecionado: {settings.customStudyTrackPath}
                      </span>
                    )}
                  </>
                )}
                <RangeRow
                  label="Study Volume"
                  value={settings.studyTrackVolume}
                  onChange={(value) => updateSettings({ studyTrackVolume: value })}
                />
              </>
            )}
          </SoundSection>

          <SoundSection>
            <ToggleRow
              label="Musica de intervalo"
              enabled={settings.intervalMusicEnabled}
              onChange={() =>
                updateSettings({
                  intervalMusicEnabled: !settings.intervalMusicEnabled,
                })
              }
            />
            {settings.intervalMusicEnabled && (
              <>
                <DropdownRow
                  label="Origem"
                  options={musicSourceOptions.map((option) => option.label)}
                  selected={intervalSourceLabel}
                  onSelect={(option) =>
                    updateSettings({
                      intervalMusicSource:
                        musicSourceOptions.find((item) => item.label === option)
                          ?.value ?? "generated",
                    })
                  }
                />
                {settings.intervalMusicSource === "generated" && (
                  <DropdownRow
                    label="Som"
                    options={trackOptions}
                    selected={settings.selectedIntervalTrack}
                    onSelect={(option) =>
                      updateSettings({ selectedIntervalTrack: option })
                    }
                  />
                )}
                {settings.intervalMusicSource === "radio" && (
                  <DropdownRow
                    label="Categoria"
                    options={RADIO_CATEGORIES.map((option) => option.label)}
                    selected={intervalRadioLabel}
                    onSelect={(option) =>
                      updateSettings({
                        intervalRadioCategory:
                          RADIO_CATEGORIES.find((item) => item.label === option)
                            ?.value ?? "lofi",
                      })
                    }
                  />
                )}
                {settings.intervalMusicSource === "custom" && (
                  <>
                    <ToggleRow
                      label="Usar arquivo customizado"
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
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    )}
                    {settings.customIntervalTrackPath && (
                      <span className="text-sm text-gray-500">
                        Selecionado: {settings.customIntervalTrackPath}
                      </span>
                    )}
                  </>
                )}
                <RangeRow
                  label="Interval Volume"
                  value={settings.intervalTrackVolume}
                  onChange={(value) =>
                    updateSettings({ intervalTrackVolume: value })
                  }
                />
              </>
            )}
          </SoundSection>
        </div>
      </section>
    </motion.div>
  );
}

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
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-800">{label}</span>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-red-500"
      />
    </div>
  );
}

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
              className="cursor-pointer hover:bg-red-100 focus:bg-red-200"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SoundSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function RangeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-800">{label}</span>
      <div className="flex w-48 items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-red-500"
        />
        <span className="w-10 text-right text-sm text-gray-500">{value}%</span>
      </div>
    </div>
  );
}
