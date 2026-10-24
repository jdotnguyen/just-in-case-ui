import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Tabs } from './Tabs';
import type { TabItem, TabsProps } from './Tabs';

const tabs: TabItem[] = [
  { id: 'one', label: 'One', content: <p>Panel one</p> },
  { id: 'two', label: 'Two', content: <p>Panel two</p> },
  { id: 'three', label: 'Three', content: <p>Panel three</p>, disabled: true },
  { id: 'four', label: 'Four', content: <button type="button">Inside</button> },
];

function setup(props: Partial<TabsProps> = {}) {
  return render(<Tabs label="Demo" tabs={tabs} {...props} />);
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs structure', () => {
  it('names the tablist and selects the first enabled tab', () => {
    setup();
    expect(screen.getByRole('tablist', { name: 'Demo' })).toBeInTheDocument();
    expect(tab('One')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Two')).toHaveAttribute('aria-selected', 'false');
  });

  it('shows only the selected panel, labelled by its tab', () => {
    setup();
    expect(screen.getByRole('tabpanel', { name: 'One' })).toHaveTextContent('Panel one');
    expect(screen.queryByText('Panel two')).not.toBeVisible();
  });

  it('wires aria-controls to the panel id', () => {
    setup();
    const panel = document.getElementById(tab('One').getAttribute('aria-controls')!);
    expect(panel).toHaveAttribute('role', 'tabpanel');
  });

  it('uses roving tabindex', () => {
    setup();
    expect(tab('One')).toHaveAttribute('tabindex', '0');
    expect(tab('Two')).toHaveAttribute('tabindex', '-1');
  });

  it('makes a panel without focusable content a tab stop', () => {
    setup();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
  });

  it('does not make a panel with focusable content a tab stop', async () => {
    setup({ defaultValue: 'four' });
    expect(screen.getByRole('tabpanel')).not.toHaveAttribute('tabindex');
  });

  it('respects defaultValue', () => {
    setup({ defaultValue: 'two' });
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs interaction', () => {
  it('selects on click', async () => {
    const onChange = vi.fn();
    setup({ onChange });
    await userEvent.click(tab('Two'));
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('does not select disabled tabs', async () => {
    setup();
    await userEvent.click(tab('Three'));
    expect(tab('Three')).toHaveAttribute('aria-selected', 'false');
  });

  it('moves and selects with arrow keys, skipping disabled and wrapping', async () => {
    setup();
    tab('One').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Two')).toHaveFocus();
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Four')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('One')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(tab('Four')).toHaveFocus();
  });

  it('supports Home and End', async () => {
    setup();
    tab('One').focus();
    await userEvent.keyboard('{End}');
    expect(tab('Four')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(tab('One')).toHaveFocus();
  });

  it('uses Up and Down when vertical', async () => {
    setup({ orientation: 'vertical' });
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    tab('One').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('One')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(tab('Two')).toHaveFocus();
  });

  it('only moves focus in manual mode until Enter or Space', async () => {
    setup({ activation: 'manual' });
    tab('One').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Two')).toHaveFocus();
    expect(tab('One')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
  });

  it('works controlled', async () => {
    const onChange = vi.fn();
    setup({ value: 'one', onChange });
    await userEvent.click(tab('Two'));
    expect(onChange).toHaveBeenCalledWith('two');
    expect(tab('One')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = setup();
    await expectNoA11yViolations(container);
  });

  it('has no axe violations when vertical and manual', async () => {
    const { container } = setup({ orientation: 'vertical', activation: 'manual' });
    await expectNoA11yViolations(container);
  });
});
