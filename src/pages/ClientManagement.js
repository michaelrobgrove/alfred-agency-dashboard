import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState(null);

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

  const updateClient = async (clientId, updates) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);

      if (error) throw error;
      await fetchClients();
      setEditingClient(null);
    } catch (error) {
      alert('Error updating client: ' + error.message);
    }
  };

  const editSite = (client) => {
    const editUrl = client.staging_status === 'live' && client.live_domain 
      ? `https://${client.live_domain}/admin/`
      : `https://${client.staging_domain}/admin/`;
    window.open(editUrl, '_blank');
  };

  const previewSite = (client) => {
    const previewUrl = client.staging_domain.includes('.pages.dev') 
      ? `https://${client.staging_domain}`
      : `https://${client.staging_domain}`;
    window.open(previewUrl, '_blank');
  };

  const goLive = async (client) => {
    if (window.confirm(`Make ${client.name} live at ${client.live_domain}?`)) {
      await updateClient(client.id, { staging_status: 'live' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Client Management
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage client websites with staging and live environments
        </p>
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
                {editingClient === client.id ? (
                  <EditClientForm 
                    client={client} 
                    onSave={(updates) => updateClient(client.id, updates)}
                    onCancel={() => setEditingClient(null)}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{client.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.staging_status === 'live' ? 'bg-green-100 text-green-800' :
                            client.staging_status === 'preview' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.staging_status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingClient(client.id)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Staging: </span>
                          <span className="text-gray-600">{client.staging_domain}</span>
                        </div>
                        {client.live_domain && (
                          <div>
                            <span className="font-medium text-gray-700">Live: </span>
                            <span className="text-gray-600">{client.live_domain}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editSite(client)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit Site
                        </button>
                        <button
                          onClick={() => previewSite(client)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Preview
                        </button>
                        {client.live_domain && (
                          
                            href={`https://${client.live_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Live
                          </a>
                        )}
                      </div>
                      
                      {client.staging_status !== 'live' && client.live_domain && (
                        <button
                          onClick={() => goLive(client)}
                          className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          Go Live
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

const EditClientForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client.name,
    staging_domain: client.staging_domain,
    live_domain: client.live_domain || '',
    staging_status: client.staging_status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Staging Domain</label>
          <input
            type="text"
            value={formData.staging_domain}
            onChange={(e) => setFormData({...formData, staging_domain: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="client-site.pages.dev"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Live Domain (Optional)</label>
          <input
            type="text"
            value={formData.live_domain}
            onChange={(e) => setFormData({...formData, live_domain: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="clientdomain.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={formData.staging_status}
            onChange={(e) => setFormData({...formData, staging_status: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
          >
            <option value="draft">Draft</option>
            <option value="preview">Preview</option>
            <option value="live">Live</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ClientManagement;
