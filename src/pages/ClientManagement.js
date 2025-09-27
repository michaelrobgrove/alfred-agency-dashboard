import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', domain: '', repository_name: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (e) => {
    e.preventDefault();
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('clients')
        .insert([
          {
            name: newClient.name,
            domain: newClient.domain,
            repository_name: newClient.repository_name,
            admin_user_id: user.user.id,
            status: 'active'
          }
        ]);

      if (error) throw error;

      setNewClient({ name: '', domain: '', repository_name: '' });
      setShowAddForm(false);
      fetchClients();
    } catch (error) {
      alert('Error adding client: ' + error.message);
    }
  };

  const editSite = (client) => {
    window.open(`https://${client.domain}/admin/`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Client Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your client websites and access their admin panels
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Client
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Add New Client
            </h3>
            <form onSubmit={addClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <input
                  type="text"
                  value={newClient.domain}
                  onChange={(e) => setNewClient({...newClient, domain: e.target.value})}
                  placeholder="example.com"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Repository Name</label>
                <input
                  type="text"
                  value={newClient.repository_name}
                  onChange={(e) => setNewClient({...newClient, repository_name: e.target.value})}
                  placeholder="client-website"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="mr-2">🌐</span>
                          {client.domain}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <span className="mr-2">📁</span>
                          {client.repository_name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button
                          onClick={() => editSite(client)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit Site
                        </button>
                        
                          href={`https://${client.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Site
                        </a>
                      </div>
                    </div>
                  </div>
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
