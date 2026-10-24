import { useState } from 'react';
import { SearchInput } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const fruit = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange', 'Peach', 'Pear', 'Pineapple'];

function LiveFilter() {
  const [query, setQuery] = useState('');
  const results = fruit.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="stack-sm">
      <SearchInput label="Filter fruit" value={query} onValueChange={setQuery} placeholder="Try “ap”" />
      <p className="muted" role="status">
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </p>
      <ul style={{ margin: 0, paddingInlineStart: 20 }}>
        {results.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

function SubmitSearch() {
  const [submitted, setSubmitted] = useState('');
  return (
    <div className="stack-sm">
      <SearchInput label="Search the docs" onSearch={setSubmitted} helperText="Press Enter to search." />
      <p className="action-log" role="status">
        {submitted ? `Searching for “${submitted}”` : ''}
      </p>
    </div>
  );
}

export function SearchInputPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>Type something: a Clear search button appears. Escape clears the field too.</p>}
        layout="grid"
        code={`<SearchInput label="Search products" />`}
      >
        <SearchInput label="Search products" />
      </Example>

      <Example
        title="Search on Enter"
        description={<p><code>onSearch</code> runs when Enter is pressed.</p>}
        layout="grid"
        code={`<SearchInput label="Search the docs" onSearch={(query) => run(query)} />`}
      >
        <SubmitSearch />
      </Example>

      <Example
        title="Filter as you type"
        description={<p>The result count is a live region, so screen reader users hear how the list changed.</p>}
        layout="grid"
        code={`<SearchInput label="Filter fruit" value={query} onValueChange={setQuery} />`}
      >
        <LiveFilter />
      </Example>

      <Example title="Error and disabled" layout="grid">
        <SearchInput label="Search" error="Enter at least 2 characters." defaultValue="a" />
        <SearchInput label="Search" disabled placeholder="Unavailable" />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Enter'], action: 'Runs the search.' },
              { keys: ['Escape'], action: 'Clears the text, when there is some.' },
              { keys: ['Tab'], action: 'Moves to the Clear search button (when shown), then on.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>It is a native <code>type="search"</code> input, so screen readers say "search text field", and mobile keyboards show a Search key.</li>
          <li>The browser's own clear control is hidden so there is only one Clear search button, with a name.</li>
          <li>To make a search landmark, put the input inside a <code>&lt;form role="search"&gt;</code> in your page.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'value / defaultValue', type: 'string', description: 'Controlled or initial text.' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Called on every change, including clears.' },
          { name: 'onSearch', type: '(value: string) => void', description: 'Called when Enter is pressed.' },
          { name: 'helperText / error / required / disabled', type: '…', description: 'Same as TextInput.' },
        ]}
      />
    </>
  );
}
