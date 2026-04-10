import { useCallback } from "react";
import { motion } from "framer-motion";
import { FaAngleLeft } from "react-icons/fa";
import { Info } from "lucide-react";
import { usePomo } from "../context/PomoContext";
import { RADIO_CATEGORIES } from "../lib/radioCatalog";
import {
  getAlarmOptionLabel,
  getMusicSourceLabel,
  getRadioCategoryLabel,
  getTrackOptionLabel,
  LANGUAGE_OPTIONS,
} from "../lib/i18n";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { AppLanguage, MusicSource } from "../types/pomo";
import NavButton from "./utils/NavButton";

const alarmOptions = ["Beep", "Chime", "Bell"] as const;
const trackOptions = ["Track 1", "Track 2", "Track 3"] as const;

export default function SettingsPanel() {
  const { settings, updateSettings, setPage, language, t } = usePomo();

  const handleAlarmFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      updateSettings({ customAlarmPath: URL.createObjectURL(event.target.files[0]) });
    }
  }, [updateSettings]);

  const handleStudyFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      updateSettings({
        customStudyTrackPath: URL.createObjectURL(event.target.files[0]),
      });
    }
  }, [updateSettings]);

  const handleIntervalFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      updateSettings({
        customIntervalTrackPath: URL.createObjectURL(event.target.files[0]),
      });
    }
  }, [updateSettings]);

  const languageOptions = LANGUAGE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
  const musicSourceOptions: Array<{ value: MusicSource; label: string }> = [
    { value: "generated", label: getMusicSourceLabel(language, "generated") },
    { value: "radio", label: getMusicSourceLabel(language, "radio") },
    { value: "custom", label: getMusicSourceLabel(language, "custom") },
  ];
  const radioCategoryOptions = RADIO_CATEGORIES.map((option) => ({
    value: option.value,
    label: getRadioCategoryLabel(language, option.value),
  }));
  const localizedAlarmOptions = alarmOptions.map((option) => ({
    value: option,
    label: getAlarmOptionLabel(language, option),
  }));
  const localizedTrackOptions = trackOptions.map((option) => ({
    value: option,
    label: getTrackOptionLabel(language, option),
  }));

  return (
    <motion.div className="flex h-full w-full flex-col overflow-auto px-5 py-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-4 flex items-start gap-3">
        <NavButton icon={FaAngleLeft} onClick={() => setPage("sessionControl")} ClassName="!flex-none self-start" />
        <div className="pt-0.5">
          <h2 className="text-2xl font-semibold text-gray-800">{t("settings.title")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("settings.description")}</p>
        </div>
      </div>

      <SettingsCard title={t("settings.languageSection")}>
        <DropdownRow
          label={t("settings.language")}
          helpText={t("settings.languageHelp")}
          options={languageOptions}
          selected={settings.language}
          onSelect={(value) => updateSettings({ language: value as AppLanguage })}
        />
      </SettingsCard>

      <SettingsCard title={t("settings.automation")}>
        <div className="flex flex-col gap-1">
          <ToggleRow label={t("settings.autoCheckTasks")} helpText={t("settings.autoCheckTasksHelp")} enabled={settings.autoCheckTasks} onChange={() => updateSettings({ autoCheckTasks: !settings.autoCheckTasks })} />
          <ToggleRow label={t("settings.autoStartBreaks")} helpText={t("settings.autoStartBreaksHelp")} enabled={settings.autoStartBreaks} onChange={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })} />
          <ToggleRow label={t("settings.autoStartPomos")} helpText={t("settings.autoStartPomosHelp")} enabled={settings.autoStartPomos} onChange={() => updateSettings({ autoStartPomos: !settings.autoStartPomos })} />
        </div>
      </SettingsCard>

      <SettingsCard title={t("settings.sound")}>
        <div className="flex flex-col gap-3">
          <SoundSection>
            <ToggleRow label={t("settings.alarm")} helpText={t("settings.alarmHelp")} enabled={settings.alarmEnabled} onChange={() => updateSettings({ alarmEnabled: !settings.alarmEnabled })} />
            {settings.alarmEnabled && (
              <>
                <DropdownRow label={t("common.sound")} helpText={t("settings.alarmSoundHelp")} options={localizedAlarmOptions} selected={settings.selectedAlarm} onSelect={(value) => updateSettings({ selectedAlarm: value })} />
                <RangeRow label={t("settings.alarmVolume")} helpText={t("settings.alarmVolumeHelp")} value={settings.alarmVolume} onChange={(value) => updateSettings({ alarmVolume: value })} />
                <ToggleRow label={t("common.customFile")} helpText={t("settings.customAlarmHelp")} enabled={settings.customAlarm} onChange={() => updateSettings({ customAlarm: !settings.customAlarm })} />
                {settings.customAlarm && <input type="file" accept="audio/*" onChange={handleAlarmFileChange} className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-600" />}
                {settings.customAlarmPath && <span className="rounded-xl bg-gray-100 px-2 py-1 text-xs text-gray-500">{t("common.selectedFile", { path: settings.customAlarmPath })}</span>}
              </>
            )}
          </SoundSection>

          <SoundSection>
            <ToggleRow label={t("settings.studyMusic")} helpText={t("settings.studyMusicHelp")} enabled={settings.studyMusicEnabled} onChange={() => updateSettings({ studyMusicEnabled: !settings.studyMusicEnabled })} />
            {settings.studyMusicEnabled && (
              <>
                <DropdownRow label={t("common.source")} helpText={t("settings.sourceHelp")} options={musicSourceOptions} selected={settings.studyMusicSource} onSelect={(value) => updateSettings({ studyMusicSource: value as MusicSource })} />
                {settings.studyMusicSource === "generated" && <DropdownRow label={t("common.sound")} helpText={t("settings.generatedSoundHelp.study")} options={localizedTrackOptions} selected={settings.selectedStudyTrack} onSelect={(value) => updateSettings({ selectedStudyTrack: value })} />}
                {settings.studyMusicSource === "radio" && <DropdownRow label={t("common.category")} helpText={t("settings.radioCategoryHelp.study")} options={radioCategoryOptions} selected={settings.studyRadioCategory} onSelect={(value) => updateSettings({ studyRadioCategory: value as typeof settings.studyRadioCategory })} />}
                {settings.studyMusicSource === "custom" && (
                  <>
                    <ToggleRow label={t("common.customFile")} helpText={t("settings.customStudyHelp")} enabled={settings.customStudyTrackEnabled} onChange={() => updateSettings({ customStudyTrackEnabled: !settings.customStudyTrackEnabled })} />
                    {settings.customStudyTrackEnabled && <input type="file" accept="audio/*" onChange={handleStudyFileChange} className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-600" />}
                    {settings.customStudyTrackPath && <span className="rounded-xl bg-gray-100 px-2 py-1 text-xs text-gray-500">{t("common.selectedFile", { path: settings.customStudyTrackPath })}</span>}
                  </>
                )}
                <RangeRow label={t("settings.studyVolume")} helpText={t("settings.studyVolumeHelp")} value={settings.studyTrackVolume} onChange={(value) => updateSettings({ studyTrackVolume: value })} />
              </>
            )}
          </SoundSection>

          <SoundSection>
            <ToggleRow label={t("settings.intervalMusic")} helpText={t("settings.intervalMusicHelp")} enabled={settings.intervalMusicEnabled} onChange={() => updateSettings({ intervalMusicEnabled: !settings.intervalMusicEnabled })} />
            {settings.intervalMusicEnabled && (
              <>
                <DropdownRow label={t("common.source")} helpText={t("settings.sourceHelp")} options={musicSourceOptions} selected={settings.intervalMusicSource} onSelect={(value) => updateSettings({ intervalMusicSource: value as MusicSource })} />
                {settings.intervalMusicSource === "generated" && <DropdownRow label={t("common.sound")} helpText={t("settings.generatedSoundHelp.interval")} options={localizedTrackOptions} selected={settings.selectedIntervalTrack} onSelect={(value) => updateSettings({ selectedIntervalTrack: value })} />}
                {settings.intervalMusicSource === "radio" && <DropdownRow label={t("common.category")} helpText={t("settings.radioCategoryHelp.interval")} options={radioCategoryOptions} selected={settings.intervalRadioCategory} onSelect={(value) => updateSettings({ intervalRadioCategory: value as typeof settings.intervalRadioCategory })} />}
                {settings.intervalMusicSource === "custom" && (
                  <>
                    <ToggleRow label={t("common.customFile")} helpText={t("settings.customIntervalHelp")} enabled={settings.customIntervalTrackEnabled} onChange={() => updateSettings({ customIntervalTrackEnabled: !settings.customIntervalTrackEnabled })} />
                    {settings.customIntervalTrackEnabled && <input type="file" accept="audio/*" onChange={handleIntervalFileChange} className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-600" />}
                    {settings.customIntervalTrackPath && <span className="rounded-xl bg-gray-100 px-2 py-1 text-xs text-gray-500">{t("common.selectedFile", { path: settings.customIntervalTrackPath })}</span>}
                  </>
                )}
                <RangeRow label={t("settings.intervalVolume")} helpText={t("settings.intervalVolumeHelp")} value={settings.intervalTrackVolume} onChange={(value) => updateSettings({ intervalTrackVolume: value })} />
              </>
            )}
          </SoundSection>
        </div>
      </SettingsCard>
    </motion.div>
  );
}

function ToggleRow({
  label,
  helpText,
  enabled,
  onChange,
}: {
  label: string;
  helpText?: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div
      data-setting-row="true"
      className="flex items-center justify-between gap-4 rounded-2xl px-1 py-2"
    >
      <LabelWithHelp label={label} helpText={helpText} />
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-red-500"
      />
    </div>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 rounded-[28px] bg-white/95 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] ring-1 ring-gray-200/70">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DropdownRow({
  label,
  helpText,
  options,
  selected,
  onSelect,
}: {
  label: string;
  helpText?: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50/65 px-3 py-2.5">
      <LabelWithHelp label={label} helpText={helpText} />
      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger className="h-9 w-44 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent className="w-44">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer hover:bg-red-100 focus:bg-red-200"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SoundSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-gradient-to-b from-white to-gray-50/80 p-3">
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function RangeRow({
  label,
  helpText,
  value,
  onChange,
}: {
  label: string;
  helpText?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50/65 px-3 py-2.5">
      <LabelWithHelp label={label} helpText={helpText} />
      <div className="flex w-44 items-center gap-2.5">
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-red-500"
        />
        <span className="w-9 text-right text-xs text-gray-500">{value}%</span>
      </div>
    </div>
  );
}

function LabelWithHelp({
  label,
  helpText,
}: {
  label: string;
  helpText?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-800">{label}</span>
      {helpText ? (
        <span className="group relative inline-flex">
          <Info size={14} className="text-gray-400 transition group-hover:text-red-400" />
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-56 -translate-x-1/2 rounded-2xl bg-gray-900 px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg group-hover:block">
            {helpText}
          </span>
        </span>
      ) : null}
    </div>
  );
}
