import React from 'react';

const OverviewSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="flex-1 bg-white p-4 rounded-lg shadow-lg border">
      <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
      {children}
    </div>
  );
};

export default OverviewSection;
