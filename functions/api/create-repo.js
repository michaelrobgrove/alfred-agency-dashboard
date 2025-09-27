export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { repoName, clientName, description } = await request.json();
    
    // Create GitHub repository
    const repoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Alfred-Web-Design'
      },
      body: JSON.stringify({
        name: repoName,
        description: description || `Website for ${clientName} - Managed by Alfred Web Design`,
        private: false,
        auto_init: true,
        gitignore_template: 'Hugo'
      })
    });

    if (!repoResponse.ok) {
      const error = await repoResponse.text();
      throw new Error(`GitHub API error: ${repoResponse.status} - ${error}`);
    }

    const repoData = await repoResponse.json();

    // Add Hugo template files to the repository
    await addHugoTemplate(env.GITHUB_TOKEN, repoName, clientName);

    return new Response(JSON.stringify({
      success: true,
      repository: {
        name: repoData.name,
        url: repoData.html_url,
        clone_url: repoData.clone_url
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

async function addHugoTemplate(token, repoName, clientName) {
  const files = {
    'hugo.toml': `
baseURL = 'https://${repoName}.pages.dev'
languageCode = 'en-us'
title = '${clientName}'
theme = 'client-theme'

[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
`,
    'content/_index.md': `---
title: "Welcome to ${clientName}"
description: "Professional website for ${clientName}"
---

# Welcome to ${clientName}

This is your professional website. You can edit this content through your admin panel at [/admin/](/admin/).

## About Us

Tell your story here.

## Our Services

- Service 1: Description
- Service 2: Description  
- Service 3: Description

## Contact Us

Get in touch today!
`,
    'static/admin/index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  <script>
    CMS.init({
      config: {
        backend: {
          name: 'github',
          repo: 'michaelrobgrove/${repoName}',
          branch: 'main'
        },
        media_folder: 'static/images',
        public_folder: '/images',
        collections: [
          {
            name: 'pages',
            label: 'Pages',
            files: [
              {
                label: 'Home Page',
                name: 'home',
                file: 'content/_index.md',
                fields: [
                  { label: 'Title', name: 'title', widget: 'string' },
                  { label: 'Description', name: 'description', widget: 'string' },
                  { label: 'Body', name: 'body', widget: 'markdown' }
                ]
              }
            ]
          }
        ]
      }
    });
  </script>
</body>
</html>`,
    'themes/client-theme/layouts/_default/baseof.html': `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ .Title }} - {{ .Site.Title }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; margin: 0; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1, h2, h3 { color: #333; }
        a { color: #0066cc; }
    </style>
</head>
<body>
    {{ block "main" . }}{{ end }}
</body>
</html>`,
    'themes/client-theme/layouts/_default/single.html': `{{ define "main" }}
<article>
    <h1>{{ .Title }}</h1>
    <div>{{ .Content }}</div>
</article>
{{ end }}`,
    'themes/client-theme/layouts/index.html': `{{ define "main" }}
<div>{{ .Content }}</div>
{{ end }}`,
    '_redirects': '/admin/* /admin/index.html 200'
  };

  // Create files in repository
  for (const [path, content] of Object.entries(files)) {
    await fetch(`https://api.github.com/repos/michaelrobgrove/${repoName}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Alfred-Web-Design'
      },
      body: JSON.stringify({
        message: `Add ${path}`,
        content: btoa(content)
      })
    });
  }
}
