import { useCallback, useEffect, useState } from 'react';
import {
  fetchCollectionStats,
  fetchMyCollection,
  upsertCollectionEntry,
} from '../api/collection';
import { fetchItems } from '../api/items';
import { ItemCard } from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';
import { ApiClientError } from '../lib/api';
import type { CollectionEntry, CollectionStats, Item } from '../types';

export function CollectionPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acquiredMap = new Map(entries.map((e) => [e.itemId, e]));

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [collectionRes, itemsRes, statsRes] = await Promise.all([
        fetchMyCollection(token),
        fetchItems(),
        fetchCollectionStats(token),
      ]);
      setEntries(collectionRes.data.entries);
      setCatalog(itemsRes.data.items);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggleAcquired(item: Item) {
    if (!token) return;
    const existing = acquiredMap.get(item.id);
    const nextAcquired = !(existing?.acquired ?? false);

    try {
      await upsertCollectionEntry(token, item.id, { acquired: nextAcquired });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  }

  return (
    <>
      <h1 className="page-title">My Collection</h1>
      <p className="page-subtitle">Track acquired items for your bingo book.</p>

      {stats && (
        <div className="stats-bar">
          <div className="stat-pill">
            <span className="stat-pill__value">{stats.acquired}</span>
            <span className="stat-pill__label">Acquired</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__value">{stats.completionPercent}%</span>
            <span className="stat-pill__label">Completion</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__value">{stats.catalogTotal}</span>
            <span className="stat-pill__label">Catalog total</span>
          </div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && (
        <div className="item-grid">
          {catalog.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              acquired={acquiredMap.get(item.id)?.acquired ?? false}
              showToggle
              onToggle={() => toggleAcquired(item)}
            />
          ))}
        </div>
      )}
    </>
  );
}
