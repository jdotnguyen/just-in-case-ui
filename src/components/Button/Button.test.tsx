import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Button } from './Button';
import type { ButtonTone, ButtonVariant } from './Button';

const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary'];
const tones: ButtonTone[] = ['default', 'destructive'];

describe('Button', () => {
  it('renders a native button with type="button" by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('does not submit a surrounding form by default', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <Button>Save</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('activates with Enter and Space', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it.each(variants.flatMap((variant) => tones.map((tone) => [variant, tone] as const)))(
    'exposes %s / %s for styling and has no axe violations',
    async (variant, tone) => {
      const { container } = render(
        <Button variant={variant} tone={tone}>
          Action
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', variant);
      expect(button).toHaveAttribute('data-tone', tone);
      await expectNoA11yViolations(container);
    },
  );

  it('defaults to primary, default tone, md size', () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-tone', 'default');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('hides decorative icons from assistive tech', () => {
    render(
      <Button startIcon={<svg data-testid="start" />} endIcon={<svg data-testid="end" />}>
        Next
      </Button>,
    );
    expect(screen.getByTestId('start').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('end').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('names icon-only buttons with aria-label', async () => {
    const { container } = render(<Button icon={<svg />} aria-label="Close dialog" />);
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('uses native disabled by default', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.tab();
    expect(button).not.toHaveFocus();
  });

  it('can stay focusable while disabled, without activating', async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" disabled focusableWhenDisabled onClick={onClick}>
          Save
        </Button>
      </form>,
    );
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('forwards refs and native attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} name="intent" value="save" data-testid="b">
        Save
      </Button>,
    );
    expect(ref.current).toBe(screen.getByTestId('b'));
    expect(ref.current).toHaveAttribute('name', 'intent');
  });
});

// Type-level check: an icon-only button without aria-label must not compile.
// @ts-expect-error aria-label is required when `icon` is used
void (<Button icon={<svg />} />);
