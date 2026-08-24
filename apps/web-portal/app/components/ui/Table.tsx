import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-slate-200/60">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-slate-50/80 backdrop-blur-sm">{children}</thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-transparent divide-y divide-slate-100">{children}</tbody>
);

export const TableRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tr className={`transition-colors hover:bg-slate-50/50 ${className}`}>{children}</tr>
);

export const TableHead = ({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) => (
  <th colSpan={colSpan} className={`px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) => (
  <td colSpan={colSpan} className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 ${className}`}>
    {children}
  </td>
);
