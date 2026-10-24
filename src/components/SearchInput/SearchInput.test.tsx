import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { SearchInput } from './SearchInput';

const box = () => screen.getByRole('searchbox', { name: 'Search products' });
const clearButton = () => screen.queryByRole('button', { name: 'Clear search' });

describe('SearchInput', () => {
  it('is a labelled searchbox', () => {
    render(<SearchInput label="Search products" />);
    expect(box()).toHaveAttribute('type', 'search');
  });

  it('shows Clear search only when there is text', async () => {
    render(<SearchInput label="Search products" />);
    expect(clearButton()).not.toBeInTheDocument();
    await userEvent.type(box(), 'cats');
    expect(clearButton()).toBeInTheDocument();
  });

  it('clears and refocuses the input with the button', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput label="Search products" defaultValue="cats" onValueChange={onValueChange} />);
    await userEvent.click(clearButton()!);
    expect(box()).toHaveValue('');
    expect(box()).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(clearButton()).not.toBeInTheDocument();
  });

  it('clears with Escape only when there is text', async () => {
    render(<SearchInput label="Search products" defaultValue="cats" />);
    box().focus();
    await userEvent.keyboard('{Escape}');
    expect(box()).toHaveValue('');
  });

  it('leaves Escape alone when the field is empty', async () => {
    render(<SearchInput label="Search products" />);
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    box().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('calls onSearch with the text on Enter', async () => {
    const onSearch = vi.fn();
    render(<SearchInput label="Search products" onSearch={onSearch} />);
    await userEvent.type(box(), 'dogs{Enter}');
    expect(onSearch).toHaveBeenCalledWith('dogs');
  });

  it('works controlled', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput label="Search products" value="abc" onValueChange={onValueChange} />);
    expect(box()).toHaveValue('abc');
    await userEvent.click(clearButton()!);
    expect(onValueChange).toHaveBeenCalledWith('');
    expect(box()).toHaveValue('abc');
  });

  it('hides Clear search when disabled', () => {
    render(<SearchInput label="Search products" defaultValue="x" disabled />);
    expect(clearButton()).not.toBeInTheDocument();
    expect(box()).toBeDisabled();
  });

  it('wires helper text and error', () => {
    render(<SearchInput label="Search products" helperText="Try a name" error="No query" />);
    expect(box()).toHaveAccessibleDescription('No query Try a name');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<SearchInput label="Search products" defaultValue="cats" helperText="Hint" />);
    await expectNoA11yViolations(container);
  });
});
