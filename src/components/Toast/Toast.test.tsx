import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { ToastProvider, useToast } from './Toast';
import type { ToastApi, ToastOptions } from './Toast';

let api: ToastApi;

function Capture() {
  api = useToast();
  return null;
}

function setup() {
  return render(
    <ToastProvider>
      <Capture />
      <button type="button">Page button</button>
    </ToastProvider>,
  );
}

function show(options: ToastOptions) {
  let id = '';
  act(() => {
    id = api.toast(options);
  });
  return id;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast live regions', () => {
  it('renders a labelled area with both live regions before any toast', () => {
    setup();
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('puts info and success toasts in the polite region', () => {
    setup();
    show({ title: 'Saved' });
    show({ title: 'Sent', tone: 'success' });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Saved');
    expect(status).toHaveTextContent('Sent');
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('puts danger toasts in the assertive region', () => {
    setup();
    show({ title: 'Upload failed', tone: 'danger' });
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('shows the description', () => {
    setup();
    show({ title: 'Saved', description: 'All changes are stored.' });
    expect(screen.getByText('All changes are stored.')).toBeInTheDocument();
  });
});

describe('Toast timing', () => {
  it('dismisses info toasts after the default time', () => {
    vi.useFakeTimers();
    setup();
    show({ title: 'Saved' });
    act(() => {
      vi.advanceTimersByTime(5900);
    });
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('keeps danger toasts and toasts with actions until dismissed', () => {
    vi.useFakeTimers();
    setup();
    show({ title: 'Broke', tone: 'danger' });
    show({ title: 'Deleted', action: { label: 'Undo', onClick: () => {} } });
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getByText('Broke')).toBeInTheDocument();
    expect(screen.getByText('Deleted')).toBeInTheDocument();
  });

  it('honours a custom duration and null', () => {
    vi.useFakeTimers();
    setup();
    show({ title: 'Quick', duration: 1000 });
    show({ title: 'Sticky', duration: null });
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
    expect(screen.getByText('Sticky')).toBeInTheDocument();
  });

  it('pauses while hovered and restarts the full time after', () => {
    vi.useFakeTimers();
    setup();
    show({ title: 'Saved', duration: 1000 });
    const toast = screen.getByText('Saved').closest('[data-tone]')!;
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.pointerEnter(toast);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.pointerLeave(toast);
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });
});

describe('Toast interaction', () => {
  it('dismisses with the labelled button', async () => {
    setup();
    show({ title: 'Saved', duration: null });
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('runs the action then dismisses', async () => {
    const onClick = vi.fn();
    setup();
    show({ title: 'Deleted', action: { label: 'Undo', onClick } });
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Deleted')).not.toBeInTheDocument();
  });

  it('dismisses with Escape while focus is inside and returns focus', async () => {
    setup();
    const pageButton = screen.getByRole('button', { name: 'Page button' });
    show({ title: 'Saved', duration: null });
    pageButton.focus();
    await userEvent.tab(); // into the toast: its dismiss button is the next stop
    const dismiss = screen.getByRole('button', { name: 'Dismiss notification' });
    expect(dismiss).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(pageButton).toHaveFocus();
  });

  it('dismisses by id', () => {
    setup();
    const id = show({ title: 'Saved', duration: null });
    act(() => api.dismiss(id));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('keeps at most five, dropping the oldest', () => {
    setup();
    for (let i = 1; i <= 6; i += 1) show({ title: `Toast ${i}`, duration: null });
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 6')).toBeInTheDocument();
  });
});

describe('useToast', () => {
  it('explains itself when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Capture />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe('Toast accessibility', () => {
  it('has no axe violations with every tone', async () => {
    setup();
    show({ title: 'Info', description: 'Details', duration: null });
    show({ title: 'Done', tone: 'success', duration: null });
    show({ title: 'Failed', tone: 'danger', action: { label: 'Retry', onClick: () => {} } });
    await expectNoA11yViolations(document.body);
  });
});
