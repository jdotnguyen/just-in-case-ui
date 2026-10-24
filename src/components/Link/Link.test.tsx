import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Link } from './Link';

describe('Link', () => {
  it('is a native link', () => {
    render(<Link href="/docs">Docs</Link>);
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('opens externally in a new tab, safely, and says so', () => {
    render(
      <Link href="https://example.com" external>
        Example
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Example (opens in a new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not add target or rel for internal links', () => {
    render(<Link href="/a">Internal</Link>);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('forwards refs and attributes', () => {
    let node: HTMLAnchorElement | null = null;
    render(
      <Link
        href="/x"
        ref={(element) => {
          node = element;
        }}
        aria-describedby="hint"
      >
        X
      </Link>,
    );
    expect(node).toBeInstanceOf(HTMLAnchorElement);
    expect(screen.getByRole('link')).toHaveAttribute('aria-describedby', 'hint');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <p>
        <Link href="/a">Internal</Link> and{' '}
        <Link href="https://example.com" external>
          external
        </Link>
      </p>,
    );
    await expectNoA11yViolations(container);
  });
});
