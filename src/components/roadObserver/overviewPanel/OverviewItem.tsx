import React from 'react';

interface OverviewItemProps {
  color: string;
  bgColor: string;
  label: string;
  count: number;
}

const OverviewItem: React.FC<OverviewItemProps> = ({
  color,
  bgColor,
  label,
  count,
}) => (
  <div className={`flex items-center justify-between p-2 rounded ${bgColor}`}>
    <div className="flex items-center gap-2">
      <div className="w-4 h-3 rounded" style={{ backgroundColor: color }}></div>
      <span className="text-sm">{label}</span>
    </div>
    <span className="font-bold" style={{ color }}>
      {count}대
    </span>
  </div>
);

export default OverviewItem;
