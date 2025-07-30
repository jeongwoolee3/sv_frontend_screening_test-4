import React from 'react';

const OverviewBulletItem: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <li className="flex items-start gap-2">
    <span className="text-blue-500 mt-0.5">•</span>
    <span>{children}</span>
  </li>
);

export default OverviewBulletItem;
