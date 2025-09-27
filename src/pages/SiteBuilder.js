import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const SiteBuilder = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    liveDomain: ''
  });
  const [creating, setCreating] = useState(false);

  const generateRepoName = (name) => {
    return `awd-client-${name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-')}`;
  };

  const createClient = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const repoName = generateRepoName(formData.clientName);
      const stagingDomain = `${repoName}.pages.dev`;

      const { error } = await supabase
        .from('clients')
        .insert([{
          name: formData.clientName,
          staging_domain: stagingDomain,
          live_domain: formData.liveDomain || null,
          repository_name: repoName,
          admin_user_id: user.id,
          email: formData.clientEmail,
          status: 'active',
          staging_status: 'draft'
        }]);

      if (error) throw error;

      alert(`Client created! Repository name: ${repoName}\nNext: Create GitHub repo manually with this name.`);
      setFormData({ clientName: '', clientEmail: '', liveDomain: '' });
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Client Site</h3>
        <p className="mt-2 text-sm text-gray-500">Add a new client to your dashboard</p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={createClient} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Acme Corporation"
                />
                {formData.clientName && (
                  <p className="mt-1 text-xs text-gray-500">
                    Repository: {generateRepoName(formData.clientName)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Client Email *</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="client@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Live Domain (Optional)</label>
                <input
                  type="text"
                  value={formData.liveDomain}
                  onChange={(e) => setFormData({...formData, liveDomain: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="example.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating || !formData.clientName || !formData.clientEmail}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteBuilder;
