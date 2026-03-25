const KEY = "home_tech_intro_v1";

export function hasSeenHomeIntro(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markHomeIntroSeen(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // noop
  }
}
