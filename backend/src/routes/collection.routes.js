import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import * as collectionController from '../controllers/collection.controller.js';
import { upsertCollectionSchema } from '../validators/collection.schema.js';

export const collectionRouter = Router();

collectionRouter.use(authenticate);

collectionRouter.get('/', collectionController.getMyCollection);
collectionRouter.get('/stats', collectionController.getCollectionStats);
collectionRouter.put(
  '/:itemId',
  validate(upsertCollectionSchema),
  collectionController.upsertEntry
);
