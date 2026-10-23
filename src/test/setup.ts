import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);
afterEach(() => cleanup());

// jsdom doesn't implement scrolling APIs.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();

// jsdom has no CSS.escape; user-event needs it to move between radio buttons.
if (typeof window.CSS?.escape !== 'function') {
  const escape = (value: string) => value.replace(/([^\w-])/g, '\\$1');
  const css = { ...(window.CSS ?? {}), escape } as typeof CSS;
  for (const target of [window, globalThis]) {
    Object.defineProperty(target, 'CSS', { configurable: true, value: css });
  }
}

// jsdom has <dialog> but not showModal()/close(). Minimal stand-in: real
// inertness and top-layer behaviour are checked in a browser.
const dialogProto = window.HTMLDialogElement?.prototype;
if (dialogProto && typeof dialogProto.showModal !== 'function') {
  dialogProto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  dialogProto.show = dialogProto.showModal;
  dialogProto.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event('close'));
  };
}
