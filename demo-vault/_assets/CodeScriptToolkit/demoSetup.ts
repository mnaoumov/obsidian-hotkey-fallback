import type { App } from 'obsidian';
import { pressKey } from '@mnaoumov/obsidian-lib/desktop-trusted-input';
import { runWithTimeout } from '@mnaoumov/typescript-lib/async';

const PRIMARY_ID = 'hotkey-fallback-demo:primary';
const FALLBACK_ID = 'hotkey-fallback-demo:secondary';

export function cleanup(app: App): void {
  for (const id of [PRIMARY_ID, FALLBACK_ID]) {
    app.commands.removeCommand(id);
    app.hotkeyManager.removeHotkeys(id);
  }
}

export async function runDemo(app: App): Promise<string> {
  cleanup(app);
  app.commands.addCommand({ id: PRIMARY_ID, name: 'Hotkey Fallback demo: Unavailable', checkCallback: () => false });
  return runWithTimeout({
    timeoutInMilliseconds: 5000,
    operationName: 'Shared hotkey demonstration',
    operationFunction: async () => {
      const result = new Promise<string>((resolve) => {
        app.commands.addCommand({ id: FALLBACK_ID, name: 'Hotkey Fallback demo: Fallback', callback: () => resolve('Fallback command ran') });
      });
      for (const id of [PRIMARY_ID, FALLBACK_ID]) {
        app.hotkeyManager.setHotkeys(id, [{ modifiers: ['Alt'], key: '1' }]);
      }
      await pressKey({ key: '1', modifiers: ['Alt'] });
      return result;
    }
  });
}
