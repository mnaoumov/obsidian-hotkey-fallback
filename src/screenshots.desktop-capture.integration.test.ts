import {
  mkdirSync,
  writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import {
  captureObsidianScreenshot,
  evalInObsidian
} from 'obsidian-integration-testing';
import { getTemporaryVault } from 'obsidian-integration-testing/vitest-global-setup-plugin';
import {
  expect,
  it
} from 'vitest';

it('captures the visible result of an actual shared hotkey', async () => {
  const vaultPath = getTemporaryVault().path;
  const runs = await evalInObsidian({
    callback: async ({ app, lib: { pressKey, waitUntil } }) => {
      let primaryRuns = 0;
      let fallbackRuns = 0;
      const text = '# One shortcut, two commands\n\nUse **Alt + 1** for the first available command.\n\n1. Primary command: unavailable in this context.\n2. Fallback command: ready to run.\n\n';
      const note = await app.vault.create('Shared hotkeys.md', text);
      const leaf = app.workspace.getLeaf(false);
      await leaf.openFile(note);
      await leaf.setViewState({ state: { file: note.path, mode: 'preview' }, type: 'markdown' });
      app.commands.addCommand({
        checkCallback(checking) {
          if (!checking) { primaryRuns++; }
          return false;
        },
        id: 'screenshot:primary',
        name: 'Primary'
      });
      app.commands.addCommand({
        callback: async () => {
          fallbackRuns++;
          await app.vault.modify(note, `${text}## Result\n\n**Fallback command ran.**\n\nThe primary command did not run. No bindings were moved or rewritten.\n`);
        },
        id: 'screenshot:fallback',
        name: 'Fallback'
      });
      for (const id of ['screenshot:primary', 'screenshot:fallback']) {
        app.hotkeyManager.setHotkeys(id, [{ key: '1', modifiers: ['Alt'] }]);
      }
      await pressKey({ key: '1', modifiers: ['Alt'] });
      await waitUntil({ predicate: () => leaf.view.containerEl.textContent.includes('Fallback command ran.'), timeoutInMilliseconds: 5000 });
      app.workspace.leftSplit.collapse();
      app.workspace.rightSplit.collapse();
      return { fallbackRuns, primaryRuns };
    },
    vaultPath
  });
  expect(runs).toEqual({ fallbackRuns: 1, primaryRuns: 0 });
  const bytes = await captureObsidianScreenshot({ heightInPixels: 800, vaultPath, widthInPixels: 1200 });
  const directory = join(process.cwd(), 'images', 'screenshots');
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'screenshot-desktop-1.png'), bytes);
});
