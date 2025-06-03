'use client';

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function Tab({ active, onClick, children }: TabProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}