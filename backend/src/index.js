import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { apiRouter } from './routes/index.js';

const app = express();

if (config.isProd) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(morgan(config.isDev ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'scbingobook-api' });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, config.host, () => {
  console.log(`SCBingoBook API listening on ${config.host}:${config.port}`);
});
