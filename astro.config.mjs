import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://tanakasande.netlify.app',
  integrations: [mdx()],
  build: { format: 'directory' },
});
