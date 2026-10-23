import { Fragment, useId } from 'react';
import type { ReactNode } from 'react';

export interface KeyRow {
  keys: string[];
  action: ReactNode;
}

interface KeyboardTableProps {
  caption?: string;
  groups: Array<{ title?: string; rows: KeyRow[] }>;
}

/** Keyboard support reference for a component page. */
export function KeyboardTable({ caption = 'Keyboard support', groups }: KeyboardTableProps) {
  const headingId = useId();
  return (
    <section className="example" aria-labelledby={headingId}>
      <h2 id={headingId}>{caption}</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Key</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, groupIndex) => (
              <Fragment key={group.title ?? groupIndex}>
                {group.title && (
                  <tr className="table-group">
                    <th scope="colgroup" colSpan={2}>
                      {group.title}
                    </th>
                  </tr>
                )}
                {group.rows.map((row) => (
                  <tr key={row.keys.join('+')}>
                    <th scope="row">
                      {row.keys.map((key, i) => (
                        <Fragment key={key}>
                          {i > 0 && <span className="key-sep"> or </span>}
                          <kbd>{key}</kbd>
                        </Fragment>
                      ))}
                    </th>
                    <td>{row.action}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export interface PropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: ReactNode;
}

/** Props reference table. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  const headingId = useId();
  return (
    <section className="example" aria-labelledby={headingId}>
      <h2 id={headingId}>Props</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">
                  <code>{row.name}</code>
                </th>
                <td>
                  <code>{row.type}</code>
                </td>
                <td>{row.defaultValue ? <code>{row.defaultValue}</code> : '—'}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
