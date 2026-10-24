import { Spinner } from '../../src';
import { Example, Notes } from '../components/Example';
import { PropsTable } from '../components/KeyboardTable';

export function SpinnerPage() {
  return (
    <>
      <Example
        title="Sizes"
        code={`
<Spinner size="sm" />
<Spinner />
<Spinner size="lg" />`}
      >
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
      </Example>

      <Example
        title="With a visible label"
        description={<p>Words beat a bare spinner. People know what is happening and screen readers read the same text.</p>}
        code={`<Spinner label="Loading your results" showLabel />`}
      >
        <Spinner label="Loading your results" showLabel />
      </Example>

      <Example
        title="Custom spoken label"
        description={<p>Without <code>showLabel</code>, the label is still read aloud.</p>}
        code={`<Spinner label="Saving your changes" />`}
      >
        <Spinner label="Saving your changes" />
      </Example>

      <Notes title="Accessibility notes">
        <ul>
          <li>The spinner is a <code>role="status"</code> region whose only content is its label. The picture is hidden from assistive technology.</li>
          <li>With reduced motion on, it doesn't spin: it fades slowly in and out instead.</li>
          <li>Spinners say "something is happening", not how long it will take. For longer waits, use a Progress bar.</li>
          <li>Announcements are most reliable when the status region is already in the page. If you add and remove spinners, keep an empty wrapper with <code>aria-live="polite"</code> and put the spinner in it.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'string', defaultValue: "'Loading'", description: 'What is loading, read aloud.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: '16, 24 or 40 pixels.' },
          { name: 'showLabel', type: 'boolean', defaultValue: 'false', description: 'Also shows the label as text.' },
        ]}
      />
    </>
  );
}
