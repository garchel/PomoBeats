import { getRadioCategoryDefinition } from "./radioCatalog";
import type { RadioCategory } from "../types/pomo";

const RADIO_BROWSER_HOSTS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
];

const SEARCH_LIMIT = 12;

interface RadioBrowserStationResponse {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  codec: string;
  bitrate: number;
  votes: number;
  lastcheckok: number;
  homepage: string;
}

export interface RadioCandidate {
  id: string;
  name: string;
  streamUrl: string;
  favicon: string;
  codec: string;
  bitrate: number;
  votes: number;
  homepage: string;
}

const buildSearchUrl = (host: string, tags: string[]) => {
  const params = new URLSearchParams({
    hidebroken: "true",
    order: "votes",
    reverse: "true",
    limit: String(SEARCH_LIMIT),
    tagList: tags.join(","),
  });

  return `${host}/json/stations/search?${params.toString()}`;
};

const scoreStation = (station: RadioBrowserStationResponse) =>
  (station.lastcheckok === 1 ? 1000 : 0) + station.votes + station.bitrate;

const toCandidate = (
  station: RadioBrowserStationResponse
): RadioCandidate | null => {
  const streamUrl = station.url_resolved || station.url;

  if (!station.stationuuid || !streamUrl) {
    return null;
  }

  return {
    id: station.stationuuid,
    name: station.name || "Radio sem nome",
    streamUrl,
    favicon: station.favicon || "",
    codec: station.codec || "",
    bitrate: Number(station.bitrate) || 0,
    votes: Number(station.votes) || 0,
    homepage: station.homepage || "",
  };
};

export const fetchRadioCandidates = async (
  category: RadioCategory,
  fetchImpl: typeof fetch = fetch
): Promise<RadioCandidate[]> => {
  const definition = getRadioCategoryDefinition(category);
  const unique = new Map<string, RadioCandidate>();

  for (const host of RADIO_BROWSER_HOSTS) {
    try {
      const response = await fetchImpl(buildSearchUrl(host, definition.tags), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        continue;
      }

      const stations = (await response.json()) as RadioBrowserStationResponse[];

      stations
        .filter((station) => station.lastcheckok === 1)
        .sort((left, right) => scoreStation(right) - scoreStation(left))
        .map(toCandidate)
        .filter((candidate): candidate is RadioCandidate => candidate !== null)
        .forEach((candidate) => {
          if (!unique.has(candidate.id)) {
            unique.set(candidate.id, candidate);
          }
        });

      if (unique.size >= 3) {
        break;
      }
    } catch {
      continue;
    }
  }

  return Array.from(unique.values()).slice(0, 3);
};
