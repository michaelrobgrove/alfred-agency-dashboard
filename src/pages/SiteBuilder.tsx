import React from 'react';

const SiteBuilder: React.FC = () => {
  const handleCreateSite = async () => {
    console.log('Creating new client site...');
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Site Builder
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Create new client websites in minutes.
        </p>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Site Creation
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Deploy a new client website with Hugo + Decap CMS in under 4 hours.</p>
          </div>
          <div className="mt-5">
            <button
              onClick={handleCreateSite}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteBuilder;
