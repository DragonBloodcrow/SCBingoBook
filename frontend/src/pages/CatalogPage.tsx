import { useEffect, useState } from 'react';
import { fetchItems } from '../api/items';
import { ItemCard } from '../components/ItemCard';
import { ApiClientError } from '../lib/api';
import type { Item } from '../types';

export function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchItems(search ? { search } : undefined);
        if (!cancelled) setItems(data.items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Failed to load catalog');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(load, search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <>
      <h1 className="page-title">Catalog</h1>
      <p className="page-subtitle">Browse items available for collection tracking.</p>

      <div className="form-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Loading catalog…</p>}

      {!loading && !error && (
        <div className="item-grid">
          {items.length === 0 ? (
            <p className="card">No items found. Run the database seed to populate sample data.</p>
          ) : (
            items.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>
      )}
    </>
  );
}
