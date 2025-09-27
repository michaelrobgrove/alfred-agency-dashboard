export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { repoName, clientName } = await request.json();
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
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
          destination_dir: 'public',
          root_dir: ''
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      project: {
        name: data.result.name,
        url: `https://${repoName}.pages.dev`,
        id: data.result.id
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
