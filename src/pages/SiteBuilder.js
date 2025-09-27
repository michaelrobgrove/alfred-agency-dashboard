import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const SiteBuilder = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    liveDomain: ''
  });
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);

  const generateRepoName = (name) => {
    return `awd-client-${name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-')}`;
  };

  const createGitHubRepo = async (repoName, clientName) => {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        description: `Website for ${clientName} - Managed by Alfred Web Design`,
        private: false,
        auto_init: true
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  };

  const createClient = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      setStep(2); // Show creating status

      const { data: { user } } = await supabase.auth.getUser();
      const repoName = generateRepoName(formData.clientName);
      const stagingDomain = `${repoName}.pages.dev`;

      // Step 1: Create GitHub repository
      const repoData = await createGitHubRepo(repoName, formData.clientName);
      
      // Step 2: Add to database
      const { error } = await supabase
        .from('clients')
        .insert([{
          name: formData.clientName,
          domain: stagingDomain,
          staging_domain: stagingDomain,
          live_domain: formData.liveDomain || null,
          repository_name: repoName,
          admin_user_id: user.id,
          email: formData.clientEmail,
          status: 'active',
          staging_status: 'draft'
        }]);

      if (error) throw error;

      setStep(3); // Show success
      
    } catch (error) {
      alert('Error: ' + error.message);
      setStep(1);
    } finally {
      setCreating(false);
    }
  };

  if (step === 2) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg">Creating site for {formData.clientName}...</span>
        </div>
        <p className="mt-2 text-gray-500">This may take a moment</p>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Site Created Successfully!</h3>
        <p className="mt-2 text-gray-500">
          Repository: {generateRepoName(formData.clientName)}<br/>
          Next: Set up Hugo template and deploy to Cloudflare Pages
        </p>
        <div className="mt-6 space-x-3">
          <button
            onClick={() => {setStep(1); setFormData({clientName: '', clientEmail: '', liveDomain: ''})}}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Create Another
          </button>
          
            href="/clients"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Clients
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Client Site</h3>
        <p className="mt-2 text-sm text-gray-500">Automatically creates GitHub repository and database entry</p>
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
                {creating ? 'Creating Repository...' : 'Create Site & Repository'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteBuilder;
