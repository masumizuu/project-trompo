import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Layout from '@/Layouts/AuthenticatedLayout';
import { LuMapPin, LuPhone, LuTag, LuHeart, LuHeartOff, LuStar, LuUser } from 'react-icons/lu';

interface Sellable {
  sellable_id: string;
  sellable_type: 'PRODUCT' | 'SERVICE';
  name: string;
  description: string;
  price: number;
  media: string;
}

interface Review {
  review_id: string;
  rating: number;
  review_text: string;
  media: string;
  customer: {
    user: {
      first_name: string;
      last_name: string;
      profile_picture: string;
    };
  };
}

interface BusinessDetailProps {
  business: any;
  isSaved: boolean;
  auth: any;
}

export default function BusinessDetail({ business, isSaved, auth }: BusinessDetailProps) {
  const [saved, setSaved] = useState(isSaved);
  const [activeTab, setActiveTab] = useState('products');
  const [sellables, setSellables] = useState(business.sellables || []);
  
  // Toggle save/unsave business
  const toggleSaveBusiness = async () => {
    if (!auth.user) {
      window.location.href = route('login');
      return;
    }

    try {
      if (saved) {
        await axios.delete(route('business.unsave', business.business_id));
      } else {
        await axios.post(route('business.save', business.business_id));
      }
      setSaved(!saved);
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };

  // Filter sellables by type
  const filteredSellables = sellables.filter((sellable: Sellable) => {
    if (activeTab === 'products') return sellable.sellable_type === 'PRODUCT';
    if (activeTab === 'services') return sellable.sellable_type === 'SERVICE';
    return true; // 'all' tab
  });

  return (
    <Layout>
      <Head title={business.business_name} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Banner and Basic Info */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
            <img 
              src={business.banner || '/placeholder-banner.jpg'} 
              alt={business.business_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 flex items-end">
              <div className="mr-4">
                <img 
                  src={business.logo || '/placeholder-logo.jpg'} 
                  alt={`${business.business_name} logo`}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{business.business_name}</h1>
                <div className="flex items-center text-white/80 text-sm mb-1">
                  <LuTag className="mr-1" />
                  <span>{business.category_ref?.category_name || business.category}</span>
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <LuMapPin className="mr-1" />
                  <span>
                    {business.address}, {business.location?.city}, {business.location?.province}
                  </span>
                </div>
              </div>
            </div>
            
            {auth.user && (
              <button 
                onClick={toggleSaveBusiness}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
              >
                {saved ? (
                  <LuHeartOff className="text-red-500 w-6 h-6" />
                ) : (
                  <LuHeart className="text-gray-500 w-6 h-6" />
                )}
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Business Info */}
            <div className="w-full md:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {business.description}
                  </p>
                  
                  <div className="flex items-center">
                    <LuPhone className="text-gray-500 mr-2" />
                    <span>{business.contact_number}</span>
                  </div>
                  
                  {business.website_url && (
                    <div>
                      <a 
                        href={business.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  {business.is_verified && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Verified Business
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
                
                <div className="flex items-center">
                  <img 
                    src={business.owner?.user?.profile_picture || '/placeholder-user.jpg'} 
                    alt="Business Owner"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium">
                      {business.owner?.user?.first_name} {business.owner?.user?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Business Owner</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Products/Services */}
            <div className="w-full md:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex border-b mb-6">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'all' 
                        ? 'text-red-600 border-b-2 border-red-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'products' 
                        ? 'text-red-600 border-b-2 border-red-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Products
                  </button>
                  <button 
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'services' 
                        ? 'text-red-600 border-b-2 border-red-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Services
                  </button>
                </div>
                
                {filteredSellables.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSellables.map((sellable: Sellable) => (
                      <div key={sellable.sellable_id} className="border rounded-lg overflow-hidden flex">
                        <div className="w-1/3">
                          <img 
                            src={sellable.media && sellable.media.length > 0 
                              ? JSON.parse(sellable.media)[0] 
                              : '/placeholder.jpg'
                            } 
                            alt={sellable.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-2/3 p-3">
                          <h3 className="font-medium">{sellable.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {sellable.description}
                          </p>
                          <div className="text-red-600 font-semibold">
                            ₱{sellable.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {sellable.sellable_type === 'PRODUCT' ? 'Product' : 'Service'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No {activeTab === 'all' ? 'items' : activeTab} available at this time.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Reviews Section */}
              {business.reviews && business.reviews.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
                  
                  <div className="space-y-4">
                    {business.reviews.map((review: Review) => (
                      <div key={review.review_id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <img 
                            src={review.customer?.user?.profile_picture || '/placeholder-user.jpg'} 
                            alt="Customer"
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                          <div>
                            <div className="font-medium">
                              {review.customer?.user?.first_name} {review.customer?.user?.last_name}
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <LuStar 
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-500 fill-yellow-500' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {review.review_text}
                        </p>
                        
                        {review.media && JSON.parse(review.media).length > 0 && (
                          <div className="flex mt-2 space-x-2 overflow-x-auto">
                            {JSON.parse(review.media).map((mediaUrl: string, index: number) => (
                              <img 
                                key={index}
                                src={mediaUrl || "/placeholder.svg"} 
                                alt={`Review image ${index + 1}`}
                                className="w-16 h-16 rounded object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}