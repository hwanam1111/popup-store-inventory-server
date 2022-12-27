import * as winston from 'winston';
import * as WinstonDaily from 'winston-daily-rotate-file';

const logger = (status: number, log: object) => {
  const logDir = __dirname + '/../../logs';
  const { combine, timestamp, printf } = winston.format;

  const logFormat = printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${JSON.stringify(info.message)}`,
  );

  const createErrorLog = winston.createLogger({
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      logFormat,
    ),
    transports: [
      new winston.transports.Console(),
      new WinstonDaily({
        datePattern: 'YYYY-MM-DD',
        dirname: `${logDir}/error/%DATE%`,
        filename: `${status}.error.log`,
      }),
    ],
  });

  createErrorLog.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.errors({ stack: true }),
        winston.format.ms(),
        winston.format.colorize({ all: true }),
      ),
    }),
  );

  createErrorLog.error(log);
};

export default logger;
