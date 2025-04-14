import React from 'react';
import { Link } from '@inertiajs/react';
import { LuTag, LuStore, LuMapPin } from 'react-icons/lu';

interface SellableCardProps {
  sellable: any;
}

export default function SellableCard({ sellable }: SellableCardProps) {
  // Parse media JSON if it's a string
  const mediaArray = typeof sellable.media === 'string' 
    ? JSON.parse(sellable.media) 
    : sellable.media || [];
  
  // Get the first image or use a placeholder
  const mainImage = mediaArray.length > 0 ? mediaArray[0] : '/placeholder.jpg';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={mainImage || "/placeholder.svg"} 
          alt={sellable.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
            sellable.sellable_type === 'PRODUCT' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          }`}>
            {sellable.sellable_type === 'PRODUCT' ? 'Product' : 'Service'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">
          {sellable.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {sellable.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-red-600 font-bold">₱{parseFloat(sellable.price).toFixed(2)}</span>
        </div>
        
        {sellable.business && (
          <Link 
            href={route('business.show', sellable.business.business_id)}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
          >
            <LuStore className="mr-1" />
            <span className="line-clamp-1">{sellable.business.business_name}</span>
          </Link>
        )}
        
        {sellable.business?.location && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <LuMapPin className="mr-1" />
            <span className="line-clamp-1">
              {sellable.business.location.city}, {sellable.business.location.province}
            </span>
          </div>
        )}
      </div>
      
      <div className="px-4 pb-4">
        <Link 
          href={route('sellable.show', sellable.sellable_id)}
          className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-2 rounded-md transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}