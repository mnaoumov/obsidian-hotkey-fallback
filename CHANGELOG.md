# CHANGELOG

## 1.0.0

This release has 1 fix and 4 documentation changes. 5 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- **test:** hold the test:coverage gate at 100%

### Documentation

- **readme:** use the plugin badge line with minimum Obsidian version and CI
- **changelog:** rewrite the 0.1.0 entry in user terms
- **readme:** show the Buy Me a Coffee button in the Support section
- add the changelog and link it from the README

## 0.1.0

Released 2026-11-03. First release of `Hotkey Fallback`.

- When several commands share one hotkey, the first one that is available now runs, instead of an unavailable first command swallowing the key.
- Conditional editor commands are checked through Obsidian's own availability check, so a command that would do nothing in the current context is skipped.
- Hotkeys are still bound in Obsidian's Hotkeys settings, and their native order decides which command is tried first. The plugin has no settings of its own.
- Works in the main window and in popout windows. Desktop only.
- Disabling the plugin restores Obsidian's native hotkey dispatch.
