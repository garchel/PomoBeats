import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PomoAudioController } from "../lib/audio";
import type { SettingsState } from "../types/pomo";

interface TestRadioCandidate {
  id: string;
  name: string;
  streamUrl: string;
  favicon: string;
  codec: string;
  bitrate: number;
  votes: number;
  homepage: string;
}

const createSettings = (): SettingsState => ({
  language: "pt-BR",
  autoCheckTasks: true,
  autoStartBreaks: false,
  autoStartPomos: false,
  alarmEnabled: true,
  selectedAlarm: "Beep",
  alarmVolume: 60,
  customAlarm: false,
  customAlarmPath: "",
  studyMusicEnabled: true,
  studyMusicSource: "generated",
  studyRadioCategory: "lofi",
  selectedStudyTrack: "Track 1",
  studyTrackVolume: 30,
  customStudyTrackEnabled: false,
  customStudyTrackPath: "",
  intervalMusicEnabled: true,
  intervalMusicSource: "generated",
  intervalRadioCategory: "lofi",
  selectedIntervalTrack: "Track 1",
  intervalTrackVolume: 30,
  customIntervalTrackEnabled: false,
  customIntervalTrackPath: "",
});

describe("PomoAudioController", () => {
  const originalAudio = window.Audio;
  const originalAudioContext = window.AudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.Audio = originalAudio;
    window.AudioContext = originalAudioContext;
  });

  it("falls back to the next radio candidate when the first stream fails", async () => {
    const playCalls: string[] = [];

    class MockAudio {
      currentTime = 0;
      loop = false;
      volume = 1;
      readonly src: string;

      constructor(src: string) {
        this.src = src;
      }

      play() {
        playCalls.push(this.src);
        if (this.src.includes("fail")) {
          return Promise.reject(new Error("stream failed"));
        }

        return Promise.resolve();
      }

      pause() {}
    }

    window.Audio = MockAudio as unknown as typeof Audio;

    const fetchCandidates = vi.fn().mockResolvedValue([
      {
        id: "1",
        name: "Broken",
        streamUrl: "https://radio.example/fail",
        favicon: "",
        codec: "MP3",
        bitrate: 128,
        votes: 10,
        homepage: "",
      },
      {
        id: "2",
        name: "Healthy",
        streamUrl: "https://radio.example/ok",
        favicon: "",
        codec: "MP3",
        bitrate: 128,
        votes: 9,
        homepage: "",
      },
    ]);

    const controller = new PomoAudioController(fetchCandidates);
    const settings = {
      ...createSettings(),
      studyMusicSource: "radio" as const,
      studyRadioCategory: "rock" as const,
    };

    await controller.startIntervalTrack(settings, {
      name: "Foco",
      duration: 25,
      type: "pomo",
    });

    expect(fetchCandidates).toHaveBeenCalledWith("rock");
    expect(playCalls).toEqual([
      "https://radio.example/fail",
      "https://radio.example/ok",
    ]);
  });

  it("prioritizes the selected radio channel when provided", async () => {
    const playCalls: string[] = [];

    class MockAudio {
      currentTime = 0;
      loop = false;
      volume = 1;
      readonly src: string;

      constructor(src: string) {
        this.src = src;
      }

      play() {
        playCalls.push(this.src);
        return Promise.resolve();
      }

      pause() {}
    }

    window.Audio = MockAudio as unknown as typeof Audio;

    const candidates = [
      {
        id: "1",
        name: "First",
        streamUrl: "https://radio.example/one",
        favicon: "",
        codec: "MP3",
        bitrate: 128,
        votes: 10,
        homepage: "",
      },
      {
        id: "2",
        name: "Second",
        streamUrl: "https://radio.example/two",
        favicon: "",
        codec: "MP3",
        bitrate: 120,
        votes: 9,
        homepage: "",
      },
    ];

    const fetchCandidates = vi.fn().mockResolvedValue(candidates);
    const controller = new PomoAudioController(fetchCandidates);

    await controller.startIntervalTrack(
      {
        ...createSettings(),
        studyMusicSource: "radio",
      },
      {
        name: "Foco",
        duration: 25,
        type: "pomo",
      },
      {
        preferredRadioCandidate: candidates[1],
      }
    );

    expect(playCalls).toEqual(["https://radio.example/two"]);
  });

  it("reports loading and error states for radio candidates", async () => {
    class MockAudio {
      currentTime = 0;
      loop = false;
      volume = 1;
      readonly src: string;

      constructor(src: string) {
        this.src = src;
      }

      play() {
        return Promise.reject(new Error("stream failed"));
      }

      pause() {}
    }

    window.Audio = MockAudio as unknown as typeof Audio;

    const statusChanges: string[] = [];
    const candidates = [
      {
        id: "1",
        name: "Broken",
        streamUrl: "https://radio.example/fail",
        favicon: "",
        codec: "MP3",
        bitrate: 128,
        votes: 10,
        homepage: "",
      },
    ];

    const controller = new PomoAudioController(vi.fn().mockResolvedValue(candidates));

    await controller.startIntervalTrack(
      {
        ...createSettings(),
        studyMusicSource: "radio",
      },
      {
        name: "Foco",
        duration: 25,
        type: "pomo",
      },
      {
        onRadioStatusChange: (candidateId, status) => {
          statusChanges.push(`${candidateId}:${status}`);
        },
      }
    );

    expect(statusChanges).toEqual(["1:loading", "1:error"]);
  });

  it("cancels stale radio playback requests after stop", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    let releaseCandidates!: (value: TestRadioCandidate[]) => void;
    let hasResolver = false;

    class MockAudio {
      currentTime = 0;
      loop = false;
      volume = 1;
      readonly src: string;

      constructor(src: string) {
        this.src = src;
      }

      play = play;
      pause() {}
    }

    window.Audio = MockAudio as unknown as typeof Audio;

    const fetchCandidates = vi.fn().mockImplementation(
      () =>
        new Promise<TestRadioCandidate[]>((resolve) => {
          releaseCandidates = resolve;
          hasResolver = true;
        })
    );

    const controller = new PomoAudioController(fetchCandidates);
    const pending = controller.startIntervalTrack(
      {
        ...createSettings(),
        studyMusicSource: "radio",
      },
      {
        name: "Foco",
        duration: 25,
        type: "pomo",
      }
    );

    controller.stopIntervalTrack();
    if (hasResolver) {
      releaseCandidates([
        {
          id: "1",
          name: "Late radio",
          streamUrl: "https://radio.example/late",
          favicon: "",
          codec: "MP3",
          bitrate: 128,
          votes: 5,
          homepage: "",
        },
      ]);
    }
    await pending;

    expect(play).not.toHaveBeenCalled();
  });

  it("uses a custom file when custom mode is selected", async () => {
    const play = vi.fn().mockResolvedValue(undefined);

    class MockAudio {
      currentTime = 0;
      loop = false;
      volume = 1;
      readonly src: string;

      constructor(src: string) {
        this.src = src;
      }

      play = play;
      pause() {}
    }

    window.Audio = MockAudio as unknown as typeof Audio;

    const fetchCandidates = vi.fn();
    const controller = new PomoAudioController(fetchCandidates);
    const settings = {
      ...createSettings(),
      studyMusicSource: "custom" as const,
      customStudyTrackEnabled: true,
      customStudyTrackPath: "blob:study.mp3",
    };

    await controller.startIntervalTrack(settings, {
      name: "Foco",
      duration: 25,
      type: "pomo",
    });

    expect(fetchCandidates).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalled();
  });

  it("keeps generated mode on the local audio context path", async () => {
    const fetchCandidates = vi.fn();
    const start = vi.fn();
    const stop = vi.fn();
    const disconnect = vi.fn();
    const connect = vi.fn();
    const gainConnect = vi.fn();
    const gainDisconnect = vi.fn();

    class MockAudioContext {
      state: AudioContextState = "running";
      currentTime = 0;
      destination = {};

      createOscillator() {
        return {
          type: "sine",
          frequency: { value: 0, setValueAtTime: vi.fn() },
          connect,
          start,
          stop,
          disconnect,
        };
      }

      createGain() {
        return {
          gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: gainConnect,
          disconnect: gainDisconnect,
        };
      }

      close() {
        return Promise.resolve();
      }
    }

    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;

    const controller = new PomoAudioController(fetchCandidates);

    await controller.startIntervalTrack(createSettings(), {
      name: "Foco",
      duration: 25,
      type: "pomo",
    });

    expect(fetchCandidates).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
  });
});
