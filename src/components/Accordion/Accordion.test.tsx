import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Accordion } from './Accordion';
import type { AccordionItem, AccordionProps } from './Accordion';

const items: AccordionItem[] = [
  { id: 'one', title: 'First', content: <p>First panel</p> },
  { id: 'two', title: 'Second', content: <p>Second panel</p> },
  { id: 'three', title: 'Third', content: <p>Third panel</p>, disabled: true },
  { id: 'four', title: 'Fourth', content: <p>Fourth panel</p> },
];

function setup(props: Partial<AccordionProps> = {}) {
  return render(<Accordion items={items} {...props} />);
}

const button = (name: string) => screen.getByRole('button', { name });

describe('Accordion structure', () => {
  it('puts a button inside each heading', () => {
    setup();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    expect(button('First').closest('h3')).not.toBeNull();
  });

  it('supports a custom heading level', () => {
    setup({ headingLevel: 2 });
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });

  it('starts collapsed with the panel hidden and wired up', () => {
    setup();
    const trigger = button('First');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const panelId = trigger.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).not.toBeVisible();
  });

  it('exposes open panels as regions named by their button', async () => {
    setup();
    await userEvent.click(button('First'));
    expect(screen.getByRole('region', { name: 'First' })).toHaveTextContent('First panel');
  });

  it('skips region roles for long accordions', async () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      id: `i${i}`,
      title: `Item ${i}`,
      content: <p>Body {i}</p>,
    }));
    render(<Accordion items={many} defaultValue={['i0']} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});

describe('Accordion behaviour', () => {
  it('toggles with click, Enter and Space', async () => {
    setup({ type: 'multiple' });
    const trigger = button('First');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('single mode closes the other item', async () => {
    setup();
    await userEvent.click(button('First'));
    await userEvent.click(button('Second'));
    expect(button('First')).toHaveAttribute('aria-expanded', 'false');
    expect(button('Second')).toHaveAttribute('aria-expanded', 'true');
  });

  it('single mode can close the open item when collapsible', async () => {
    setup({ defaultValue: ['one'] });
    await userEvent.click(button('First'));
    expect(button('First')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the open item open when not collapsible', async () => {
    setup({ defaultValue: ['one'], collapsible: false });
    await userEvent.click(button('First'));
    expect(button('First')).toHaveAttribute('aria-expanded', 'true');
  });

  it('multiple mode opens items independently', async () => {
    setup({ type: 'multiple' });
    await userEvent.click(button('First'));
    await userEvent.click(button('Second'));
    expect(button('First')).toHaveAttribute('aria-expanded', 'true');
    expect(button('Second')).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onChange with the open ids', async () => {
    const onChange = vi.fn();
    setup({ type: 'multiple', onChange });
    await userEvent.click(button('First'));
    await userEvent.click(button('Second'));
    expect(onChange).toHaveBeenLastCalledWith(['one', 'two']);
  });

  it('follows the value prop when controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState<string[]>(['two']);
      return <Accordion items={items} value={open} onChange={setOpen} />;
    }
    render(<Controlled />);
    expect(button('Second')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(button('First'));
    expect(button('First')).toHaveAttribute('aria-expanded', 'true');
    expect(button('Second')).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open disabled items', async () => {
    setup();
    expect(button('Third')).toBeDisabled();
    await userEvent.click(button('Third'));
    expect(button('Third')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Accordion keyboard', () => {
  it('moves between headers with Down and Up, wrapping and skipping disabled', async () => {
    setup();
    button('First').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(button('Second')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(button('Fourth')).toHaveFocus(); // Third is disabled
    await userEvent.keyboard('{ArrowDown}');
    expect(button('First')).toHaveFocus(); // wraps
    await userEvent.keyboard('{ArrowUp}');
    expect(button('Fourth')).toHaveFocus(); // wraps back
  });

  it('Home and End jump to the first and last enabled header', async () => {
    setup();
    button('Second').focus();
    await userEvent.keyboard('{End}');
    expect(button('Fourth')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(button('First')).toHaveFocus();
  });
});

describe('Accordion accessibility', () => {
  it.each([
    ['collapsed', {}],
    ['one open', { defaultValue: ['one'] }],
    ['multiple open', { type: 'multiple' as const, defaultValue: ['one', 'two'] }],
  ])('%s has no axe violations', async (_name, props) => {
    const { container } = setup(props);
    await expectNoA11yViolations(container);
  });
});
