import { useId } from 'react';
import type { ReactNode } from 'react';

interface ExampleProps {
  title: string;
  description?: ReactNode;
  code?: string;
  /** Layout of the stage: a wrapping row (default) or a stacked column. */
  layout?: 'row' | 'stack' | 'grid';
  children: ReactNode;
}

/** A titled section with a live example and optional source code. */
export function Example({ title, description, code, layout = 'row', children }: ExampleProps) {
  const headingId = useId();
  return (
    <section className="example" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      {description && <div className="example-description">{description}</div>}
      <div className={`stage stage-${layout}`}>{children}</div>
      {code && (
        <details className="code">
          <summary>Show code</summary>
          <pre>
            <code>{code.trim()}</code>
          </pre>
        </details>
      )}
    </section>
  );
}

/** Plain-text section without a stage, for notes and guidance. */
export function Notes({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section className="example" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <div className="notes">{children}</div>
    </section>
  );
}
