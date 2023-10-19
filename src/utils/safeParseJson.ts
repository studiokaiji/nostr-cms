export const safeParseJson = <T = unknown>(json: string) => {
  let parsed: T | null = null;

  try {
    parsed = JSON.parse(json);
  } catch (e) {
    e;
  }

  return parsed;
};
