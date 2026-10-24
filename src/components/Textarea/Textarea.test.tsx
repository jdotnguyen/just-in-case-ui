import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('is named by its visible label and focuses on label click', async () => {
    render(<Textarea label="Bio" />);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    await userEvent.click(screen.getByText('Bio'));
    expect(textarea).toHaveFocus();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('defaults to three rows', () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('describes the field with the error first, then helper text', () => {
    render(<Textarea label="Bio" helperText="Optional" error="Tell us a little more" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('Tell us a little more Optional');
  });

  it('marks required natively and hides the visual mark from assistive tech', () => {
    render(<Textarea label="Bio" required />);
    expect(screen.getByRole('textbox', { name: 'Bio' })).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows a counter that is part of the description (uncontrolled)', async () => {
    render(<Textarea label="Bio" maxLength={20} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAccessibleDescription('0 / 20');
    await userEvent.type(textarea, 'Hello');
    expect(textarea).toHaveAccessibleDescription('5 / 20');
  });

  it('follows the value when controlled', () => {
    render(<Textarea label="Bio" maxLength={20} value="Hello there" onChange={() => {}} />);
    expect(screen.getByText('11 / 20')).toBeInTheDocument();
  });

  it('counter is not a live region', () => {
    render(<Textarea label="Bio" maxLength={20} />);
    expect(screen.getByText('0 / 20')).not.toHaveAttribute('aria-live');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stops typing at maxLength', async () => {
    render(<Textarea label="Bio" maxLength={3} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'abcdef');
    expect(textarea).toHaveValue('abc');
  });

  it('supports disabled and read-only', async () => {
    render(
      <>
        <Textarea label="Off" disabled />
        <Textarea label="Locked" readOnly defaultValue="Fixed" />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Off' })).toBeDisabled();
    const locked = screen.getByRole('textbox', { name: 'Locked' });
    await userEvent.type(locked, 'x');
    expect(locked).toHaveValue('Fixed');
  });

  it('forwards the ref and native attributes', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} label="Bio" name="bio" autoComplete="off" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toHaveAttribute('name', 'bio');
  });

  it.each([
    ['default', {}],
    ['helper', { helperText: 'Hint' }],
    ['error', { error: 'Problem' }],
    ['required', { required: true }],
    ['counter', { maxLength: 100 }],
    ['disabled', { disabled: true }],
    ['read-only', { readOnly: true }],
  ])('%s state has no axe violations', async (_name, props) => {
    const { container } = render(<Textarea label="Field" {...props} />);
    await expectNoA11yViolations(container);
  });
});
