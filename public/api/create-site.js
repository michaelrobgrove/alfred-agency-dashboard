// This needs to be a serverless function (Netlify/Vercel)
// For now, we'll do it client-side (not recommended for production)
export default async function handler(req, res) {
  const { clientName, repoName } = req.body;
  
  // Create GitHub repo
  const repoResponse = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: repoName,
      description: `Website for ${clientName} - Managed by Alfred Web Design`,
      private: false
    })
  });

  if (!repoResponse.ok) {
    return res.status(500).json({ error: 'Failed to create repo' });
  }

  // Create Cloudflare Pages project
  const pagesResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/pages/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: repoName,
      source: {
        type: 'github',
        config: {
          owner: 'michaelrobgrove',
          repo_name: repoName,
          production_branch: 'main',
          pr_comments_enabled: false
        }
      },
      build_config: {
        build_command: 'hugo --minify',
        destination_dir: 'public'
      }
    })
  });

  res.json({ success: true, repo: repoName });
}
