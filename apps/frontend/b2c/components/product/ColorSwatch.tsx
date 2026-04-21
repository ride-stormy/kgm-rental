import type { ColorSwatchItem } from '@kgm-rental/api-contracts/product/common.schema.js';

export const ColorSwatch = ({ items }: { items: ColorSwatchItem[] }): JSX.Element => {
  const limit = 5;
  const visible = items.slice(0, limit);
  const extra = items.length - visible.length;
  return (
    <div className="flex items-center gap-1">
      {visible.map((c) => (
        <span
          key={c.code}
          aria-label={c.name}
          title={c.name}
          className="h-4 w-4 rounded-full border border-slate-200"
          style={{ backgroundColor: c.hex ?? '#CBD5E1' }}
        />
      ))}
      {extra > 0 ? (
        <span className="text-xs text-slate-500">+{extra}</span>
      ) : null}
    </div>
  );
};
