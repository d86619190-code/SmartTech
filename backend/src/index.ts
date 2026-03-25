import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();
const server = app.listen(config.port, () => {
  console.info(`API listening on http://localhost:${config.port}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Порт ${config.port} уже занят (EADDRINUSE). Остановите другой процесс на этом порту или задайте в .env другой PORT, например PORT=4001.`
    );
    process.exit(1);
    return;
  }
  throw err;
});
