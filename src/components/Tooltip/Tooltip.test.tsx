import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';
import type { TooltipProps } from './Tooltip';

function setup(props: Partial<TooltipProps> = {}) {
  return render(
    <Tooltip content="Saves your work" openDelay={10} closeDelay={10} {...props}>
      <Button>Save</Button>
    </Tooltip>,
  );
}

const tooltip = () => screen.getByRole('tooltip', { hidden: true });

describe('Tooltip', () => {
  it('is rendered but hidden until needed, and described by the trigger', () => {
    setup();
    expect(tooltip()).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAccessibleDescription('Saves your work');
  });

  it('keeps an existing aria-describedby', () => {
    render(
      <>
        <p id="other">Other</p>
        <Tooltip content="Tip">
          <Button aria-describedby="other">Go</Button>
        </Tooltip>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAccessibleDescription('Other Tip');
  });

  it('shows on keyboard focus immediately and hides on blur', async () => {
    setup({ openDelay: 1000 });
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeVisible();
    await userEvent.tab();
    await waitFor(() => expect(tooltip()).not.toBeVisible());
  });

  it('shows after a delay on hover and hides on leave', async () => {
    setup();
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.hover(button);
    expect(await screen.findByRole('tooltip')).toBeVisible();
    await userEvent.unhover(button);
    await waitFor(() => expect(tooltip()).not.toBeVisible());
  });

  it('does not show on touch pointers', async () => {
    setup();
    const wrapper = screen.getByRole('button', { name: 'Save' }).parentElement!;
    // jsdom has no PointerEvent, so build one and give it a pointerType.
    const event = new MouseEvent('pointerover', { bubbles: true, relatedTarget: document.body });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    act(() => {
      wrapper.dispatchEvent(event);
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(tooltip()).not.toBeVisible();
  });

  it('stays open while the pointer is over the tooltip', async () => {
    setup({ closeDelay: 50 });
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.hover(button);
    const tip = await screen.findByRole('tooltip');
    await userEvent.unhover(button);
    await userEvent.hover(tip);
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(tip).toBeVisible();
  });

  it('closes on Escape without moving focus', async () => {
    setup();
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(tooltip()).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });

  it('does not intercept Escape when closed', () => {
    setup();
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => {
      document.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(false);
  });

  it('has no axe violations open or closed', async () => {
    const { container } = setup();
    await expectNoA11yViolations(container);
    await userEvent.tab();
    await expectNoA11yViolations(document.body);
  });
});
