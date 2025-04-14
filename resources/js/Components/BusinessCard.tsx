import React from 'react';
import { Link } from '@inertiajs/react';
import { LuMapPin, LuTag, LuHeart, LuHeartOff } from 'react-icons/lu';

interface BusinessCardProps {
  business: any;
  isSaved: boolean;
  onToggleSave: () => void;
  isAuthenticated: boolean;
}

export default function BusinessCard({ business, isSaved, onToggleSave, isAuthenticated }: BusinessCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={business.banner || '/placeholder.jpg'} 
          alt={business.business_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {isAuthenticated && (
          <button 
            onClick={onToggleSave}
            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isSaved ? (
              <LuHeartOff className="text-red-500 w-5 h-5" />
            ) : (
              <LuHeart className="text-gray-500 dark:text-gray-400 w-5 h-5" />
            )}
          </button>
        )}
        
        <div className="absolute bottom-2 left-2 flex items-center">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-md">
            <img 
              src={business.logo || '/placeholder-logo.jpg'} 
              alt={`${business.business_name} logo`}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <Link href={route('business.show', business.business_id)}>
          <h3 className="text-lg font-semibold mb-2 hover:text-red-500 transition-colors">
            {business.business_name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {business.description}
        </p>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <LuMapPin className="mr-1" />
          <span>
            {business.location?.city}, {business.location?.province}
          </span>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <LuTag className="mr-1" />
          <span>{business.category_ref?.category_name || business.category}</span>
        </div>
        
        {business.is_verified && (
          <div className="mt-3">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
}