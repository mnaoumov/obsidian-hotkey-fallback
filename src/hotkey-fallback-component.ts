import type { App } from 'obsidian';

import { MonkeyAroundComponent } from '@mnaoumov/obsidian-lib/components/monkey-around-component';
import { Component } from 'obsidian';

/**
 * Lets native hotkey dispatch continue past an unavailable command.
 */
export class HotkeyFallbackComponent extends Component {
  private isHandlingHotkey = false;

  public constructor(private readonly app: App) {
    super();
  }

  public override onload(): void {
    // Leave native dispatch intact if a future Obsidian changes either internal entry point.
    if (typeof this.app.scope.handleKey !== 'function' || typeof this.app.commands.executeCommand !== 'function') {
      return;
    }

    const patches = this.addChild(new MonkeyAroundComponent());
    patches.registerMethodPatch({
      $object: this.app.scope,
      methodName: 'handleKey',
      patchHandler: ({ fallback }) => {
        const wasHandlingHotkey = this.isHandlingHotkey;
        this.isHandlingHotkey = true;
        try {
          return fallback();
        } finally {
          this.isHandlingHotkey = wasHandlingHotkey;
        }
      }
    });
    patches.registerMethodPatch({
      $object: this.app.commands,
      methodName: 'executeCommand',
      patchHandler: ({ fallback, originalArguments: [command] }) => {
        if (!this.isHandlingHotkey) {
          return fallback();
        }

        // Only the direct candidate is checked. A command may invoke other commands itself.
        this.isHandlingHotkey = false;
        try {
          return !(command.checkCallback && !command.checkCallback(true)) && fallback();
        } catch (error) {
          console.error('Hotkey command failed:', command.id, error);
          return false;
        } finally {
          this.isHandlingHotkey = true;
        }
      }
    });
  }
}
