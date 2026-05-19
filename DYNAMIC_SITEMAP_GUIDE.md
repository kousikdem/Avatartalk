# Dynamic Sitemap Generation for User Profiles

## Overview

This guide explains how to implement dynamic sitemap generation for user profiles to improve SEO and search engine discoverability.

## Current Implementation

- **Static Sitemap**: `/public/sitemap.xml` contains core pages (home, pricing, terms, etc.)
- **Manual Profile URLs**: A few example profiles are manually added
- **TODO**: Implement automatic generation for all user profiles

## Why Dynamic Sitemaps?

1. **Scalability**: Automatically includes all new user profiles
2. **Freshness**: Updates `<lastmod>` dates when profiles are modified
3. **SEO**: Helps search engines discover and index user content
4. **No Maintenance**: Eliminates manual sitemap updates

## Implementation Option 1: Supabase Edge Function

### Step 1: Create Edge Function

Create `/supabase/functions/sitemap-profiles/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1?target=deno&pin=v135";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch all public profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .not('username', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50000); // Google sitemap limit

  if (error) {
    return new Response('Error fetching profiles', { status: 500 });
  }

  // Generate XML
  const profileUrls = profiles
    .map((p) => {
      const lastmod = new Date(p.updated_at).toISOString().split('T')[0];
      return `  <url>
    <loc>https://avatartalk.co/${p.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${profileUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
});
```

### Step 2: Deploy Function

```bash
supabase functions deploy sitemap-profiles
```

### Step 3: Update Main Sitemap

Replace `/public/sitemap.xml` with a sitemap index that references both static and dynamic sitemaps:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://avatartalk.co/sitemap-static.xml</loc>
    <lastmod>2026-05-18</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://avatartalk.co/sitemap-profiles.xml</loc>
    <lastmod>2026-05-18</lastmod>
  </sitemap>
</sitemapindex>
```

### Step 4: Configure Vercel Rewrites

Add to `vercel.json` rewrites (before the catch-all):

```json
{
  "source": "/sitemap-profiles.xml",
  "destination": "https://your-project.supabase.co/functions/v1/sitemap-profiles"
}
```

## Implementation Option 2: Build-Time Generation

### Using Vite Plugin

Create `vite-plugin-sitemap.ts`:

```typescript
import { supabase } from './src/integrations/supabase/client';

export function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    async closeBundle() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, updated_at')
        .not('username', 'is', null);

      // Generate sitemap XML...
      // Write to dist/sitemap.xml
    },
  };
}
```

Add to `vite.config.ts`:

```typescript
import { sitemapPlugin } from './vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    // ... other plugins
    sitemapPlugin(),
  ],
});
```

## Implementation Option 3: Scheduled Cron Job

### Using Vercel Cron + Supabase Edge Function

1. Create an edge function that:
   - Fetches all profiles
   - Generates sitemap XML
   - Stores in Supabase Storage or returns directly

2. Configure `vercel.json` cron:

```json
{
  "crons": [
    {
      "path": "/api/generate-sitemap",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Current Manual Approach

For now, manually update `/public/sitemap.xml` with high-priority profiles:

```xml
<url>
  <loc>https://avatartalk.co/username</loc>
  <lastmod>2026-05-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

## Testing

1. **Validate XML**: Use https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. **Google Search Console**: Submit sitemap at https://search.google.com/search-console
3. **Test Profile Access**: Open `https://avatartalk.co/:username` in incognito
4. **Check Robots**: Verify `https://avatartalk.co/robots.txt` includes sitemap reference

## SEO Best Practices

1. **Priority Levels**:
   - Home page: 1.0
   - Pricing, key pages: 0.8
   - User profiles: 0.6-0.7
   - Legal pages: 0.3

2. **Update Frequency**:
   - Active profiles: weekly
   - Static pages: monthly
   - Legal pages: yearly

3. **Sitemap Limits**:
   - Max 50,000 URLs per sitemap file
   - Max 50MB uncompressed
   - Use sitemap index if exceeding limits

4. **Profile URL Format**:
   - Use lowercase usernames
   - Avoid special characters in URLs
   - Ensure unique, permanent URLs

## Monitoring

- **Google Search Console**: Monitor index coverage
- **Bing Webmaster Tools**: Submit sitemap
- **Analytics**: Track organic search traffic to profiles

## Next Steps

1. Choose implementation method (Edge Function recommended)
2. Deploy dynamic sitemap generation
3. Submit to Google Search Console
4. Monitor indexing status
5. Add structured data (JSON-LD) to profile pages for rich snippets

---

*For questions or issues, check the Supabase Edge Functions documentation or Vercel deployment guides.*
