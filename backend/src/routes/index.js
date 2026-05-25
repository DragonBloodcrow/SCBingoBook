import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { itemsRouter } from './items.routes.js';
import { collectionRouter } from './collection.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    name: 'SCBingoBook API',
    version: '0.1.0',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      collection: '/api/collection',
    },
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/items', itemsRouter);
apiRouter.use('/collection', collectionRouter);
