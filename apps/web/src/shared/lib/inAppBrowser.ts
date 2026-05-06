const IN_APP_UA =
  /(FBAN|FBAV|Instagram|Line|Telegram|wv;|WebView|MiuiBrowser|YaApp_Android|Snapchat|Twitter|LinkedInApp)/i;

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return IN_APP_UA.test(navigator.userAgent);
}
