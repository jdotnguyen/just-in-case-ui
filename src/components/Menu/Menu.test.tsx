import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Button } from '../Button/Button';
import { Menu } from './Menu';
import type { MenuItem } from './Menu';

function makeItems(spies: Record<string, () => void> = {}): MenuItem[] {
  return [
    { id: 'edit', label: 'Edit', onSelect: spies.edit },
    { id: 'duplicate', label: 'Duplicate', onSelect: spies.duplicate },
    { id: 'archive', label: 'Archive', disabled: true },
    { id: 'delete', label: 'Delete', destructive: true, separatorBefore: true, onSelect: spies.delete },
  ];
}

function setup(spies: Record<string, () => void> = {}) {
  return render(
    <>
      <button type="button">Before</button>
      <Menu trigger={<Button variant="secondary">Actions</Button>} items={makeItems(spies)} />
      <button type="button">After</button>
    </>,
  );
}

const trigger = () => screen.getByRole('button', { name: 'Actions' });
const item = (name: string) => screen.getByRole('menuitem', { name });

describe('Menu semantics', () => {
  it('has a closed trigger with menu semantics', () => {
    setup();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens a menu named by the trigger, with one tab stop', async () => {
    setup();
    await userEvent.click(trigger());
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getAllByRole('menuitem').filter((el) => el.tabIndex === 0)).toHaveLength(1);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('focuses the first item on click', async () => {
    setup();
    await userEvent.click(trigger());
    expect(item('Edit')).toHaveFocus();
  });
});

describe('Menu opening keys', () => {
  it.each(['{ArrowDown}', '{Enter}', ' '])('opens on the first item with %s', async (key) => {
    setup();
    trigger().focus();
    await userEvent.keyboard(key);
    expect(item('Edit')).toHaveFocus();
  });

  it('opens on the last enabled item with ArrowUp', async () => {
    setup();
    trigger().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
  });
});

describe('Menu navigation', () => {
  it('moves with arrows, wraps and skips disabled items', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Delete')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
  });

  it('supports Home and End', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('{End}');
    expect(item('Delete')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(item('Edit')).toHaveFocus();
  });

  it('supports type-ahead', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('d');
    expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('d');
    expect(item('Delete')).toHaveFocus();
  });

  it('skips disabled items in type-ahead', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('a');
    expect(item('Edit')).toHaveFocus();
  });
});

describe('Menu activation and closing', () => {
  it.each(['{Enter}', ' '])('runs the item with %s, closes and refocuses the trigger', async (key) => {
    const edit = vi.fn();
    setup({ edit });
    await userEvent.click(trigger());
    await userEvent.keyboard(key);
    expect(edit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('runs the item on click', async () => {
    const del = vi.fn();
    setup({ delete: del });
    await userEvent.click(trigger());
    await userEvent.click(item('Delete'));
    expect(del).toHaveBeenCalledTimes(1);
    expect(trigger()).toHaveFocus();
  });

  it('ignores disabled items', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.click(item('Archive'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(item('Archive')).toHaveAttribute('aria-disabled', 'true');
  });

  it('closes on Escape and refocuses the trigger', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes on Tab and lets focus move on', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('closes on an outside press', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('toggles closed when the trigger is clicked again', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('Menu accessibility', () => {
  it('has no axe violations open or closed', async () => {
    const { container } = setup();
    await expectNoA11yViolations(container);
    await userEvent.click(trigger());
    await expectNoA11yViolations(container);
  });
});
