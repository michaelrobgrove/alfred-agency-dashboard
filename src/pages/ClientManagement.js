import React, { useState } from 'react';

const ClientManagement = () => {
  const [clients] = useState([]);
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Client Management
        </h3>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {clients.length === 0 ? (
            <li className="px-6 py-4">
              <p className="text-sm text-gray-500">No clients yet. Add your first client!</p>
            </li>
          ) : (
            clients.map((client) => (
              <li key={client.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.domain}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClientManagement;
