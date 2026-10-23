import { useEffect, useRef } from 'react';
import { LifeRingIcon } from './components/icons';
import { DEFAULT_PATH, ROUTE_PATHS, ROUTES } from './routes';
import type { DemoRoute } from './routes';
import { useHashRoute } from './useHashRoute';

const SITE_NAME = 'Just In Case UI';

export function App() {
  const path = useHashRoute(ROUTE_PATHS, DEFAULT_PATH);
  const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(route.path);

  useEffect(() => {
    document.title = route.path === DEFAULT_PATH ? SITE_NAME : `${route.label} · ${SITE_NAME}`;
    // Don't steal focus on first load (or StrictMode's repeated effect run);
    // only after a real navigation, move focus to the new page's heading so
    // screen reader users hear where they are.
    if (previousPath.current === route.path) return;
    previousPath.current = route.path;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [route]);

  const groups = ['Foundations', 'Components'] as const;
  const { Page } = route;

  return (
    <div className="shell">
      <a
        className="skip-link"
        href="#main"
        // The hash is used for routing, so move focus without changing it.
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>

      <aside className="sidebar">
        <div className="brand">
          <LifeRingIcon className="brand-logo" />
          <div>
            <p className="brand-name">{SITE_NAME}</p>
            <p className="brand-tag">Kitchen sink · v0.1</p>
          </div>
        </div>

        <nav aria-label="Components" className="nav">
          {groups.map((group) => (
            <div key={group} className="nav-group">
              <p className="nav-group-label" id={`nav-${group}`}>
                {group}
              </p>
              <ul aria-labelledby={`nav-${group}`}>
                {ROUTES.filter((r) => r.group === group).map((r) => (
                  <NavLink key={r.path} route={r} current={r.path === route.path} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="sidebar-foot">Just in case anyone needs it, so everyone can use it.</p>
      </aside>

      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <header className="page-header">
          <p className="eyebrow">{route.eyebrow}</p>
          <h1 ref={headingRef} tabIndex={-1}>
            {route.path === DEFAULT_PATH ? 'Overview' : route.label}
          </h1>
          <p className="lede">{route.description}</p>
        </header>
        <Page />
      </main>
    </div>
  );
}

function NavLink({ route, current }: { route: DemoRoute; current: boolean }) {
  return (
    <li>
      <a href={`#/${route.path}`} className="nav-link" aria-current={current ? 'page' : undefined}>
        {route.label}
      </a>
    </li>
  );
}
