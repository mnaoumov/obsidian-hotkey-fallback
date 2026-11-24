import type { App } from 'obsidian';

import { pressKey } from '@mnaoumov/obsidian-lib/desktop-trusted-input';
import { runWithTimeout } from '@mnaoumov/typescript-lib/async';

const PRIMARY_ID = 'hotkey-fallback-demo:primary';
const FALLBACK_ID = 'hotkey-fallback-demo:secondary';
const DEMO_TIMEOUT_IN_MILLISECONDS = 5000;

export function cleanup(app: App): void {
  for (const id of [PRIMARY_ID, FALLBACK_ID]) {
    app.commands.removeCommand(id);
    app.hotkeyManager.removeHotkeys(id);
  }
}

export async function runDemo(app: App): Promise<string> {
  cleanup(app);
  app.commands.addCommand({ checkCallback: () => false, id: PRIMARY_ID, name: 'Shared hotkey demo: Unavailable' });
  return runWithTimeout({
    operationFunction: async () => {
      const result = new Promise<string>((resolve) => {
        app.commands.addCommand({ callback: () => { resolve('Fallback command ran'); }, id: FALLBACK_ID, name: 'Shared hotkey demo: Fallback' });
      });
      for (const id of [PRIMARY_ID, FALLBACK_ID]) {
        app.hotkeyManager.setHotkeys(id, [{ key: '1', modifiers: ['Alt'] }]);
      }
      await pressKey({ key: '1', modifiers: ['Alt'] });
      return result;
    },
    operationName: 'Shared hotkey demonstration',
    timeoutInMilliseconds: DEMO_TIMEOUT_IN_MILLISECONDS
  });
}
