/**
 * Railway / часть облаков: исходящий IPv6 к внешним SMTP (smtp.gmail.com и др.) даёт ENETUNREACH.
 * Предпочитаем IPv4 при резолве имени.
 */
import dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
