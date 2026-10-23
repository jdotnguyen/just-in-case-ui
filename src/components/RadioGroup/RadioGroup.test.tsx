import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { RadioGroup } from './RadioGroup';
import type { RadioOption } from './RadioGroup';

const delivery: RadioOption[] = [
  { value: 'standard', label: 'Standard', description: 'Arrives in 5–7 days' },
  { value: 'express', label: 'Express', description: 'Arrives in 2 days' },
  { value: 'overnight', label: 'Overnight', disabled: true },
  { value: 'pickup', label: 'Pick up in store' },
];

function setup(props: Partial<ComponentProps<typeof RadioGroup>> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <>
      <button type="button">Before</button>
      <RadioGroup legend="Delivery" options={delivery} onChange={onChange} {...props} />
      <button type="button">After</button>
    </>,
  );
  return { ...utils, onChange, group: screen.getByRole('radiogroup', { name: 'Delivery' }) };
}

describe('RadioGroup', () => {
  it('is a radiogroup named by its legend, containing native radios', () => {
    const { group } = setup();
    expect(group.tagName).toBe('FIELDSET');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(radios[0]).toHaveAccessibleName('Standard');
  });

  it('shares one generated name across options', () => {
    setup();
    const names = new Set(screen.getAllByRole('radio').map((r) => r.getAttribute('name')));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it('uses a given name', () => {
    setup({ name: 'delivery' });
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('name', 'delivery');
  });

  it('describes options with their description', () => {
    setup();
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveAccessibleDescription(
      'Arrives in 2 days',
    );
  });

  it('is a single Tab stop that lands on the selected radio', async () => {
    setup({ defaultValue: 'express' });
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('arrow keys select the next enabled option and call onChange', async () => {
    const { onChange } = setup({ defaultValue: 'express' });
    screen.getByRole('radio', { name: 'Express' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    const pickup = screen.getByRole('radio', { name: 'Pick up in store' });
    expect(pickup).toBeChecked();
    expect(pickup).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('pickup');
  });

  it('selects on label and description click', async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByText('Standard'));
    expect(onChange).toHaveBeenLastCalledWith('standard');
    await userEvent.click(screen.getByText('Arrives in 2 days'));
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('express');
  });

  it('does not select disabled options', async () => {
    const { onChange } = setup();
    const overnight = screen.getByRole('radio', { name: 'Overnight' });
    expect(overnight).toBeDisabled();
    await userEvent.click(screen.getByText('Overnight'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('follows the value prop when controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('standard');
      return (
        <>
          <RadioGroup legend="Delivery" options={delivery} value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('radio', { name: 'Pick up in store' }));
    expect(screen.getByRole('status')).toHaveTextContent('pickup');
    expect(screen.getByRole('radio', { name: 'Pick up in store' })).toBeChecked();
  });

  it('blocks form submission when required and empty', () => {
    render(
      <form>
        <RadioGroup legend="Delivery" options={delivery} required />
      </form>,
    );
    expect(document.querySelector('form')!.checkValidity()).toBe(false);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
  });

  it('submits the selected value', () => {
    render(
      <form>
        <RadioGroup legend="Delivery" name="delivery" options={delivery} defaultValue="pickup" />
      </form>,
    );
    expect(new FormData(document.querySelector('form')!).get('delivery')).toBe('pickup');
  });

  it('marks the group invalid and describes the error', () => {
    const { group } = setup({ error: 'Choose a delivery option', helperText: 'Free over $50.' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAccessibleDescription('Choose a delivery option Free over $50.');
  });

  it('disables every option when the group is disabled', () => {
    setup({ disabled: true });
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it.each([
    ['default', {}],
    ['preselected', { defaultValue: 'express' }],
    ['horizontal', { orientation: 'horizontal' as const }],
    ['required', { required: true }],
    ['error', { error: 'Choose one' }],
    ['disabled', { disabled: true }],
  ])('%s state has no axe violations', async (_name, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
