import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('is named by its visible label', () => {
    render(<TextInput label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('focuses the input when the label is clicked', async () => {
    render(<TextInput label="Email" />);
    await userEvent.click(screen.getByText('Email'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('describes the input with helper text', () => {
    render(<TextInput label="Email" helperText="We'll never share it" />);
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription("We'll never share it");
  });

  it('marks the input invalid and describes the error, error first', () => {
    render(<TextInput label="Email" helperText="Work email" error="Enter a valid email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email Work email');
  });

  it('clears the invalid state when the error is removed', () => {
    const { rerender } = render(<TextInput label="Email" error="Bad" />);
    rerender(<TextInput label="Email" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('announces required once: native attribute, hidden visual mark', () => {
    render(<TextInput label="Name" required />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports disabled and read-only', async () => {
    render(
      <>
        <TextInput label="Disabled" disabled />
        <TextInput label="Read only" readOnly defaultValue="Fixed" />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();
    const readOnly = screen.getByRole('textbox', { name: 'Read only' });
    await userEvent.type(readOnly, 'x');
    expect(readOnly).toHaveValue('Fixed');
  });

  it('passes native attributes and forwards refs', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput ref={ref} label="Email" type="email" autoComplete="email" name="email" />);
    expect(ref.current).toHaveAttribute('autocomplete', 'email');
    expect(ref.current).toHaveAttribute('type', 'email');
  });

  it('keeps the label even with a placeholder', () => {
    render(<TextInput label="Search" placeholder="Try 'buttons'" />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it.each([
    ['default', {}],
    ['helper', { helperText: 'Hint' }],
    ['error', { error: 'Problem' }],
    ['required', { required: true }],
    ['disabled', { disabled: true }],
    ['read-only', { readOnly: true }],
  ])('%s state has no axe violations', async (_name, props) => {
    const { container } = render(<TextInput label="Field" {...props} />);
    await expectNoA11yViolations(container);
  });
});
