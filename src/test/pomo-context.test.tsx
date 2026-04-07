import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PomoProvider, usePomo } from "../context/PomoContext";

function Harness() {
  const {
    addPomo,
    addBreak,
    startPlayer,
    setPage,
    currentInterval,
    currentIntervalIndex,
    remainingSeconds,
    isPlaying,
    isSessionComplete,
    settings,
    updateSettings,
  } = usePomo();

  return (
    <div>
      <button onClick={() => addPomo({ name: "Foco 1", duration: 1 })}>add-pomo-1</button>
      <button onClick={() => addBreak({ name: "Pausa", duration: 1 })}>add-break</button>
      <button onClick={() => addPomo({ name: "Foco 2", duration: 1 })}>add-pomo-2</button>
      <button onClick={() => startPlayer()}>start</button>
      <button onClick={() => setPage("player")}>go-player</button>
      <button onClick={() => setPage("myLists")}>go-lists</button>
      <button onClick={() => updateSettings({ autoStartBreaks: true })}>enable-breaks</button>
      <button onClick={() => updateSettings({ autoStartPomos: true })}>enable-pomos</button>
      <div data-testid="interval-name">{currentInterval?.name ?? "none"}</div>
      <div data-testid="interval-index">{String(currentIntervalIndex)}</div>
      <div data-testid="remaining">{remainingSeconds}</div>
      <div data-testid="playing">{String(isPlaying)}</div>
      <div data-testid="complete">{String(isSessionComplete)}</div>
      <div data-testid="settings">{JSON.stringify(settings)}</div>
    </div>
  );
}

describe("PomoContext player transitions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.electron = {
      getSettings: vi.fn().mockResolvedValue({
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
        studyTrackVolume: 35,
        customStudyTrackEnabled: false,
        customStudyTrackPath: "",
        intervalMusicEnabled: true,
        intervalMusicSource: "generated",
        intervalRadioCategory: "lofi",
        selectedIntervalTrack: "Track 1",
        intervalTrackVolume: 35,
        customIntervalTrackEnabled: false,
        customIntervalTrackPath: "",
      }),
      setSettings: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("pauses on the next break when autoStartBreaks is disabled", async () => {
    render(
      <PomoProvider>
        <Harness />
      </PomoProvider>
    );

    fireEvent.click(screen.getByText("add-pomo-1"));
    fireEvent.click(screen.getByText("add-break"));
    fireEvent.click(screen.getByText("add-pomo-2"));
    fireEvent.click(screen.getByText("start"));

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId("interval-name")).toHaveTextContent("Pausa");
    expect(screen.getByTestId("playing")).toHaveTextContent("false");
    expect(screen.getByTestId("remaining")).toHaveTextContent("60");
  });

  it("auto-starts break and next pomo when both toggles are enabled", async () => {
    render(
      <PomoProvider>
        <Harness />
      </PomoProvider>
    );

    fireEvent.click(screen.getByText("add-pomo-1"));
    fireEvent.click(screen.getByText("add-break"));
    fireEvent.click(screen.getByText("add-pomo-2"));
    fireEvent.click(screen.getByText("enable-breaks"));
    fireEvent.click(screen.getByText("enable-pomos"));
    fireEvent.click(screen.getByText("start"));

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId("interval-name")).toHaveTextContent("Pausa");
    expect(screen.getByTestId("playing")).toHaveTextContent("true");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId("interval-name")).toHaveTextContent("Foco 2");
    expect(screen.getByTestId("playing")).toHaveTextContent("true");
  });

  it("pauses for navigation without resetting the active interval", async () => {
    render(
      <PomoProvider>
        <Harness />
      </PomoProvider>
    );

    fireEvent.click(screen.getByText("add-pomo-1"));
    fireEvent.click(screen.getByText("add-break"));
    fireEvent.click(screen.getByText("start"));

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    fireEvent.click(screen.getByText("go-player"));
    fireEvent.click(screen.getByText("go-lists"));

    expect(screen.getByTestId("interval-name")).toHaveTextContent("Foco 1");
    expect(screen.getByTestId("interval-index")).toHaveTextContent("0");
    expect(screen.getByTestId("remaining")).toHaveTextContent("55");
    expect(screen.getByTestId("playing")).toHaveTextContent("false");
  });
});
