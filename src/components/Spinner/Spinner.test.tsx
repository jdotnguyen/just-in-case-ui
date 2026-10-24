import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is a status with a default accessible text', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('uses a custom label', () => {
    render(<Spinner label="Saving your changes" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving your changes');
  });

  it('hides the graphic from assistive technology', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('can show the label visibly', () => {
    render(<Spinner label="Loading results" showLabel />);
    expect(screen.getByText('Loading results').className).not.toMatch(/visuallyHidden/);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Spinner size="lg" showLabel />);
    await expectNoA11yViolations(container);
  });
});
