import type { App } from 'obsidian';
import { cleanup as cleanupDemo } from './demoSetup.ts';

export async function invoke(app: App): Promise<void> {
  const note = app.vault.getFileByPath('00 Start.md');
  if (note) { await app.workspace.getLeaf(false).openFile(note); }
}

export function cleanup(app: App): void { cleanupDemo(app); }
