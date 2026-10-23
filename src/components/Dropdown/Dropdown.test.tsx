import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';

const fruits: DropdownOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'grape', label: 'Grape' },
];

const many: DropdownOption[] = Array.from({ length: 30 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i}`,
}));

function setup(props: Partial<ComponentProps<typeof Dropdown>> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <>
      <Dropdown label="Fruit" options={fruits} onChange={onChange} {...props} />
      <button type="button">After</button>
    </>,
  );
  const combobox = screen.getByRole('combobox', { name: 'Fruit' });
  const listbox = () => screen.getByRole('listbox', { hidden: true });
  const active = () => {
    const id = combobox.getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : null;
  };
  return { ...utils, onChange, combobox, listbox, active };
}

async function focusAndPress(element: HTMLElement, keys: string) {
  element.focus();
  await userEvent.keyboard(keys);
}

describe('Dropdown: semantics', () => {
  it('renders a closed combobox linked to a listbox', () => {
    const { combobox, listbox } = setup();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    expect(combobox).toHaveAttribute('aria-controls', listbox().id);
    expect(combobox).toHaveTextContent('Select an option');
    expect(listbox()).not.toBeVisible();
  });

  it('shows the selected label when a value is set', () => {
    const { combobox } = setup({ defaultValue: 'banana' });
    expect(combobox).toHaveTextContent('Banana');
  });

  it('opens on click and marks the selected option', async () => {
    const { combobox } = setup({ defaultValue: 'banana' });
    await userEvent.click(combobox);
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
  });

  it('describes errors and helper text', () => {
    const { combobox } = setup({ error: 'Pick one', helperText: 'Any fruit' });
    expect(combobox).toHaveAttribute('aria-invalid', 'true');
    expect(combobox).toHaveAccessibleDescription('Pick one Any fruit');
  });
});

describe('Dropdown: keyboard when closed', () => {
  it.each(['{ArrowDown}', '{Enter}', ' ', '{ArrowUp}', '{Alt>}{ArrowDown}{/Alt}'])(
    '%s opens with the selected (or first) option active',
    async (keys) => {
      const { combobox, active } = setup({ defaultValue: 'blueberry' });
      await focusAndPress(combobox, keys);
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      expect(active()).toBe('Blueberry');
    },
  );

  it('opens to the first option when nothing is selected', async () => {
    const { combobox, active } = setup();
    await focusAndPress(combobox, '{ArrowDown}');
    expect(active()).toBe('Apple');
  });

  it('Home and End open to the first / last enabled option', async () => {
    const { combobox, active } = setup();
    await focusAndPress(combobox, '{End}');
    expect(active()).toBe('Grape');
    await userEvent.keyboard('{Escape}{Home}');
    expect(active()).toBe('Apple');
  });

  it('type-ahead opens and jumps to a match', async () => {
    const { combobox, active } = setup();
    await focusAndPress(combobox, 'g');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('Grape');
  });
});

describe('Dropdown: keyboard when open', () => {
  it('arrows move between enabled options, skipping disabled, without wrapping', async () => {
    const { combobox, active } = setup();
    await focusAndPress(combobox, '{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Blueberry');
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('Grape'); // Cherry is disabled
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('Grape'); // no wrap
    await userEvent.keyboard('{Home}{ArrowUp}');
    expect(active()).toBe('Apple'); // no wrap
  });

  it('keeps DOM focus on the combobox', async () => {
    const { combobox } = setup();
    await focusAndPress(combobox, '{ArrowDown}{ArrowDown}');
    expect(combobox).toHaveFocus();
  });

  it('Page Down / Page Up move by ten', async () => {
    render(<Dropdown label="Items" options={many} />);
    const combobox = screen.getByRole('combobox');
    await focusAndPress(combobox, '{ArrowDown}{PageDown}');
    expect(document.getElementById(combobox.getAttribute('aria-activedescendant')!)).toHaveTextContent(
      'Item 10',
    );
    await userEvent.keyboard('{PageUp}');
    expect(document.getElementById(combobox.getAttribute('aria-activedescendant')!)).toHaveTextContent(
      'Item 0',
    );
  });

  it('Enter selects, closes and keeps focus', async () => {
    const { combobox, onChange } = setup();
    await focusAndPress(combobox, '{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveTextContent('Banana');
    expect(combobox).toHaveFocus();
  });

  it('Space selects', async () => {
    const { combobox, onChange } = setup();
    await focusAndPress(combobox, '{ArrowDown} ');
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('Tab selects and moves focus on', async () => {
    const { combobox, onChange } = setup();
    await focusAndPress(combobox, '{ArrowDown}{ArrowDown}');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('Escape closes without changing the value', async () => {
    const { combobox, onChange } = setup({ defaultValue: 'apple' });
    await focusAndPress(combobox, '{ArrowDown}{ArrowDown}{Escape}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
    expect(combobox).toHaveTextContent('Apple');
    expect(combobox).toHaveFocus();
  });

  it('type-ahead matches strings and cycles on repeated characters', async () => {
    const { combobox, active } = setup();
    await focusAndPress(combobox, '{ArrowDown}');
    await userEvent.keyboard('bl');
    expect(active()).toBe('Blueberry');
    await act(() => new Promise((resolve) => setTimeout(resolve, 600))); // buffer resets after 500ms
    await userEvent.keyboard('b');
    expect(active()).toBe('Banana');
    await userEvent.keyboard('b');
    expect(active()).toBe('Blueberry');
  });

  it('only calls onChange for a different value', async () => {
    const { combobox, onChange } = setup({ defaultValue: 'apple' });
    await focusAndPress(combobox, '{ArrowDown}{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Dropdown: pointer', () => {
  it('selects a clicked option and returns focus', async () => {
    const { combobox, onChange } = setup();
    await userEvent.click(combobox);
    await userEvent.click(screen.getByRole('option', { name: 'Grape' }));
    expect(onChange).toHaveBeenCalledWith('grape');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveFocus();
  });

  it('ignores clicks on disabled options', async () => {
    const { combobox, onChange } = setup();
    await userEvent.click(combobox);
    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on outside click without changing the value', async () => {
    const { combobox, onChange } = setup();
    await userEvent.click(combobox);
    await userEvent.click(document.body);
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Dropdown: inside a modal dialog', () => {
  it('renders its listbox inside the dialog, not in the inert page behind it', async () => {
    render(
      <dialog open>
        <Dropdown label="Fruit" options={fruits} />
      </dialog>,
    );
    const combobox = screen.getByRole('combobox');
    await focusAndPress(combobox, '{ArrowDown}');
    expect(document.querySelector('dialog')).toContainElement(screen.getByRole('listbox'));
  });
});

describe('Dropdown: states and forms', () => {
  it('disabled: not tabbable and cannot open', async () => {
    const { combobox } = setup({ disabled: true });
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
    expect(combobox).toHaveAttribute('tabindex', '-1');
    await userEvent.click(combobox);
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('controlled: shows the value the parent passes', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('apple');
      return (
        <>
          <Dropdown label="Fruit" options={fruits} value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    const combobox = screen.getByRole('combobox');
    await focusAndPress(combobox, '{ArrowDown}{End}{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('grape');
    expect(combobox).toHaveTextContent('Grape');
  });

  it('submits its value with native forms', async () => {
    let data: FormData | null = null;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Dropdown label="Fruit" name="fruit" options={fruits} defaultValue="grape" />
        <button type="submit">Send</button>
      </form>,
    );
    fireEvent.submit(screen.getByRole('button', { name: 'Send' }).closest('form')!);
    expect(data!.get('fruit')).toBe('grape');
  });

  it('blocks submission when required and empty', () => {
    render(
      <form>
        <Dropdown label="Fruit" name="fruit" options={fruits} required />
      </form>,
    );
    const form = document.querySelector('form')!;
    expect(form.checkValidity()).toBe(false);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });

  it.each([
    ['closed', {}],
    ['with value', { defaultValue: 'apple' }],
    ['error', { error: 'Pick one' }],
    ['disabled', { disabled: true }],
    ['required with name', { required: true, name: 'fruit' }],
  ])('%s state has no axe violations', async (_name, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });

  it('open state has no axe violations', async () => {
    const { combobox } = setup();
    await focusAndPress(combobox, '{ArrowDown}');
    await expectNoA11yViolations(document.body);
  });
});
