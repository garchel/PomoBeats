export type IntervalType = "pomo" | "break";
export type MusicSource = "generated" | "radio" | "custom";
export type RadioCategory = "lofi" | "pop" | "anime" | "kpop" | "rock";
export type AppLanguage = "pt-BR" | "en-US";

export interface Interval {
  name: string;
  duration: number;
  type: IntervalType;
}

export interface SessionObject {
  title: string;
  intervals: Interval[];
}

export interface SavedSessionMetadata {
  title: string;
  intervalCount: number;
  totalDuration: number;
  updatedAt: string;
}

export interface SettingsState {
  language: AppLanguage;
  autoCheckTasks: boolean;
  autoStartBreaks: boolean;
  autoStartPomos: boolean;
  alarmEnabled: boolean;
  selectedAlarm: string;
  alarmVolume: number;
  customAlarm: boolean;
  customAlarmPath: string;
  studyMusicEnabled: boolean;
  studyMusicSource: MusicSource;
  studyRadioCategory: RadioCategory;
  selectedStudyTrack: string;
  studyTrackVolume: number;
  customStudyTrackEnabled: boolean;
  customStudyTrackPath: string;
  intervalMusicEnabled: boolean;
  intervalMusicSource: MusicSource;
  intervalRadioCategory: RadioCategory;
  selectedIntervalTrack: string;
  intervalTrackVolume: number;
  customIntervalTrackEnabled: boolean;
  customIntervalTrackPath: string;
}
