import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Pagination, buildPageEntries } from './Pagination';

describe('buildPageEntries', () => {
  it('shows every page when there are few', () => {
    expect(buildPageEntries(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageEntries(4, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the end when near the start', () => {
    expect(buildPageEntries(1, 20, 1)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 20]);
  });

  it('collapses the start when near the end', () => {
    expect(buildPageEntries(20, 20, 1)).toEqual([1, 'start-ellipsis', 16, 17, 18, 19, 20]);
  });

  it('collapses both sides in the middle', () => {
    expect(buildPageEntries(10, 20, 1)).toEqual([1, 'start-ellipsis', 9, 10, 11, 'end-ellipsis', 20]);
  });

  it('keeps a constant number of items', () => {
    for (let page = 1; page <= 20; page += 1) {
      expect(buildPageEntries(page, 20, 1)).toHaveLength(7);
    }
  });
});

describe('Pagination', () => {
  it('is a navigation landmark with named items', () => {
    render(<Pagination page={3} pageCount={10} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current');
  });

  it('calls onChange with the chosen page', async () => {
    const onChange = vi.fn();
    render(<Pagination page={3} pageCount={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    expect(onChange).toHaveBeenCalledWith(4);
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} pageCount={5} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    rerender(<Pagination page={5} pageCount={5} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('hides ellipses from assistive technology', () => {
    render(<Pagination page={10} pageCount={20} />);
    const hidden = screen.getAllByText('…');
    expect(hidden).toHaveLength(2);
    hidden.forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
  });

  it('renders links when getHref is given', () => {
    render(<Pagination page={2} pageCount={5} getHref={(p) => `/results?page=${p}`} />);
    expect(screen.getByRole('link', { name: 'Page 3' })).toHaveAttribute('href', '/results?page=3');
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute('href', '/results?page=3');
  });

  it('announces the new page, but not on first render', async () => {
    function Controlled() {
      const [page, setPage] = useState(1);
      return <Pagination page={page} pageCount={10} onChange={setPage} />;
    }
    render(<Controlled />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('status')).toHaveTextContent('Page 2 of 10');
  });

  it('keeps focus on the pressed page button when the page changes', async () => {
    function Controlled() {
      const [page, setPage] = useState(1);
      return <Pagination page={page} pageCount={10} onChange={setPage} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Pagination page={10} pageCount={20} onChange={() => {}} />);
    await expectNoA11yViolations(container);
  });
});
