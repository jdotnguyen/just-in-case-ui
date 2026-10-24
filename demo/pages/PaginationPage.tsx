import { useState } from 'react';
import { Pagination } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function Controlled({ pageCount, label }: { pageCount: number; label: string }) {
  const [page, setPage] = useState(1);
  return (
    <div className="stack-sm">
      <Pagination page={page} pageCount={pageCount} onChange={setPage} label={label} />
      <p className="muted">
        Showing results for page <output>{page}</output>.
      </p>
    </div>
  );
}

export function PaginationPage() {
  return (
    <>
      <Example
        title="Few pages"
        description={<p>With a handful of pages, every page is shown.</p>}
        layout="stack"
        code={`
const [page, setPage] = useState(1);
<Pagination page={page} pageCount={5} onChange={setPage} />`}
      >
        <Controlled pageCount={5} label="Pagination, few pages" />
      </Example>

      <Example
        title="Many pages"
        description={<p>The first and last page always stay, plus the current page and its neighbours. Gaps become ellipses, which screen readers skip.</p>}
        layout="stack"
        code={`<Pagination page={page} pageCount={42} onChange={setPage} />`}
      >
        <Controlled pageCount={42} label="Pagination, many pages" />
      </Example>

      <Example
        title="As links"
        description={<p>With <code>getHref</code>, each item is a real link, which works for server-rendered or routed pages.</p>}
        layout="stack"
        code={`<Pagination page={2} pageCount={6} getHref={(page) => \`/results?page=\${page}\`} />`}
      >
        <Pagination
          page={2}
          pageCount={6}
          label="Pagination, links"
          getHref={(page) => `#/pagination?page=${page}`}
        />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves between Previous, each page and Next.' },
              { keys: ['Enter', 'Space'], action: 'Goes to the focused page (links use Enter).' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>It is a <code>nav</code> landmark named "Pagination" by default. If a page has more than one, give each a distinct <code>label</code> (these examples do). Each item is named "Page 3", and the current one has <code>aria-current="page"</code> and is also bold and solid, not only blue.</li>
          <li>Previous and Next are disabled at the ends instead of disappearing, so the layout doesn't jump.</li>
          <li>After the page changes, a hidden status announces "Page N of M". Also move focus to the top of your results, or update the page heading, if the content changes a lot.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'page', type: 'number', description: 'Current page, starting at 1.' },
          { name: 'pageCount', type: 'number', description: 'Total pages.' },
          { name: 'onChange', type: '(page: number) => void', description: 'Called when a page button is chosen.' },
          { name: 'getHref', type: '(page: number) => string', description: 'Makes items links instead of buttons.' },
          { name: 'siblingCount', type: 'number', defaultValue: '1', description: 'Pages shown either side of the current one.' },
          { name: 'label', type: 'string', defaultValue: "'Pagination'", description: 'Accessible name for the landmark.' },
        ]}
      />
    </>
  );
}
