import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One file per project in src/content/work. A project with status "pending"
// shows in the index but gets no page until its file is written.
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    code: z.string(),            // e.g. TS–001
    title: z.string(),
    year: z.string(),
    discipline: z.string(),      // shown in the index
    client: z.string(),
    summary: z.string(),
    status: z.enum(['live', 'pending']),
    order: z.number(),
    cover: z.string().optional(),
    lead: z.string().optional(),
    role: z.string().optional(),
    built: z.string().optional(),
    state: z.string().optional(),
  }),
});

export const collections = { work };
