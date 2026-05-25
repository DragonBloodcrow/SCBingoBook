import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  acquired?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
}

export function ItemCard({ item, acquired, onToggle, showToggle }: ItemCardProps) {
  return (
    <article className="card item-card">
      {item.category && <span className="item-card__category">{item.category}</span>}
      <h3 className="item-card__name">{item.name}</h3>
      {item.description && <p className="item-card__desc">{item.description}</p>}
      {showToggle && onToggle && (
        <button
          type="button"
          className={acquired ? 'btn btn-ghost' : 'btn btn-primary'}
          onClick={onToggle}
          aria-pressed={acquired}
        >
          {acquired ? 'Acquired ✓' : 'Mark acquired'}
        </button>
      )}
    </article>
  );
}
