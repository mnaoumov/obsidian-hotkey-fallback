import { evalInObsidian } from 'obsidian-integration-testing';
import { getTemporaryVault } from 'obsidian-integration-testing/vitest-global-setup-plugin';
import {
  describe,
  expect,
  it
} from 'vitest';

describe('shared hotkeys', () => {
  it('uses the same availability fallback in a popout window', async () => {
    const result = await evalInObsidian({
      callback: async ({ app, lib: { pressKey, waitUntil } }) => {
        let runs = 0;
        const ids = ['fallback-popout:primary', 'fallback-popout:secondary'];
        app.commands.addCommand({ checkCallback: () => false, id: ids[0] ?? '', name: 'Unavailable' });
        app.commands.addCommand({
          callback: () => {
            runs++;
          },
          id: ids[1] ?? '',
          name: 'Fallback'
        });
        for (const id of ids) { app.hotkeyManager.setHotkeys(id, [{ key: '1', modifiers: ['Alt'] }]); }
        const leaf = app.workspace.openPopoutLeaf();
        try {
          await leaf.setViewState({ type: 'empty' });
          await pressKey({ key: '1', modifiers: ['Alt'], window: leaf.view.containerEl.win });
          await waitUntil({ predicate: () => runs > 0, timeoutInMilliseconds: 5000 });
          return runs;
        } finally {
          leaf.detach();
          for (const id of ids) {
            app.commands.removeCommand(id);
            app.hotkeyManager.removeHotkeys(id);
          }
        }
      },
      vaultPath: getTemporaryVault().path
    });
    expect(result).toBe(1);
  });

  it('falls through, stops at an available command and restores native behavior on unload', async () => {
    const result = await evalInObsidian({
      callback: async ({ app, lib: { pressKey, waitUntil } }) => {
        let isPrimaryAvailable = false;
        let primaryRuns = 0;
        let fallbackRuns = 0;
        const checks: boolean[] = [];
        const ids = ['fallback-test:primary', 'fallback-test:secondary'];
        app.commands.addCommand({
          checkCallback(checking) {
            checks.push(checking);
            if (!isPrimaryAvailable) { return false; }
            if (!checking) { primaryRuns++; }
            return true;
          },
          id: ids[0] ?? '',
          name: 'Primary'
        });
        app.commands.addCommand({
          callback: () => {
            fallbackRuns++;
          },
          id: ids[1] ?? '',
          name: 'Secondary'
        });
        for (const id of ids) { app.hotkeyManager.setHotkeys(id, [{ key: '1', modifiers: ['Alt'] }]); }
        try {
          activeDocument.body.focus();
          await pressKey({ key: '1', modifiers: ['Alt'] });
          await waitUntil({ predicate: () => checks.length > 0, timeoutInMilliseconds: 5000 });
          const unavailable = { checks: [...checks], fallbackRuns, primaryRuns };
          checks.length = 0;
          isPrimaryAvailable = true;
          await pressKey({ key: '1', modifiers: ['Alt'] });
          await waitUntil({ predicate: () => checks.length > 0, timeoutInMilliseconds: 5000 });
          const available = { checks: [...checks], fallbackRuns, primaryRuns };
          isPrimaryAvailable = false;
          checks.length = 0;
          await app.plugins.disablePlugin('hotkey-fallback');
          await pressKey({ key: '1', modifiers: ['Alt'] });
          await waitUntil({ predicate: () => checks.length > 0, timeoutInMilliseconds: 5000 });
          const unloaded = { checks: [...checks], fallbackRuns, primaryRuns };
          return { available, unavailable, unloaded };
        } finally {
          for (const id of ids) {
            app.commands.removeCommand(id);
            app.hotkeyManager.removeHotkeys(id);
          }
          await app.plugins.enablePlugin('hotkey-fallback');
        }
      },
      vaultPath: getTemporaryVault().path
    });
    expect(result).toEqual({
      available: { checks: [true, false], fallbackRuns: 1, primaryRuns: 1 },
      unavailable: { checks: [true], fallbackRuns: 1, primaryRuns: 0 },
      unloaded: { checks: [false], fallbackRuns: 1, primaryRuns: 1 }
    });
  });

  it('falls through an editor command when the active view has no editor', async () => {
    const result = await evalInObsidian({
      callback: async ({ app, lib: { pressKey, waitUntil } }) => {
        let editorRuns = 0;
        let fallbackRuns = 0;
        const ids = ['fallback-editor:primary', 'fallback-editor:secondary'];
        app.commands.addCommand({
          editorCallback: () => {
            editorRuns++;
          },
          id: ids[0] ?? '',
          name: 'Editor'
        });
        app.commands.addCommand({
          callback: () => {
            fallbackRuns++;
          },
          id: ids[1] ?? '',
          name: 'Fallback'
        });
        for (const id of ids) { app.hotkeyManager.setHotkeys(id, [{ key: '1', modifiers: ['Alt'] }]); }
        try {
          const leaf = app.workspace.getLeaf(false);
          await leaf.setViewState({ type: 'empty' });
          activeDocument.body.focus();
          await pressKey({ key: '1', modifiers: ['Alt'] });
          await waitUntil({ predicate: () => fallbackRuns > 0, timeoutInMilliseconds: 5000 });
          return { editorRuns, fallbackRuns };
        } finally {
          for (const id of ids) {
            app.commands.removeCommand(id);
            app.hotkeyManager.removeHotkeys(id);
          }
        }
      },
      vaultPath: getTemporaryVault().path
    });
    expect(result).toEqual({ editorRuns: 0, fallbackRuns: 1 });
  });
});
