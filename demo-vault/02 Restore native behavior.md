# Restore native behavior

Disabling `Hotkey Fallback` removes its patches immediately. With the plugin disabled, the first matching command consumes the shared hotkey again.

## Remove the demo bindings

```code-button
---
caption: Remove demonstration commands
---
require('/demoSetup.ts').cleanup(app);
'Demonstration commands removed';
```

Manual equivalent: clear both `Hotkey Fallback demo` bindings in Settings, Hotkeys. The demonstration commands are temporary and disappear on restart.

## Disable the plugin

Open Settings, Community plugins and turn off `Hotkey Fallback`. Your own bindings remain intact. Turn it back on to restore fallback behavior.

The plugin has no settings and does not rewrite your hotkeys. It does not change command palette or programmatic execution.

Return to [00 Start](<./00 Start.md>).
