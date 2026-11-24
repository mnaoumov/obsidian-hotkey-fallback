# CHANGELOG

## 0.1.0

Released 2026-11-03. First release of `Hotkey Fallback`.

- When several commands share one hotkey, the first one that is available now runs, instead of an unavailable first command swallowing the key.
- Conditional editor commands are checked through Obsidian's own availability check, so a command that would do nothing in the current context is skipped.
- Hotkeys are still bound in Obsidian's Hotkeys settings, and their native order decides which command is tried first. The plugin has no settings of its own.
- Works in the main window and in popout windows. Desktop only.
- Disabling the plugin restores Obsidian's native hotkey dispatch.
