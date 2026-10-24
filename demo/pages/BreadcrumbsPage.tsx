import { Breadcrumbs } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

export function BreadcrumbsPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>The last item is the current page: it is plain text, bold, and marked with <code>aria-current</code>.</p>}
        layout="stack"
        code={`
<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Breadcrumbs' },
  ]}
/>`}
      >
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#/overview' },
            { label: 'Components', href: '#/button' },
            { label: 'Breadcrumbs' },
          ]}
        />
      </Example>

      <Example
        title="Long trails wrap"
        description={<p>On narrow screens the trail wraps onto more lines instead of scrolling sideways.</p>}
        layout="stack"
      >
        <div style={{ maxWidth: 320 }}>
          <Breadcrumbs
            label="Breadcrumb, long trail"
            items={[
              { label: 'Home', href: '#/overview' },
              { label: 'Products', href: '#/overview' },
              { label: 'Outdoor and camping', href: '#/overview' },
              { label: 'Tents and shelters', href: '#/overview' },
              { label: 'Four-season tents' },
            ]}
          />
        </div>
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves through the links. The current page isn’t a link, so it is skipped.' },
              { keys: ['Enter'], action: 'Follows the focused link.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>It is a <code>nav</code> landmark named "Breadcrumb", containing an ordered list, so screen readers say "list, 3 items".</li>
          <li>Separators are decorative icons, never text, so nothing like "slash" is read aloud.</li>
          <li>If your page has more than one navigation landmark, give each a distinct label.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'items', type: 'BreadcrumbItem[]', description: '{ label, href? }. The last item is the current page.' },
          { name: 'label', type: 'string', defaultValue: "'Breadcrumb'", description: 'Accessible name for the landmark.' },
        ]}
      />
    </>
  );
}
