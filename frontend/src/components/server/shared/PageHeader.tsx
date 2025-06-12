import Link from 'next/link';
import { ArrowLeftIcon, HeartIcon, StarIcon, MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  backLabel?: string;
  icon?: 'heart' | 'star' | 'search' | 'chart' | null;
}

export default function PageHeader({
  title,
  description,
  showBackButton = false,
  backUrl = '/',
  backLabel = 'Retour',
  icon = null
}: PageHeaderProps) {
  const IconComponent = icon === 'heart' ? HeartIcon : 
                        icon === 'star' ? StarIcon :
                        icon === 'search' ? MagnifyingGlassIcon :
                        icon === 'chart' ? ChartBarIcon : null;
  
  return (
    <div className="mb-6">
      {showBackButton && (
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{backLabel}</span>
        </Link>
      )}
      
      {icon && IconComponent && (
        <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg mb-3 md:mb-0">
          <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
      )}
      
      {title && (
        <h1 className="text-3xl font-bold mb-1">{title}</h1>
      )}
      
      {description && (
        <p className="text-gray-400">{description}</p>
      )}
    </div>
  );
}