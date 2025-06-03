'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ size = 'md', color = 'blue' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  return (
    <div className="flex justify-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}
          border-t-transparent
          rounded-full
          animate-spin
        `}
      />
    </div>
  );
}