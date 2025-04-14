import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';
import { LuMapPin, LuPhone, LuTag, LuStore, LuArrowLeft } from 'react-icons/lu';

interface SellableDetailProps {
  sellable: any;
  auth: any;
}

export default function SellableDetail({ sellable, auth }: SellableDetailProps) {
  // Parse media JSON if it's a string
  const mediaArray = typeof sellable.media === 'string' 
    ? JSON.parse(sellable.media) 
    : sellable.media || [];

  return (
    <Layout>
      <Head title={sellable.name} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link 
              href={route('sellables.all')} 
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <LuArrowLeft className="mr-2" /> Back to Products & Services
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Column - Images */}
              <div className="w-full md:w-1/2 p-6">
                {mediaArray.length > 0 ? (
                  <div>
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={mediaArray[0] || "/placeholder.svg"} 
                        alt={sellable.name}
                        className="w-full h-80 object-cover"
                      />
                    </div>
                    
                    {mediaArray.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {mediaArray.slice(1).map((image: string, index: number) => (
                          <div key={index} className="rounded-lg overflow-hidden">
                            <img 
                              src={image || "/placeholder.svg"} 
                              alt={`${sellable.name} - image ${index + 2}`}
                              className="w-full h-20 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-80">
                    <p className="text-gray-500 dark:text-gray-400">No images available</p>
                  </div>
                )}
              </div>
              
              {/* Right Column - Details */}
              <div className="w-full md:w-1/2 p-6">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    sellable.sellable_type === 'PRODUCT' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {sellable.sellable_type === 'PRODUCT' ? 'Product' : 'Service'}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{sellable.name}</h1>
                
                <div className="text-2xl font-bold text-red-600 mb-4">
                  ₱{parseFloat(sellable.price).toFixed(2)}
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {sellable.description}
                  </p>
                </div>
                
                {sellable.business && (
                  <div className="border-t pt-4 mb-6">
                    <h2 className="text-lg font-semibold mb-2">Offered By</h2>
                    <Link 
                      href={route('business.show', sellable.business.business_id)}
                      className="flex items-center mb-2 hover:text-red-600 transition-colors"
                    >
                      <div className="mr-3">
                        <img 
                          src={sellable.business.logo || '/placeholder-logo.jpg'} 
                          alt={sellable.business.business_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{sellable.business.business_name}</div>
                        {sellable.business.is_verified && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Verified
                          </span>
                        )}
                      </div>
                    </Link>
                    
                    {sellable.business.location && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <LuMapPin className="mr-1" />
                        <span>
                          {sellable.business.address}, {sellable.business.location.city}, {sellable.business.location.province}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <LuPhone className="mr-1" />
                      <span>{sellable.business.contact_number}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link 
                    href={route('business.show', sellable.business.business_id)}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-md transition-colors"
                  >
                    View Business
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Products/Services Section */}
          {/* This would require additional data from the controller */}
          {/* You could add this feature later */}
        </div>
      </div>
    </Layout>
  );
}