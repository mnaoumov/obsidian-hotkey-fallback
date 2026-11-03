import type { Commands } from '@obsidian-typings/obsidian-public-latest';
import type {
  App,
  Command,
  Scope
} from 'obsidian';

import { castTo } from '@mnaoumov/typescript-lib/object-utils';
import { strictProxy } from '@mnaoumov/typescript-test-toolkit/strict-proxy';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { HotkeyFallbackComponent } from './hotkey-fallback-component.ts';

interface Fixture {
  readonly app: App;
  readonly checkTrigger: () => unknown;
  readonly component: HotkeyFallbackComponent;
  readonly executed: string[];
}

function createFixture(candidates: Command[]): Fixture {
  const executed: string[] = [];
  const commands = strictProxy<Commands>({
    executeCommand(command) {
      executed.push(command.id);
      command.checkCallback?.(false);
      command.callback?.();
      return true;
    }
  });
  const scope = strictProxy<Scope>({
    handleKey() {
      for (const command of candidates) {
        if (commands.executeCommand(command)) {
          return false;
        }
      }
      return true;
    }
  });
  const app = strictProxy<App>({ commands, scope });
  const component = new HotkeyFallbackComponent(app);
  function checkTrigger(): unknown {
    return scope.handleKey(new KeyboardEvent('keydown'), { key: '1', modifiers: 'Alt' });
  }
  component.load();
  return { app, checkTrigger, component, executed };
}

describe('hotkey fallback', () => {
  it('skips unavailable commands and executes only the first available candidate', () => {
    const canRunFirst = vi.fn((): boolean => false);
    const canRunSecond = vi.fn((): boolean => true);
    const fixture = createFixture([
      { checkCallback: canRunFirst, id: 'unavailable', name: 'Unavailable' },
      { checkCallback: canRunSecond, id: 'available', name: 'Available' },
      { id: 'last', name: 'Last' }
    ]);
    expect(fixture.checkTrigger()).toBe(false);
    expect(canRunFirst.mock.calls).toEqual([[true]]);
    expect(canRunSecond.mock.calls).toEqual([[true], [false]]);
    expect(fixture.executed).toEqual(['available']);
    fixture.component.unload();
  });

  it('keeps ordinary callbacks and leaves a wholly unavailable binding unhandled', () => {
    const plain = createFixture([{ id: 'plain', name: 'Plain' }]);
    expect(plain.checkTrigger()).toBe(false);
    expect(plain.executed).toEqual(['plain']);
    plain.component.unload();
    const unavailable = createFixture([{ checkCallback: (): boolean => false, id: 'no', name: 'No' }]);
    expect(unavailable.checkTrigger()).toBe(true);
    expect(unavailable.executed).toEqual([]);
    unavailable.component.unload();
  });

  it('does not preflight programmatic or nested commands', () => {
    const canRunNested = vi.fn((): boolean => false);
    const nested = { checkCallback: canRunNested, id: 'nested', name: 'Nested' };
    const first = {
      callback: (): void => {
        fixture.app.commands.executeCommand(nested);
      },
      id: 'first',
      name: 'First'
    };
    const fixture = createFixture([first]);
    fixture.app.commands.executeCommand(nested);
    expect(canRunNested.mock.calls).toEqual([[false]]);
    canRunNested.mockClear();
    fixture.checkTrigger();
    expect(canRunNested.mock.calls).toEqual([[false]]);
    fixture.component.unload();
  });

  it('restores native dispatch on unload', () => {
    const fixture = createFixture([{ checkCallback: (): boolean => false, id: 'no', name: 'No' }]);
    fixture.component.unload();
    fixture.checkTrigger();
    expect(fixture.executed).toEqual(['no']);
  });

  it('reports a throwing candidate and tries the next command', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fixture = createFixture([
      {
        checkCallback: (): boolean => {
          throw new Error('broken check');
        },
        id: 'broken',
        name: 'Broken'
      },
      { id: 'next', name: 'Next' }
    ]);
    fixture.checkTrigger();
    expect(fixture.executed).toEqual(['next']);
    expect(log).toHaveBeenCalledOnce();
    fixture.component.unload();
    log.mockRestore();
  });

  it.each(['scope', 'commands'] as const)('leaves unsupported %s entry points alone', (missing) => {
    const app = castTo<App>({ commands: { executeCommand: undefined }, scope: { handleKey: undefined } });
    if (missing === 'commands') {
      app.scope.handleKey = (): boolean => false;
    }
    const component = new HotkeyFallbackComponent(app);
    component.load();
    expect(app.commands.executeCommand).toBeUndefined();
    component.unload();
  });
});
