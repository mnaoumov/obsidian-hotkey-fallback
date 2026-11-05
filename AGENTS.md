# Hotkey Fallback

Follow the shared Obsidian workspace conventions.

## Architecture

`HotkeyFallbackComponent` patches `app.scope.handleKey` and `Commands.executeCommand` through `MonkeyAroundComponent`. Availability checks apply only to a direct hotkey candidate. Nested commands, palette commands and programmatic execution retain native behavior. Obsidian normalizes editor commands into `checkCallback` during registration.

This plugin has no settings. Bind commands through Obsidian's Hotkeys settings; native binding order determines priority. It initially targets desktop, including popout windows. All patches unload with the plugin.

## Validation

Run the standard workspace gate and the desktop behavioral integration suite with one worker. Verify the internals patch against both public-latest and catalyst-latest. The desktop suite must drive trusted key presses and prove unload restores native dispatch.

The local `dprint` override requires control-flow braces, matching `ESLint`'s `curly` rule. The shared formatter otherwise removes short braces that the linter requires.
