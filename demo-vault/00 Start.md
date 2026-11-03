# Start here

Sharing one hotkey between commands normally stops at the first match, even when that command cannot run. `Hotkey Fallback` lets the next matching command try instead.

## Try it

The code button below renders as a captioned rectangle in Obsidian. Clicking it installs two demonstration commands on `Alt+1`, sends that key, and displays the result underneath. The `</>` toggle reveals the source.

```code-button
---
caption: Try the shared hotkey
---
await require('/demoSetup.ts').runDemo(app);
```

Expected result: **Fallback command ran**. The first command declines its availability check; the second one runs. These demonstration bindings affect only this disposable vault.

Manual equivalent: run the button once, close any modal, and press `Alt+1`. Assigning a shared key in your own vault is described in [01 Shared hotkeys](<./01 Shared hotkeys.md>).

## Explore

1. [01 Shared hotkeys](<./01 Shared hotkeys.md>) explains ordering, editor commands and limitations.
2. [02 Restore native behavior](<./02 Restore native behavior.md>) explains how to remove the demonstration and disable the plugin.
