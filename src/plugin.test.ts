import type { PluginManifest } from 'obsidian';

import { Plugin as ObsidianPlugin } from 'obsidian';
import {
  App,
  Plugin as PluginHost
} from 'obsidian-test-mocks/obsidian';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { HotkeyFallbackComponent } from './hotkey-fallback-component.ts';
import { Plugin } from './plugin.ts';

describe('HotkeyFallback', () => {
  it('extends the Obsidian Plugin class', () => {
    expect(Plugin.prototype).toBeInstanceOf(ObsidianPlugin);
  });

  // The plugin's own `onload` runs here, so this proves the command is registered, not only imported.
  it('registers the Report a bug command', async () => {
    const patchSetup = vi.spyOn(HotkeyFallbackComponent.prototype, 'onload').mockImplementation(() => undefined);
    const manifest: PluginManifest = {
      author: 'test',
      description: 'test',
      id: 'test-plugin',
      minAppVersion: '0.0.0',
      name: 'Test Plugin',
      version: '0.0.0'
    };
    const plugin = new Plugin(App.createConfigured__().asOriginalType__(), manifest);
    await plugin.onload();
    expect(PluginHost.fromOriginalType2__(plugin).commands__.has('report-bug')).toBe(true);
    plugin.unload();
    patchSetup.mockRestore();
  });
});
