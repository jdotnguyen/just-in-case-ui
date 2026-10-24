import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { PasswordInput } from './PasswordInput';

const input = () => screen.getByLabelText(/^Password/);
const toggle = () => screen.getByRole('button', { name: 'Show password' });

describe('PasswordInput', () => {
  it('is a labelled password field with a sensible autocomplete', () => {
    render(<PasswordInput label="Password" />);
    expect(input()).toHaveAttribute('type', 'password');
    expect(input()).toHaveAttribute('autocomplete', 'current-password');
  });

  it('lets the autocomplete be changed', () => {
    render(<PasswordInput label="Password" autoComplete="new-password" />);
    expect(input()).toHaveAttribute('autocomplete', 'new-password');
  });

  it('starts hidden with the toggle not pressed', () => {
    render(<PasswordInput label="Password" />);
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });

  it('reveals and hides the password without moving focus or changing the value', async () => {
    render(<PasswordInput label="Password" />);
    await userEvent.type(input(), 'hunter2');
    await userEvent.click(toggle());
    expect(input()).toHaveAttribute('type', 'text');
    expect(input()).toHaveValue('hunter2');
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
    expect(toggle()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(input()).toHaveAttribute('type', 'password');
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables the toggle when the input is disabled', () => {
    render(<PasswordInput label="Password" disabled />);
    expect(toggle()).toBeDisabled();
  });

  it('wires helper text, error and required like TextInput', () => {
    render(<PasswordInput label="Password" helperText="At least 12 characters" error="Too short" required />);
    expect(input()).toHaveAccessibleDescription('Too short At least 12 characters');
    expect(input()).toBeRequired();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards refs', () => {
    let node: HTMLInputElement | null = null;
    render(
      <PasswordInput
        label="Password"
        ref={(element) => {
          node = element;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLInputElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<PasswordInput label="Password" helperText="Hint" />);
    await expectNoA11yViolations(container);
    await userEvent.click(toggle());
    await expectNoA11yViolations(container);
  });
});
