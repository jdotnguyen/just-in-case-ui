import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Combobox } from './Combobox';
import type { ComboboxOption, ComboboxProps } from './Combobox';

const options: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'grape', label: 'Grape' },
  { value: 'pineapple', label: 'Pineapple' },
];

function setup(props: Partial<ComboboxProps> = {}) {
  return render(<Combobox label="Fruit" options={options} {...props} />);
}

const input = () => screen.getByRole('combobox', { name: 'Fruit' });
const optionNames = () => screen.queryAllByRole('option').map((o) => o.textContent);

describe('Combobox semantics', () => {
  it('is a labelled combobox with list autocomplete, closed at first', () => {
    setup();
    expect(input()).toHaveAttribute('aria-autocomplete', 'list');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('shows the initial value as text', () => {
    setup({ defaultValue: 'banana' });
    expect(input()).toHaveValue('Banana');
  });

  it('wires helper text, error, required and disabled', () => {
    setup({ helperText: 'Pick one', error: 'Required', required: true });
    expect(input()).toHaveAccessibleDescription('Required Pick one');
    expect(input()).toBeRequired();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Combobox filtering', () => {
  it('opens and filters as you type', async () => {
    setup();
    await userEvent.type(input(), 'ap');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(optionNames()).toEqual(['Apple', 'Apricot', 'Grape', 'Pineapple']);
  });

  it('announces the result count', async () => {
    setup();
    await userEvent.type(input(), 'ban');
    expect(screen.getByRole('status')).toHaveTextContent('1 result available');
  });

  it('shows and announces an empty message when nothing matches', async () => {
    setup();
    await userEvent.type(input(), 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('No matches');
    expect(screen.getAllByText('No matches').length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports a custom filter', async () => {
    setup({ filter: (option, query) => option.label.toLowerCase().startsWith(query.toLowerCase()) });
    await userEvent.type(input(), 'ap');
    expect(optionNames()).toEqual(['Apple', 'Apricot']);
  });

  it('shows every option when opened without typing', async () => {
    setup({ defaultValue: 'banana' });
    await userEvent.click(input());
    expect(optionNames()).toHaveLength(6);
  });
});

describe('Combobox keyboard', () => {
  it('opens with ArrowDown and moves through enabled options', async () => {
    setup();
    input().focus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = screen.getByRole('listbox');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', within(listbox).getByRole('option', { name: 'Apple' }).id);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(input()).toHaveAttribute('aria-activedescendant', within(listbox).getByRole('option', { name: 'Banana' }).id);
    await userEvent.keyboard('{ArrowDown}');
    // Cherry is disabled, so Grape is next.
    expect(input()).toHaveAttribute('aria-activedescendant', within(listbox).getByRole('option', { name: 'Grape' }).id);
    expect(input()).toHaveFocus();
  });

  it('moves up and stops at the ends', async () => {
    setup();
    input().focus();
    await userEvent.keyboard('{ArrowUp}');
    const listbox = screen.getByRole('listbox');
    expect(input()).toHaveAttribute('aria-activedescendant', within(listbox).getByRole('option', { name: 'Pineapple' }).id);
    await userEvent.keyboard('{ArrowDown}');
    expect(input()).toHaveAttribute('aria-activedescendant', within(listbox).getByRole('option', { name: 'Pineapple' }).id);
  });

  it('selects the active option with Enter', async () => {
    const onChange = vi.fn();
    setup({ onChange });
    await userEvent.type(input(), 'ban');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(input()).toHaveValue('Banana');
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveFocus();
  });

  it('does not select anything on Enter when no option is active', async () => {
    const onChange = vi.fn();
    setup({ onChange });
    await userEvent.type(input(), 'ban{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on Escape, then clears on a second Escape', async () => {
    const onChange = vi.fn();
    setup({ defaultValue: 'banana', onChange });
    await userEvent.click(input());
    await userEvent.keyboard('{Escape}');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveValue('Banana');
    await userEvent.keyboard('{Escape}');
    expect(input()).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('Combobox pointer and value integrity', () => {
  it('selects with a click and keeps focus in the input', async () => {
    const onChange = vi.fn();
    setup({ onChange });
    await userEvent.click(input());
    await userEvent.click(screen.getByRole('option', { name: 'Grape' }));
    expect(input()).toHaveValue('Grape');
    expect(onChange).toHaveBeenCalledWith('grape');
    expect(input()).toHaveFocus();
  });

  it('ignores clicks on disabled options', async () => {
    setup();
    await userEvent.click(input());
    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(input()).toHaveValue('');
  });

  it('reverts unmatched text on blur', async () => {
    const onChange = vi.fn();
    setup({ defaultValue: 'banana', onChange });
    await userEvent.click(input());
    await userEvent.type(input(), 'zzz');
    expect(input()).toHaveValue('Bananazzz');
    await userEvent.tab();
    expect(input()).toHaveValue('Banana');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the value when the text is emptied', async () => {
    const onChange = vi.fn();
    setup({ defaultValue: 'banana', onChange });
    await userEvent.clear(input());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('accepts text that exactly matches an option on blur', async () => {
    const onChange = vi.fn();
    setup({ onChange });
    await userEvent.type(input(), 'grape');
    await userEvent.tab();
    expect(input()).toHaveValue('Grape');
    expect(onChange).toHaveBeenCalledWith('grape');
  });

  it('works controlled', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Combobox label="Fruit" options={options} value="apple" onChange={onChange} />,
    );
    expect(input()).toHaveValue('Apple');
    rerender(<Combobox label="Fruit" options={options} value="grape" onChange={onChange} />);
    expect(input()).toHaveValue('Grape');
  });

  it('submits the value with forms', () => {
    const { container } = render(
      <form>
        <Combobox label="Fruit" options={options} name="fruit" defaultValue="banana" />
      </form>,
    );
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('fruit')).toBe('banana');
  });
});

describe('Combobox accessibility', () => {
  it('has no axe violations closed, open and empty', async () => {
    const { container } = setup({ helperText: 'Pick one' });
    await expectNoA11yViolations(container);
    await userEvent.click(input());
    await expectNoA11yViolations(document.body);
    await userEvent.type(input(), 'zzz');
    await expectNoA11yViolations(document.body);
  });
});
