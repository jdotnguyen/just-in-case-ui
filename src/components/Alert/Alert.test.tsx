import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Alert } from './Alert';
import type { AlertTone } from './Alert';

const tones: AlertTone[] = ['info', 'success', 'warning', 'danger'];

describe('Alert', () => {
  it('shows the title and message', () => {
    render(
      <Alert title="Heads up">Your trial ends tomorrow.</Alert>,
    );
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Your trial ends tomorrow.')).toBeInTheDocument();
  });

  it('is not a live region by default', () => {
    const { container } = render(<Alert tone="danger">Broke</Alert>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['danger', 'alert'],
    ['warning', 'alert'],
    ['info', 'status'],
    ['success', 'status'],
  ] as const)('uses role %s -> %s when live', (tone, role) => {
    render(
      <Alert tone={tone} live>
        Message
      </Alert>,
    );
    expect(screen.getByRole(role)).toHaveTextContent('Message');
  });

  it('calls the action', async () => {
    const onClick = vi.fn();
    render(
      <Alert action={{ label: 'Try again', onClick }}>Upload failed</Alert>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('dismisses with a labelled button, only when asked', async () => {
    const { rerender } = render(<Alert>Hi</Alert>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    const onDismiss = vi.fn();
    rerender(<Alert onDismiss={onDismiss}>Hi</Alert>);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it.each(tones)('has no axe violations (%s)', async (tone) => {
    const { container } = render(
      <Alert
        tone={tone}
        title="Title"
        action={{ label: 'Undo', onClick: () => {} }}
        onDismiss={() => {}}
        live
      >
        Something happened.
      </Alert>,
    );
    await expectNoA11yViolations(container);
  });
});
