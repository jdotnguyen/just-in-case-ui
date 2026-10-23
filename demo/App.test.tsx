import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../src/test/a11y';
import { App } from './App';
import { ROUTES } from './routes';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('Kitchen-sink demo', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('has a left sidebar nav listing every page', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Components' });
    for (const label of ['Overview', 'Button', 'Text input', 'Dropdown', 'Checkbox', 'Radio group', 'Dialog']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('shows Overview by default and for unknown routes', () => {
    window.history.replaceState(null, '', '/#/nope');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
  });

  it('deep links to a page', () => {
    window.history.replaceState(null, '', '/#/button');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument();
  });

  it('navigates: one page at a time, aria-current, title and focus', () => {
    render(<App />);
    goTo('#/dropdown');
    const heading = screen.getByRole('heading', { level: 1, name: 'Dropdown' });
    expect(heading).toHaveFocus();
    expect(document.title).toBe('Dropdown · Just In Case UI');
    expect(screen.queryByRole('heading', { level: 1, name: 'Button' })).not.toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Components' });
    expect(within(nav).getByRole('link', { name: 'Dropdown' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  });

  it('has a skip link that moves focus to main without changing the route', async () => {
    window.history.replaceState(null, '', '/#/button');
    render(<App />);
    await userEvent.tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveFocus();
    await userEvent.click(skip);
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('#/button');
  });

  it.each(ROUTES.map((route) => [route.path]))('%s page has no axe violations', async (path) => {
    window.history.replaceState(null, '', `/#/${path}`);
    const { container } = render(<App />);
    await expectNoA11yViolations(container);
  });
});
