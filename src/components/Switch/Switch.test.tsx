import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Switch } from './Switch';

describe('Switch', () => {
  it('is a native checkbox exposed with the switch role and a label name', () => {
    render(<Switch label="Dark mode" />);
    const control = screen.getByRole('switch', { name: 'Dark mode' });
    expect(control.tagName).toBe('INPUT');
    expect(control).toHaveAttribute('type', 'checkbox');
  });

  it('exposes its checked state', () => {
    render(<Switch label="Dark mode" defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('toggles with Space, not required to use Enter', async () => {
    const onChange = vi.fn();
    render(<Switch label="Dark mode" onChange={onChange} />);
    screen.getByRole('switch').focus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('switch')).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles when the label or description is clicked', async () => {
    render(<Switch label="Dark mode" description="Applies immediately" />);
    const control = screen.getByRole('switch');
    await userEvent.click(screen.getByText('Dark mode'));
    expect(control).toBeChecked();
    await userEvent.click(screen.getByText('Applies immediately'));
    expect(control).not.toBeChecked();
  });

  it('describes itself with the description', () => {
    render(<Switch label="Dark mode" description="Applies immediately" />);
    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Applies immediately');
  });

  it('works controlled', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <>
          <Switch label="Alerts" checked={on} onChange={(event) => setOn(event.target.checked)} />
          <output>{on ? 'on' : 'off'}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('status')).toHaveTextContent('on');
  });

  it('submits its value with native forms', () => {
    render(
      <form data-testid="form">
        <Switch label="Alerts" name="alerts" defaultChecked />
        <Switch label="Digest" name="digest" />
      </form>,
    );
    const data = new FormData(screen.getByTestId('form') as HTMLFormElement);
    expect(data.get('alerts')).toBe('on');
    expect(data.has('digest')).toBe(false);
  });

  it('marks errors and required state', () => {
    render(<Switch label="Terms" required error="Turn this on to continue" />);
    const control = screen.getByRole('switch');
    expect(control).toBeRequired();
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription('Turn this on to continue');
  });

  it('can be disabled', async () => {
    render(<Switch label="Locked" disabled />);
    const control = screen.getByRole('switch');
    expect(control).toBeDisabled();
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it('forwards the ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} label="Dark mode" />);
    expect(ref.current).toBe(screen.getByRole('switch'));
  });

  it.each([
    ['off', {}],
    ['on', { defaultChecked: true }],
    ['description', { description: 'More detail' }],
    ['error', { error: 'Problem' }],
    ['required', { required: true }],
    ['disabled off', { disabled: true }],
    ['disabled on', { disabled: true, defaultChecked: true }],
  ])('%s state has no axe violations', async (_name, props) => {
    const { container } = render(<Switch label="Setting" {...props} />);
    await expectNoA11yViolations(container);
  });
});
