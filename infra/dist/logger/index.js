import { pino } from "pino";
const logger = pino(pino.transport({
    target: "pino-pretty",
    options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname,method",
    },
}));
export default logger;
//# sourceMappingURL=index.js.map