import {
  BASIC_RELAYS_KEY,
  DEFAULT_BASIC_RELAYS,
  HOSTR_RELAYS_KEY,
  DEFAULT_HOSTR_RELAYS,
  DEFAULT_CUSTOM_APP_DATA_RELAYS,
  CUSTOM_APP_DATA_RELAYS_KEY,
} from "@/consts";

export const getBasicRelays = () => {
  const strRelays = localStorage.getItem(BASIC_RELAYS_KEY);
  const parsed = JSON.parse(strRelays || "[]");
  if (!Array.isArray(parsed) || parsed.length < 1) {
    return DEFAULT_BASIC_RELAYS;
  }
  return parsed;
};

export const getHostrRelays = () => {
  const strRelays = localStorage.getItem(HOSTR_RELAYS_KEY);
  const parsed = JSON.parse(strRelays || "[]");
  if (!Array.isArray(parsed) || parsed.length < 1) {
    return DEFAULT_HOSTR_RELAYS;
  }
  return parsed;
};

export const getCustomAppDataRelays = () => {
  const strRelays = localStorage.getItem(CUSTOM_APP_DATA_RELAYS_KEY);
  const parsed = JSON.parse(strRelays || "[]");
  if (!Array.isArray(parsed) || parsed.length < 1) {
    return DEFAULT_CUSTOM_APP_DATA_RELAYS;
  }
  return parsed;
};
