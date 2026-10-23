import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { Dialog } from './Dialog';
import type { DialogProps } from './Dialog';

type Overrides = Partial<Omit<DialogProps, 'open' | 'onClose'>> & { children?: ReactNode };

/** Renders an opener button and a dialog wired to state, like real usage. */
function Harness({
  onClose,
  dialog = {},
}: {
  onClose?: (reason: string) => void;
  dialog?: Overrides;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        title="Edit profile"
        {...(dialog as object)}
        open={open}
        onClose={(reason) => {
          onClose?.(reason);
          setOpen(false);
        }}
      />
    </>
  );
}

async function openHarness(props: Parameters<typeof Harness>[0] = {}) {
  const utils = render(<Harness {...props} />);
  const opener = screen.getByRole('button', { name: 'Open' });
  await userEvent.click(opener);
  return { ...utils, opener };
}

const dialogElement = () => document.querySelector('dialog')!;

describe('Dialog: semantics', () => {
  it('is closed and hidden until opened', () => {
    render(<Harness />);
    expect(dialogElement()).not.toHaveAttribute('open');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a modal dialog named by its title and described by its description', async () => {
    await openHarness({ dialog: { description: 'Changes are saved to your account.' } });
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Changes are saved to your account.');
    expect(screen.getByRole('heading', { level: 2, name: 'Edit profile' })).toBeInTheDocument();
  });

  it('supports the alertdialog role', async () => {
    await openHarness({
      dialog: { role: 'alertdialog', title: 'Delete project?', description: 'This cannot be undone.' },
    });
    const dialog = screen.getByRole('alertdialog', { name: 'Delete project?' });
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('has a close button named "Close", which can be hidden', async () => {
    const { unmount } = await openHarness();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    unmount();
    await openHarness({ dialog: { hideCloseButton: true } });
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });
});

describe('Dialog: focus', () => {
  it('focuses initialFocusRef on open', async () => {
    function WithRef() {
      const [open, setOpen] = useState(false);
      const saveRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            title="Edit"
            initialFocusRef={saveRef}
            footer={<Button ref={saveRef}>Save</Button>}
          >
            <TextInput label="Name" />
          </Dialog>
        </>
      );
    }
    render(<WithRef />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });

  it('focuses the safe (non-destructive) action in an alert dialog by default', async () => {
    await openHarness({
      dialog: {
        role: 'alertdialog',
        title: 'Delete project?',
        description: 'This cannot be undone.',
        footer: (
          <>
            <Button variant="secondary">Cancel</Button>
            <Button tone="destructive">Delete</Button>
          </>
        ),
      },
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('focuses the first focusable element in the body', async () => {
    await openHarness({ dialog: { children: <TextInput label="Name" /> } });
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  });

  it('focuses the dialog itself when the body has nothing focusable', async () => {
    await openHarness({ dialog: { hideCloseButton: true, children: <p>Just text.</p> } });
    expect(dialogElement()).toHaveFocus();
  });

  it('returns focus to the opener on close', async () => {
    const { opener } = await openHarness();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialogElement()).not.toHaveAttribute('open');
    expect(opener).toHaveFocus();
  });

  it('returns focus to returnFocusRef when given', async () => {
    function WithReturn() {
      const [open, setOpen] = useState(false);
      const targetRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Button ref={targetRef}>Somewhere else</Button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Edit" returnFocusRef={targetRef} />
        </>
      );
    }
    render(<WithReturn />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('button', { name: 'Somewhere else' })).toHaveFocus();
  });
});

describe('Dialog: dismissal', () => {
  it('Escape (native cancel) calls onClose("escape") and prevents the native close', async () => {
    const onClose = vi.fn();
    await openHarness({ onClose });
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialogElement().dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledWith('escape');
    expect(dialogElement()).not.toHaveAttribute('open');
  });

  it('ignores Escape when closeOnEscape is false', async () => {
    const onClose = vi.fn();
    await openHarness({ onClose, dialog: { closeOnEscape: false } });
    act(() => {
      dialogElement().dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(dialogElement()).toHaveAttribute('open');
  });

  it('a backdrop click calls onClose("backdrop")', async () => {
    const onClose = vi.fn();
    await openHarness({ onClose });
    const dialog = dialogElement();
    // jsdom has no layout, so give the panel a rect and click outside it.
    dialog.getBoundingClientRect = () => DOMRect.fromRect({ x: 100, y: 100, width: 400, height: 300 });
    fireEvent.mouseDown(dialog, { clientX: 200, clientY: 200 });
    fireEvent.click(dialog, { clientX: 200, clientY: 200 });
    expect(onClose).not.toHaveBeenCalled(); // inside the panel
    fireEvent.mouseDown(dialog, { clientX: 5, clientY: 5 });
    fireEvent.click(dialog, { clientX: 5, clientY: 5 });
    expect(onClose).toHaveBeenCalledWith('backdrop');
  });

  it('does not close when a drag starts inside and ends on the backdrop', async () => {
    const onClose = vi.fn();
    await openHarness({ onClose, dialog: { children: <p>Select me</p> } });
    fireEvent.mouseDown(screen.getByText('Select me'), { clientX: 5, clientY: 5 });
    fireEvent.click(dialogElement(), { clientX: 5, clientY: 5 });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores backdrop clicks for alert dialogs and when disabled', async () => {
    const onClose = vi.fn();
    const { unmount } = await openHarness({
      onClose,
      dialog: { role: 'alertdialog', title: 'Sure?', description: 'Really.' },
    });
    fireEvent.mouseDown(dialogElement(), { clientX: 5, clientY: 5 });
    fireEvent.click(dialogElement(), { clientX: 5, clientY: 5 });
    unmount();
    await openHarness({ onClose, dialog: { closeOnBackdropClick: false } });
    fireEvent.mouseDown(dialogElement(), { clientX: 5, clientY: 5 });
    fireEvent.click(dialogElement(), { clientX: 5, clientY: 5 });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('the close button calls onClose("close-button")', async () => {
    const onClose = vi.fn();
    await openHarness({ onClose });
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledWith('close-button');
  });

  it('keeps the parent in sync if the browser force-closes the dialog', async () => {
    const onClose = vi.fn();
    await openHarness({ onClose });
    act(() => {
      dialogElement().close();
    });
    expect(onClose).toHaveBeenCalledWith('escape');
  });
});

describe('Dialog: page effects', () => {
  it('locks page scrolling while open and restores it on close', async () => {
    document.documentElement.style.overflow = 'auto';
    await openHarness();
    expect(document.documentElement.style.overflow).toBe('hidden');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.documentElement.style.overflow).toBe('auto');
    document.documentElement.style.overflow = '';
  });

  it('applies the size', async () => {
    await openHarness({ dialog: { size: 'lg' } });
    expect(dialogElement()).toHaveAttribute('data-size', 'lg');
  });
});

describe('Dialog: axe', () => {
  it('an open dialog has no axe violations', async () => {
    await openHarness({
      dialog: {
        description: 'Update your details.',
        children: <TextInput label="Name" />,
        footer: <Button>Save</Button>,
      },
    });
    await expectNoA11yViolations(document.body);
  });

  it('an open alert dialog has no axe violations', async () => {
    await openHarness({
      dialog: {
        role: 'alertdialog',
        title: 'Delete project?',
        description: 'This cannot be undone.',
        footer: (
          <>
            <Button variant="secondary">Cancel</Button>
            <Button tone="destructive">Delete</Button>
          </>
        ),
      },
    });
    await expectNoA11yViolations(document.body);
  });
});
