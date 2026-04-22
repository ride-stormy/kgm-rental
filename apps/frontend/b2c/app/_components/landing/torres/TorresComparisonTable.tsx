interface TorresComparisonRow {
  label: string;
  tivoli: string;
  torres: string;
}

interface TorresComparisonTableProps {
  headers: readonly [string, string, string];
  rows: readonly TorresComparisonRow[];
}

export const TorresComparisonTable = ({
  headers,
  rows,
}: TorresComparisonTableProps): JSX.Element => {
  const lastRowIndex = rows.length - 1;

  return (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-kgm-purple-700">
      <table className="w-full table-fixed border-separate border-spacing-0 text-[14px] leading-[18px]">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[35%]" />
          <col className="w-[35%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="h-16 px-2 py-3 text-center font-medium text-white">
              {headers[0]}
            </th>
            <th scope="col" className="h-16 px-2 py-3 text-center font-medium text-white">
              {renderTwoLineHeader(headers[1])}
            </th>
            <th scope="col" className="h-16 px-2 py-3 text-center font-medium text-white">
              {renderTwoLineHeader(headers[2])}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isLastRow = idx === lastRowIndex;
            const borderClass = isLastRow ? '' : 'border-b border-kgm-purple-600';
            const isFirstRow = idx === 0;
            const tivoliFontClass = isFirstRow ? 'font-bold' : 'font-medium';
            const torresFontClass = isFirstRow ? 'font-bold' : 'font-medium';

            return (
              <tr key={row.label}>
                <th
                  scope="row"
                  className={`bg-kgm-purple-800 px-2 py-3 text-center font-medium text-white ${borderClass}`}
                >
                  {row.label}
                </th>
                <td
                  className={`bg-kgm-purple-800 px-2 py-3 text-center text-white ${tivoliFontClass} ${borderClass}`}
                >
                  {row.tivoli}
                </td>
                <td
                  className={`bg-kgm-purple-800 px-2 py-3 text-center text-kgm-blue-500 ${torresFontClass} ${borderClass}`}
                >
                  {row.torres}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const renderTwoLineHeader = (header: string): JSX.Element => {
  const match = header.match(/^(.+?)\s*\((.+?)\)$/);
  if (!match) return <span>{header}</span>;
  return (
    <span className="flex flex-col gap-1">
      <span className="text-[14px] font-medium leading-[18px]">{match[1]}</span>
      <span className="text-[13px] font-medium leading-[18px]">({match[2]})</span>
    </span>
  );
};
