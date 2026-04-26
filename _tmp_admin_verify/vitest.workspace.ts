import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/api/vitest.config.ts',
  'apps/portal/vitest.config.ts',
  'apps/ui/vitest.config.ts',
]);
