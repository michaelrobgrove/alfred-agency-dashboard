import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleteOptions, setDeleteOptions] = useState({
    repo: false,
    cloudflare: false,
    database: true
  });

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

  const publishToStaging = async (client) => {
    try {
      // Create Cloudflare Pages project for staging
      const response = await fetch('/functions/api/create-pages-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: client.repository_name,
          clientName: client.name
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      await updateClient(client.id, {
        staging_domain: `${client.repository_name}.pages.dev`,
        cloudflare_project_id: data.project.id,
        staging_status: 'preview'
      });

      alert(`Staging site published at https://${client.repository_name}.pages.dev`);
    } catch (error) {
      alert('Error publishing to staging: ' + error.message);
    }
  };

  const publishToLive = async (client) => {
    if (!client.live_domain) {
      alert('Please set a live domain first');
      return;
    }

    try {
      // Add custom domain to Cloudflare Pages project
      const response = await fetch('/functions/api/add-custom-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: client.cloudflare_project_id,
          domain: client.live_domain
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      await updateClient(client.id, {
        staging_status: 'live',
        is_published: true
      });

      alert(`Site published live at https://${client.live_domain}`);
    } catch (error) {
      alert('Error publishing to live: ' + error.message);
    }
  };

  const unpublishSite = async (client) => {
    const reason = prompt('Reason for unpublishing (will be shown to visitors):');
    if (!reason) return;

    try {
      await updateClient(client.id, {
        is_published: false,
        unpublished_reason: reason
      });

      alert('Site unpublished successfully');
    } catch (error) {
      alert('Error unpublishing site: ' + error.message);
    }
  };

  const confirmDelete = async () => {
    if (confirmText !== 'CONFIRM') {
      alert('Please type CONFIRM to proceed');
      return;
    }

    try {
      const client = deletingClient;
      
      // Delete from Cloudflare Pages if requested
      if (deleteOptions.cloudflare && client.cloudflare_project_id) {
        await fetch('/functions/api/delete-pages-project', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: client.cloudflare_project_id })
        });
      }

      // Delete GitHub repo if requested
      if (deleteOptions.repo) {
        await fetch('/functions/api/delete-repo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoName: client.repository_name })
        });
      }

      // Always delete from database
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      setDeletingClient(null);
      setConfirmText('');
      await fetchClients();
      alert('Client deleted successfully');
    } catch (error) {
      alert('Error deleting client: ' + error.message);
    }
  };

  const calculateTotalRevenue = () => {
    return clients.reduce((sum, client) => sum + (parseFloat(client.monthly_fee) || 0), 0);
  };

  if (loading) return <div className="text-center py-8">Loading clients...</div>;

  return (
    <div className="space-y-6">
      {/* Header with Revenue Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Client Management</h2>
            <p className="text-indigo-100">Manage your client websites and revenue</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${calculateTotalRevenue().toFixed(2)}</div>
            <div className="text-indigo-100">Monthly Revenue</div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No clients yet</div>
            <a href="/builder" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Create First Client
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {clients.map((client) => (
              <li key={client.id} className="px-6 py-6">
                {editingClient === client.id ? (
                  <EditClientForm 
                    client={client} 
                    onSave={(updates) => updateClient(client.id, updates)}
                    onCancel={() => setEditingClient(null)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Client Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                        <div className="flex space-x-2">
                          {client.is_published && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Live
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.staging_status === 'live' ? 'bg-green-100 text-green-800' :
                            client.staging_status === 'preview' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.staging_status || 'draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-green-600">
                          ${parseFloat(client.monthly_fee || 0).toFixed(2)}/mo
                        </span>
                        <button
                          onClick={() => setEditingClient(client.id)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Client Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Staging:</span>
                        <span className="ml-2 text-gray-600">
                          {client.staging_domain || `${client.repository_name}.pages.dev (not published)`}
                        </span>
                      </div>
                      {client.live_domain && (
                        <div>
                          <span className="font-medium text-gray-700">Live:</span>
                          <span className="ml-2 text-gray-600">{client.live_domain}</span>
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <div className="bg-gray-50 rounded p-3">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-600 text-sm mt-1">{client.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/editor/${client.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Edit Site
                      </a>
                      
                      {!client.staging_domain && (
                        <button
                          onClick={() => publishToStaging(client)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Publish Staging
                        </button>
                      )}
                      
                      {client.staging_domain && client.live_domain && client.staging_status !== 'live' && (
                        <button
                          onClick={() => publishToLive(client)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          Publish Live
                        </button>
                      )}
                      
                      {client.is_published && (
                        <button
                          onClick={() => unpublishSite(client)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        >
                          Unpublish
                        </button>
                      )}
                      
                      {client.staging_domain && (
                        <a
                          href={`https://${client.staging_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Preview
                        </a>
                      )}
                      
                      {client.is_published && client.live_domain && (
                        <a
                          href={`https://${client.live_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Live
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Modal */}
      {deletingClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete {deletingClient.name}
              </h3>
              
              <div className="space-y-3 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deleteOptions.database}
                    onChange={(e) => setDeleteOptions({...deleteOptions, database: e.target.checked})}
                    className="mr-2"
                    disabled
                  />
                  <span className="text-sm">Remove from database (required)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deleteOptions.cloudflare}
                    onChange={(e) => setDeleteOptions({...deleteOptions, cloudflare: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Delete Cloudflare Pages project</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deleteOptions.repo}
                    onChange={(e) => setDeleteOptions({...deleteOptions, repo: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Delete GitHub repository</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "CONFIRM" to proceed:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="CONFIRM"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  disabled={confirmText !== 'CONFIRM'}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => {setDeletingClient(null); setConfirmText('')}}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditClientForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client.name,
    staging_domain: client.staging_domain || '',
    live_domain: client.live_domain || '',
    monthly_fee: client.monthly_fee || 0,
    notes: client.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.monthly_fee}
            onChange={(e) => setFormData({...formData, monthly_fee: parseFloat(e.target.value) || 0})}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staging Domain</label>
          <input
            type="text"
            value={formData.staging_domain}
            onChange={(e) => setFormData({...formData, staging_domain: e.target.value})}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
            placeholder="client-site.pages.dev"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Live Domain</label>
          <input
            type="text"
            value={formData.live_domain}
            onChange={(e) => setFormData({...formData, live_domain: e.target.value})}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
            placeholder="clientdomain.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows="3"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
          placeholder="Internal notes about this client..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ClientManagement;
