import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Breadcrumbs } from './Breadcrumbs';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumbs' },
];

describe('Breadcrumbs', () => {
  it('is a navigation landmark with a list', () => {
    render(<Breadcrumbs items={items} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
  });

  it('supports a custom label', () => {
    render(<Breadcrumbs items={items} label="You are here" />);
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument();
  });

  it('links all but the last item', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(['Home', 'Components']);
    expect(screen.getByText('Breadcrumbs')).toHaveAttribute('aria-current', 'page');
  });

  it('never links the current page even if it has an href', () => {
    render(<Breadcrumbs items={[{ label: 'A', href: '/a' }, { label: 'B', href: '/b' }]} />);
    expect(screen.queryByRole('link', { name: 'B' })).not.toBeInTheDocument();
    expect(screen.getByText('B')).toHaveAttribute('aria-current', 'page');
  });

  it('hides separators from assistive technology', () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll('svg');
    expect(separators).toHaveLength(2);
    separators.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
  });

  it('has no axe violations', async () => {
    const { container } = render(<Breadcrumbs items={items} />);
    await expectNoA11yViolations(container);
  });
});
