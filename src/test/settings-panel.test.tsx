import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPanel from "../components/SettingsPanel";
import { PomoProvider, usePomo } from "../context/PomoContext";

const setSettingsMock = vi.fn();
const getSettingsMock = vi.fn();

function SettingsSnapshot() {
  const { settings, updateSettings } = usePomo();

  return (
    <>
      <button onClick={() => updateSettings({ selectedAlarm: "Bell" })}>
        set-alarm-bell
      </button>
      <button onClick={() => updateSettings({ selectedStudyTrack: "Track 2" })}>
        set-study-track-2
      </button>
      <button onClick={() => updateSettings({ studyMusicSource: "radio" })}>
        set-study-radio
      </button>
      <button onClick={() => updateSettings({ studyRadioCategory: "rock" })}>
        set-study-rock
      </button>
      <button onClick={() => updateSettings({ selectedIntervalTrack: "Track 3" })}>
        set-track-3
      </button>
      <button onClick={() => updateSettings({ intervalMusicSource: "custom" })}>
        set-interval-custom
      </button>
      <output data-testid="settings-snapshot">{JSON.stringify(settings)}</output>
    </>
  );
}

function renderSettingsPanel() {
  return render(
    <PomoProvider>
      <SettingsPanel />
      <SettingsSnapshot />
    </PomoProvider>
  );
}

function getSwitchForLabel(label: string) {
  const row = screen.getByText(label).closest("div");

  if (!row) {
    throw new Error(`Nao encontrei a linha da configuracao: ${label}`);
  }

  const toggle = row.querySelector('[role="switch"]');

  if (!(toggle instanceof HTMLButtonElement)) {
    throw new Error(`Nao encontrei o switch da configuracao: ${label}`);
  }

  return toggle;
}

function getSwitchForDuplicateLabel(label: string, index: number) {
  const rows = screen.getAllByText(label);
  const row = rows[index]?.closest("div");

  if (!row) {
    throw new Error(`Nao encontrei a linha repetida ${index} para: ${label}`);
  }

  const toggle = row.querySelector('[role="switch"]');

  if (!(toggle instanceof HTMLButtonElement)) {
    throw new Error(`Nao encontrei o switch repetido ${index} para: ${label}`);
  }

  return toggle;
}

describe("SettingsPanel", () => {
  beforeEach(() => {
    setSettingsMock.mockReset();
    getSettingsMock.mockReset();
    getSettingsMock.mockResolvedValue({
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
      intervalTrackVolume: 40,
      customIntervalTrackEnabled: false,
      customIntervalTrackPath: "",
    });

    window.electron = {
      getSettings: getSettingsMock,
      setSettings: setSettingsMock.mockResolvedValue(undefined),
    };

    vi.spyOn(URL, "createObjectURL").mockImplementation(
      (file) => `blob:${(file as File).name}`
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("loads persisted settings on mount", async () => {
    getSettingsMock.mockResolvedValueOnce({
      autoCheckTasks: false,
      autoStartBreaks: true,
      autoStartPomos: true,
      alarmEnabled: false,
      selectedAlarm: "Bell",
      alarmVolume: 0,
      customAlarm: true,
      customAlarmPath: "blob:alarm.mp3",
      studyMusicEnabled: false,
      studyMusicSource: "radio",
      studyRadioCategory: "kpop",
      selectedStudyTrack: "Track 2",
      studyTrackVolume: 0,
      customStudyTrackEnabled: false,
      customStudyTrackPath: "",
      intervalMusicEnabled: false,
      intervalMusicSource: "custom",
      intervalRadioCategory: "rock",
      selectedIntervalTrack: "Track 3",
      intervalTrackVolume: 0,
      customIntervalTrackEnabled: true,
      customIntervalTrackPath: "blob:track.mp3",
    });

    renderSettingsPanel();

    await waitFor(() => {
      const snapshot = screen.getByTestId("settings-snapshot");
      expect(snapshot).toHaveTextContent('"alarmEnabled":false');
      expect(snapshot).toHaveTextContent('"selectedAlarm":"Bell"');
      expect(snapshot).toHaveTextContent('"customAlarmPath":"blob:alarm.mp3"');
      expect(snapshot).toHaveTextContent('"studyMusicEnabled":false');
      expect(snapshot).toHaveTextContent('"studyMusicSource":"radio"');
      expect(snapshot).toHaveTextContent('"studyRadioCategory":"kpop"');
      expect(snapshot).toHaveTextContent('"selectedStudyTrack":"Track 2"');
      expect(snapshot).toHaveTextContent('"customStudyTrackPath":""');
      expect(snapshot).toHaveTextContent('"intervalMusicEnabled":false');
      expect(snapshot).toHaveTextContent('"intervalMusicSource":"custom"');
      expect(snapshot).toHaveTextContent('"intervalRadioCategory":"rock"');
      expect(snapshot).toHaveTextContent('"selectedIntervalTrack":"Track 3"');
      expect(snapshot).toHaveTextContent('"customIntervalTrackPath":"blob:track.mp3"');
    });

    expect(screen.getByText("Som")).toBeInTheDocument();
    expect(screen.getByText("Alarme")).toBeInTheDocument();
    expect(screen.getByText("Musica de estudo")).toBeInTheDocument();
    expect(screen.getByText("Musica de intervalo")).toBeInTheDocument();
    expect(screen.queryByText("Ativar alarme")).not.toBeInTheDocument();
  });

  it("updates sound settings and persists changes", async () => {
    const user = userEvent.setup();
    renderSettingsPanel();

    await user.click(getSwitchForLabel("Auto Check Tasks"));
    await user.click(getSwitchForLabel("Auto Start Breaks"));
    await user.click(getSwitchForLabel("Auto Start Pomos"));
    await user.click(getSwitchForLabel("Alarme"));
    await user.click(getSwitchForLabel("Musica de estudo"));
    await user.click(getSwitchForLabel("Musica de intervalo"));

    expect(screen.queryByText("Alarm Volume")).not.toBeInTheDocument();
    expect(screen.queryByText("Study Volume")).not.toBeInTheDocument();
    expect(screen.queryByText("Interval Volume")).not.toBeInTheDocument();

    await user.click(getSwitchForLabel("Alarme"));
    await user.click(getSwitchForLabel("Musica de estudo"));
    await user.click(getSwitchForLabel("Musica de intervalo"));
    await user.click(getSwitchForDuplicateLabel("Usar arquivo customizado", 0));

    const sliders = screen.getAllByRole("slider");
    fireEvent.input(sliders[0], { target: { value: "0" } });
    fireEvent.input(sliders[1], { target: { value: "20" } });
    fireEvent.input(sliders[2], { target: { value: "10" } });

    fireEvent.click(screen.getByText("set-alarm-bell"));
    fireEvent.click(screen.getByText("set-study-track-2"));
    fireEvent.click(screen.getByText("set-study-radio"));
    fireEvent.click(screen.getByText("set-study-rock"));
    fireEvent.click(screen.getByText("set-track-3"));
    fireEvent.click(screen.getByText("set-interval-custom"));
    await user.click(getSwitchForDuplicateLabel("Usar arquivo customizado", 1));

    const fileInputs = document.querySelectorAll(
      'input[type="file"][accept="audio/*"]'
    );
    await user.upload(fileInputs[0] as HTMLInputElement, new File(["alarm"], "alarm.mp3", { type: "audio/mpeg" }));
    await user.upload(fileInputs[1] as HTMLInputElement, new File(["track"], "track.mp3", { type: "audio/mpeg" }));

    await waitFor(() => {
      const snapshot = screen.getByTestId("settings-snapshot").textContent ?? "";
      expect(snapshot).toContain('"autoCheckTasks":false');
      expect(snapshot).toContain('"autoStartBreaks":true');
      expect(snapshot).toContain('"autoStartPomos":true');
      expect(snapshot).toContain('"alarmEnabled":true');
      expect(snapshot).toContain('"selectedAlarm":"Bell"');
      expect(snapshot).toContain('"alarmVolume":0');
      expect(snapshot).toContain('"customAlarm":true');
      expect(snapshot).toContain('"customAlarmPath":"blob:alarm.mp3"');
      expect(snapshot).toContain('"studyMusicEnabled":true');
      expect(snapshot).toContain('"studyMusicSource":"radio"');
      expect(snapshot).toContain('"studyRadioCategory":"rock"');
      expect(snapshot).toContain('"selectedStudyTrack":"Track 2"');
      expect(snapshot).toContain('"studyTrackVolume":20');
      expect(snapshot).toContain('"customStudyTrackEnabled":false');
      expect(snapshot).toContain('"customStudyTrackPath":""');
      expect(snapshot).toContain('"intervalMusicEnabled":true');
      expect(snapshot).toContain('"intervalMusicSource":"custom"');
      expect(snapshot).toContain('"intervalRadioCategory":"lofi"');
      expect(snapshot).toContain('"selectedIntervalTrack":"Track 3"');
      expect(snapshot).toContain('"intervalTrackVolume":10');
      expect(snapshot).toContain('"customIntervalTrackEnabled":true');
      expect(snapshot).toContain('"customIntervalTrackPath":"blob:track.mp3"');
    });

    expect(setSettingsMock).toHaveBeenCalled();
    expect(setSettingsMock.mock.calls.at(-1)?.[0]).toMatchObject({
      autoCheckTasks: false,
      autoStartBreaks: true,
      autoStartPomos: true,
      alarmEnabled: true,
      selectedAlarm: "Bell",
      alarmVolume: 0,
      customAlarm: true,
      customAlarmPath: "blob:alarm.mp3",
      studyMusicEnabled: true,
      studyMusicSource: "radio",
      studyRadioCategory: "rock",
      selectedStudyTrack: "Track 2",
      studyTrackVolume: 20,
      customStudyTrackEnabled: false,
      customStudyTrackPath: "",
      intervalMusicEnabled: true,
      intervalMusicSource: "custom",
      intervalRadioCategory: "lofi",
      selectedIntervalTrack: "Track 3",
      intervalTrackVolume: 10,
      customIntervalTrackEnabled: true,
      customIntervalTrackPath: "blob:track.mp3",
    });

    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.queryAllByText("Usar arquivo customizado")).toHaveLength(2);
  });
});
