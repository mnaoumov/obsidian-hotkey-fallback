import type { PopulateFilesParams } from 'obsidian-integration-testing';

import { CODE_SCRIPT_TOOLKIT_PLUGIN_ID } from '@mnaoumov/obsidian-dev-toolkit/demo-vault-buttons';
import { getRootFolder } from '@mnaoumov/typescript-dev-toolkit/root';
import { join } from 'node:path';
import process from 'node:process';
import { buildDemoVaultPopulateAsync } from 'obsidian-integration-testing';
import { createSetup } from 'obsidian-integration-testing/vitest-global-setup-plugin';

/**
Installs missing demo dependencies before opening a copied vault.
*/
async function populate(): Promise<PopulateFilesParams> {
  return buildDemoVaultPopulateAsync({
    demoVaultPath: join(getRootFolder() ?? process.cwd(), 'demo-vault'),
    injectPlugins: [{
      data: {
        invocableScriptsFolder: 'Invocables',
        modulesRoot: '_assets/CodeScriptToolkit',
        shouldHandleProtocolUrls: true,
        startupScriptPath: 'startup.ts'
      },
      minVersion: '13.8.0',
      pluginId: CODE_SCRIPT_TOOLKIT_PLUGIN_ID
    }]
  });
}

const { setup, teardown } = createSetup({
  enableCommunityPlugins: [CODE_SCRIPT_TOOLKIT_PLUGIN_ID],
  populate
});
export {
  setup,
  teardown
};
