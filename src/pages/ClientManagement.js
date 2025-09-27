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

  if (loading) return <div className="text-center py-8">Loading clients...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Client Management</h3>
        <p className="mt-1 text-sm text-gray-500">Manage client websites with staging and live environments</p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {clients.length === 0 ? (
            <li className="px-6 py-4">
              <p className="text-sm text-gray-500">No clients yet.</p>
            </li>
          ) : (
            clients.map((client) => (
              <li key={client.id} className="px-6 py-4">
                {editingClient === client.id ? (
                  <EditForm client={client} onSave={(updates) => updateClient(client.id, updates)} onCancel={() => setEditingClient(null)} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">{client.name}</h4>
                      <button onClick={() => setEditingClient(client.id)} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Staging:</span> {client.staging_domain || client.domain}</div>
                      {client.live_domain && <div><span className="font-medium">Live:</span> {client.live_domain}</div>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`https://${client.staging_domain || client.domain}/admin/`, '_blank')}
                        className="px-3 py-1 border border-gray-300 text-xs rounded bg-white hover:bg-gray-50"
                      >
                        Edit Site
                      </button>
                      <button
                        onClick={() => window.open(`https://${client.staging_domain || client.domain}`, '_blank')}
                        className="px-3 py-1 border border-gray-300 text-xs rounded bg-white hover:bg-gray-50"
                      >
                        Preview
                      </button>
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

const EditForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client.name,
    staging_domain: client.staging_domain || client.domain,
    live_domain: client.live_domain || ''
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4 bg-gray-50 p-4 rounded">
      <div className="grid grid-cols-2 gap-4">
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
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Live Domain</label>
          <input
            type="text"
            value={formData.live_domain}
            onChange={(e) => setFormData({...formData, live_domain: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="example.com"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded text-sm text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
      </div>
    </form>
  );
};

export default ClientManagement;
