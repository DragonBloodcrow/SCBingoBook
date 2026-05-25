import * as itemsService from '../services/items.service.js';

export async function listItems(req, res, next) {
  try {
    const { category, search, limit, offset } = req.query;
    const result = await itemsService.listItems({
      category,
      search,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getItem(req, res, next) {
  try {
    const item = await itemsService.getItemById(req.params.id);
    res.json({ data: { item } });
  } catch (err) {
    next(err);
  }
}
