import { expect } from 'vitest';
import { axe } from 'vitest-axe';

/** Fails the test if axe finds any accessibility violation in `container`. */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  // color-contrast needs real layout, which jsdom lacks; token contrast is
  // covered by src/styles/tokens.test.ts instead. `region` (content inside
  // landmarks) is a page-level rule that doesn't apply to isolated components.
  const results = await axe(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  expect(results).toHaveNoViolations();
}
