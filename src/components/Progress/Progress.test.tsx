import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Progress } from './Progress';

describe('Progress', () => {
  it('is a progressbar named by its visible label', () => {
    render(<Progress label="Uploading" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });

  it('supports a custom max', () => {
    render(<Progress label="Files" value={3} max={12} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '12');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
  });

  it('clamps out-of-range values', () => {
    const { rerender } = render(<Progress label="A" value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<Progress label="A" value={-5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('is indeterminate without a value', () => {
    render(<Progress label="Working" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-indeterminate');
  });

  it('shows the percentage on request, only when determinate', () => {
    const { rerender } = render(<Progress label="Upload" value={3} max={12} showValue />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    rerender(<Progress label="Upload" showValue />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('uses valueText for aria-valuetext', () => {
    render(<Progress label="Files" value={3} max={12} valueText="3 of 12 files" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 of 12 files');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Progress label="One" value={20} showValue />
        <Progress label="Two" />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
