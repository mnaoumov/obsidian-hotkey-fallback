# Shared hotkeys

Use one shortcut for mutually exclusive actions, such as an editor command while editing and a navigation command elsewhere.

## Set it up

1. Open Obsidian Settings, then Hotkeys.
2. Assign the same combination to both commands. Obsidian still displays its normal conflict warning.
3. Enable `Hotkey Fallback` and press the shortcut.

The plugin asks whether each matching command is available. The first available command runs; later matches do not. The order is Obsidian's native binding order, which can change when bindings are changed or plugins reload. This plugin does not add a priority editor.

## Demonstration

```code-button
---
caption: Run the fallback command
---
await require('/demoSetup.ts').runDemo(app);
```

Expected result: **Fallback command ran**. Manual equivalent: after setup, press `Alt+1` with this note focused.

## Limits

Commands must correctly report their availability through `checkCallback` or `editorCheckCallback`. A plain callback is always available, even if its own implementation silently does nothing. Command failures are logged and native dispatch may try another binding; the plugin cannot undo work a command performed before failing.

This first version supports desktop. It uses Obsidian's normal key handling, including popout windows and repeat rules. Keys captured by an editor, modal or operating system before global dispatch keep their existing behavior. Palette and programmatically invoked commands keep native behavior.

Return to [00 Start](<./00 Start.md>) or [restore native behavior](<./02 Restore native behavior.md>).
