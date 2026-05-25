import { Router } from 'express';
import * as itemsController from '../controllers/items.controller.js';

export const itemsRouter = Router();

itemsRouter.get('/', itemsController.listItems);
itemsRouter.get('/:id', itemsController.getItem);
