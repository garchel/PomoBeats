import type { Interval, SettingsState } from "../types/pomo";
import { fetchRadioCandidates } from "./radioBrowser";
import type { RadioCandidate } from "./radioBrowser";

type AudioContextLike = AudioContext;

const DEFAULT_TRACK_VOLUME = 0.035;
const normalizePercent = (value: number) => Math.max(0, Math.min(100, value)) / 100;

const canUseAudio = () =>
  typeof window !== "undefined" &&
  typeof window.Audio !== "undefined" &&
  typeof window.AudioContext !== "undefined";

const createAudioContext = (): AudioContextLike | null => {
  if (!canUseAudio()) {
    return null;
  }

  return new window.AudioContext();
};

const resumeContext = async (context: AudioContextLike | null) => {
  if (context && context.state === "suspended") {
    await context.resume();
  }
};

const buildAlarmSequence = (alarm: string) => {
  switch (alarm) {
    case "Chime":
      return [
        { frequency: 523.25, duration: 0.18, type: "triangle" as const },
        { frequency: 659.25, duration: 0.22, type: "triangle" as const },
      ];
    case "Bell":
      return [
        { frequency: 659.25, duration: 0.14, type: "sine" as const },
        { frequency: 880, duration: 0.2, type: "sine" as const },
        { frequency: 1174.66, duration: 0.28, type: "sine" as const },
      ];
    case "Beep":
    default:
      return [
        { frequency: 784, duration: 0.12, type: "square" as const },
        { frequency: 784, duration: 0.12, type: "square" as const },
      ];
  }
};

const buildTrackFrequency = (selectedTrack: string, intervalType: Interval["type"]) => {
  const breakOffset = intervalType === "break" ? 18 : 0;

  switch (selectedTrack) {
    case "Track 2":
      return 196 + breakOffset;
    case "Track 3":
      return 261.63 + breakOffset;
    case "Track 1":
    default:
      return 220 + breakOffset;
  }
};

export class PomoAudioController {
  private audioContext: AudioContextLike | null = null;
  private intervalAudio: HTMLAudioElement | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private readonly fetchCandidates: typeof fetchRadioCandidates;
  private playbackRequestId = 0;

  constructor(fetchCandidates = fetchRadioCandidates) {
    this.fetchCandidates = fetchCandidates;
  }

  private stopIntervalTrackInternal(invalidatePending: boolean) {
    if (invalidatePending) {
      this.playbackRequestId += 1;
    }

    if (this.intervalAudio) {
      this.intervalAudio.pause();
      this.intervalAudio.currentTime = 0;
      this.intervalAudio = null;
    }

    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  private ensureContext() {
    if (!this.audioContext) {
      this.audioContext = createAudioContext();
    }

    return this.audioContext;
  }

  async playAlarm(settings: SettingsState) {
    if (!settings.alarmEnabled) {
      return;
    }

    const alarmVolume = normalizePercent(settings.alarmVolume);

    if (alarmVolume === 0) {
      return;
    }

    if (settings.customAlarm && settings.customAlarmPath) {
      const customAudio = new Audio(settings.customAlarmPath);
      customAudio.volume = alarmVolume;
      await customAudio.play().catch(() => undefined);
      return;
    }

    const context = this.ensureContext();

    if (!context) {
      return;
    }

    await resumeContext(context);

    let startAt = context.currentTime;
    for (const tone of buildAlarmSequence(settings.selectedAlarm)) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = tone.type ?? "sine";
      oscillator.frequency.setValueAtTime(tone.frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(alarmVolume * 0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + tone.duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + tone.duration);

      startAt += tone.duration + 0.04;
    }
  }

  async startIntervalTrack(
    settings: SettingsState,
    interval: Interval,
    options?: {
      preferredRadioCandidate?: RadioCandidate | null;
      onRadioCandidatesResolved?: (candidates: RadioCandidate[]) => void;
      onRadioStatusChange?: (
        candidateId: string,
        status: "idle" | "loading" | "playing" | "error"
      ) => void;
    }
  ) {
    this.stopIntervalTrackInternal(false);
    const requestId = ++this.playbackRequestId;
    const isStudyInterval = interval.type === "pomo";
    const trackEnabled = isStudyInterval
      ? settings.studyMusicEnabled
      : settings.intervalMusicEnabled;
    const musicSource = isStudyInterval
      ? settings.studyMusicSource
      : settings.intervalMusicSource;
    const trackVolume = normalizePercent(
      isStudyInterval ? settings.studyTrackVolume : settings.intervalTrackVolume
    );
    const customTrackEnabled = isStudyInterval
      ? settings.customStudyTrackEnabled
      : settings.customIntervalTrackEnabled;
    const customTrackPath = isStudyInterval
      ? settings.customStudyTrackPath
      : settings.customIntervalTrackPath;
    const selectedTrack = isStudyInterval
      ? settings.selectedStudyTrack
      : settings.selectedIntervalTrack;
    const selectedRadioCategory = isStudyInterval
      ? settings.studyRadioCategory
      : settings.intervalRadioCategory;

    if (!trackEnabled || trackVolume === 0) {
      return;
    }

    if (musicSource === "custom" && customTrackEnabled && customTrackPath) {
      if (requestId !== this.playbackRequestId) {
        return;
      }
      const audio = new Audio(customTrackPath);
      audio.loop = true;
      audio.volume = trackVolume;
      this.intervalAudio = audio;
      await audio.play().catch(() => undefined);
      return;
    }

    if (musicSource === "radio") {
      const candidates = await this.fetchCandidates(selectedRadioCategory).catch(
        () => []
      );
      if (requestId !== this.playbackRequestId) {
        return;
      }
      options?.onRadioCandidatesResolved?.(candidates);
      const orderedCandidates = this.prioritizeRadioCandidate(
        candidates,
        options?.preferredRadioCandidate ?? null
      );
      await this.playRadioCandidates(
        orderedCandidates,
        trackVolume,
        requestId,
        options?.onRadioStatusChange
      );
      return;
    }

    const context = this.ensureContext();

    if (!context) {
      return;
    }

    await resumeContext(context);

    if (requestId !== this.playbackRequestId) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = interval.type === "break" ? "triangle" : "sine";
    oscillator.frequency.value = buildTrackFrequency(selectedTrack, interval.type);
    gain.gain.value = Math.max(DEFAULT_TRACK_VOLUME, trackVolume * 0.08);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();

    this.oscillator = oscillator;
    this.gainNode = gain;
  }

  private async playRadioCandidates(
    candidates: Awaited<ReturnType<typeof fetchRadioCandidates>>,
    volume: number,
    requestId: number,
    onRadioStatusChange?: (
      candidateId: string,
      status: "idle" | "loading" | "playing" | "error"
    ) => void
  ) {
    for (const candidate of candidates) {
      if (requestId !== this.playbackRequestId) {
        return;
      }

      onRadioStatusChange?.(candidate.id, "loading");
      const audio = new Audio(candidate.streamUrl);
      audio.loop = true;
      audio.volume = volume;
      this.intervalAudio = audio;

      try {
        await audio.play();
        onRadioStatusChange?.(candidate.id, "playing");
        return;
      } catch {
        onRadioStatusChange?.(candidate.id, "error");
        audio.pause();
        audio.currentTime = 0;
        if (this.intervalAudio === audio) {
          this.intervalAudio = null;
        }
      }
    }
  }

  private prioritizeRadioCandidate(
    candidates: RadioCandidate[],
    preferredCandidate: RadioCandidate | null
  ) {
    if (!preferredCandidate) {
      return candidates;
    }

    const preferred = candidates.find(
      (candidate) => candidate.id === preferredCandidate.id
    );

    if (!preferred) {
      return candidates;
    }

    return [
      preferred,
      ...candidates.filter((candidate) => candidate.id !== preferred.id),
    ];
  }

  stopIntervalTrack() {
    this.stopIntervalTrackInternal(true);
  }

  dispose() {
    this.stopIntervalTrack();
    if (this.audioContext) {
      this.audioContext.close().catch(() => undefined);
      this.audioContext = null;
    }
  }
}
