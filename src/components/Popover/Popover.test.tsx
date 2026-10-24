import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Button } from '../Button/Button';
import { Popover } from './Popover';
import type { PopoverProps } from './Popover';

function setup(props: Partial<PopoverProps> = {}) {
  return render(
    <>
      <button type="button">Before</button>
      <Popover trigger={<Button>Filters</Button>} label="Filters" {...props}>
        <label>
          Name <input type="text" />
        </label>
        <button type="button">Apply</button>
      </Popover>
      <button type="button">After</button>
    </>,
  );
}

const trigger = () => screen.getByRole('button', { name: 'Filters' });

describe('Popover', () => {
  it('starts closed with trigger semantics', () => {
    setup();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click, names the panel and moves focus inside', async () => {
    setup();
    await userEvent.click(trigger());
    const panel = screen.getByRole('dialog', { name: 'Filters' });
    expect(panel).not.toHaveAttribute('aria-modal');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', panel.id);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  });

  it('focuses the panel when it has nothing focusable', async () => {
    render(
      <Popover trigger={<Button>Info</Button>} label="Details">
        <p>Just text.</p>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Info' }));
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveFocus();
  });

  it('closes with the trigger', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes on a press outside', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('stays open while focus moves within the panel', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when Tab leaves the panel', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.tab(); // Apply
    await userEvent.tab(); // After
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('keeps panel after the trigger in tab order', async () => {
    setup();
    await userEvent.click(trigger());
    const dialog = screen.getByRole('dialog');
    expect(trigger().compareDocumentPosition(dialog) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('supports controlled use', async () => {
    const onOpenChange = vi.fn();
    setup({ open: false, onOpenChange });
    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('can be closed from inside the panel in controlled mode', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Popover trigger={<Button>Menu</Button>} label="Menu" open={open} onOpenChange={setOpen}>
          <button type="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </Popover>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no axe violations open or closed', async () => {
    const { container } = setup();
    await expectNoA11yViolations(container);
    await userEvent.click(trigger());
    await expectNoA11yViolations(container);
  });
});
