/**
 * HubForge plugin hooks.
 * Add custom logic for init/feature/upgrade without forking the framework.
 */
export default {
  async beforeInit(ctx) {
    // console.log('[plugin] beforeInit', ctx.projectName);
  },
  async afterInit(ctx) {
    // console.log('[plugin] afterInit', ctx.targetDir);
  },
};
