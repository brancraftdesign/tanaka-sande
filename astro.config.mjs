import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://tanakasande.tanakadesign25.workers.dev',
  integrations: [mdx()],
  build: { format: 'directory' },
});
