import * as collectionService from '../services/collection.service.js';

export async function getMyCollection(req, res, next) {
  try {
    const entries = await collectionService.getUserCollection(req.user.id);
    res.json({ data: { entries } });
  } catch (err) {
    next(err);
  }
}

export async function getCollectionStats(req, res, next) {
  try {
    const stats = await collectionService.getCollectionStats(req.user.id);
    res.json({ data: { stats } });
  } catch (err) {
    next(err);
  }
}

export async function upsertEntry(req, res, next) {
  try {
    const entry = await collectionService.upsertCollectionEntry(
      req.user.id,
      req.params.itemId,
      req.body
    );
    res.json({ data: { entry } });
  } catch (err) {
    next(err);
  }
}
