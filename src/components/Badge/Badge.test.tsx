import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Badge } from './Badge';
import type { BadgeTone } from './Badge';

const tones: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

describe('Badge', () => {
  it('renders its text', () => {
    render(<Badge tone="danger">Failed</Badge>);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('hides the icon from assistive technology', () => {
    render(
      <Badge icon={<svg data-testid="icon" />} tone="success">
        Paid
      </Badge>,
    );
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('passes through attributes and class names', () => {
    render(
      <Badge data-testid="b" className="extra" title="More info">
        New
      </Badge>,
    );
    expect(screen.getByTestId('b')).toHaveClass('extra');
    expect(screen.getByTestId('b')).toHaveAttribute('title', 'More info');
  });

  it.each(tones)('has no axe violations (%s)', async (tone) => {
    const { container } = render(<Badge tone={tone}>Status</Badge>);
    await expectNoA11yViolations(container);
  });
});
