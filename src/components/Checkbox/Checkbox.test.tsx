import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Checkbox, CheckboxGroup } from './Checkbox';

describe('Checkbox', () => {
  it('is a native checkbox named by its visible label', () => {
    render(<Checkbox label="Email me updates" />);
    const box = screen.getByRole('checkbox', { name: 'Email me updates' });
    expect(box.tagName).toBe('INPUT');
    expect(box).toHaveAttribute('type', 'checkbox');
  });

  it('toggles when the label is clicked', async () => {
    render(<Checkbox label="Email me updates" />);
    await userEvent.click(screen.getByText('Email me updates'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('toggles when the description is clicked, and is described by it', async () => {
    render(<Checkbox label="Weekly digest" description="One email every Monday." />);
    const box = screen.getByRole('checkbox', { name: 'Weekly digest' });
    expect(box).toHaveAccessibleDescription('One email every Monday.');
    await userEvent.click(screen.getByText('One email every Monday.'));
    expect(box).toBeChecked();
  });

  it('toggles with Space and calls onChange', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" onChange={onChange} />);
    await userEvent.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled use', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(true);
      return (
        <Checkbox label="Notify" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      );
    }
    render(<Controlled />);
    const box = screen.getByRole('checkbox');
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });

  it('sets and clears the indeterminate (mixed) state', () => {
    const { rerender } = render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(box).toBePartiallyChecked();
    rerender(<Checkbox label="Select all" indeterminate={false} />);
    expect(box.indeterminate).toBe(false);
  });

  it('is required natively, with a visual-only mark', () => {
    render(
      <form>
        <Checkbox label="I accept the terms" required />
      </form>,
    );
    expect(screen.getByRole('checkbox')).toBeRequired();
    expect(document.querySelector('form')!.checkValidity()).toBe(false);
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('describes errors and marks itself invalid', () => {
    render(<Checkbox label="I accept the terms" error="You must accept the terms" />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('You must accept the terms');
  });

  it('can be disabled', async () => {
    render(<Checkbox label="Locked" disabled description="Ask an admin." />);
    const box = screen.getByRole('checkbox');
    expect(box).toBeDisabled();
    await userEvent.click(screen.getByText('Ask an admin.'));
    expect(box).not.toBeChecked();
  });

  it('submits its value and forwards refs', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <form>
        <Checkbox ref={ref} label="News" name="news" value="yes" defaultChecked />
      </form>,
    );
    expect(ref.current).toBe(screen.getByRole('checkbox'));
    expect(new FormData(document.querySelector('form')!).get('news')).toBe('yes');
  });

  it.each([
    ['default', {}],
    ['checked', { defaultChecked: true }],
    ['indeterminate', { indeterminate: true }],
    ['description', { description: 'More detail' }],
    ['required', { required: true }],
    ['error', { error: 'Problem' }],
    ['disabled', { disabled: true }],
  ])('%s state has no axe violations', async (_name, props) => {
    const { container } = render(<Checkbox label="Option" {...props} />);
    await expectNoA11yViolations(container);
  });
});

describe('CheckboxGroup', () => {
  function Toppings(props: Partial<ComponentProps<typeof CheckboxGroup>>) {
    return (
      <CheckboxGroup legend="Toppings" {...props}>
        <Checkbox label="Cheese" name="toppings" value="cheese" />
        <Checkbox label="Mushrooms" name="toppings" value="mushrooms" />
        <Checkbox label="Olives" name="toppings" value="olives" />
      </CheckboxGroup>
    );
  }

  it('is a group named by its legend', () => {
    render(<Toppings />);
    const group = screen.getByRole('group', { name: 'Toppings' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group.querySelectorAll('input[type=checkbox]')).toHaveLength(3);
  });

  it('describes the group with helper text and error, and marks every checkbox invalid', () => {
    render(<Toppings helperText="Pick as many as you like." error="Choose at least one topping" />);
    const group = screen.getByRole('group', { name: 'Toppings' });
    expect(group).toHaveAccessibleDescription(
      'Choose at least one topping Pick as many as you like.',
    );
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).toHaveAttribute('aria-invalid', 'true');
    }
  });

  it('disables every checkbox when disabled', () => {
    render(<Toppings disabled />);
    for (const box of screen.getAllByRole('checkbox')) expect(box).toBeDisabled();
  });

  it.each([
    ['default', {}],
    ['horizontal', { orientation: 'horizontal' as const }],
    ['error', { error: 'Choose one' }],
    ['required', { required: true }],
    ['disabled', { disabled: true }],
  ])('%s group has no axe violations', async (_name, props) => {
    const { container } = render(<Toppings {...props} />);
    await expectNoA11yViolations(container);
  });
});
