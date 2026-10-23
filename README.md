# Just In Case UI

Accessible React components with soft corners: built just in case anyone needs them, so everyone can use them.

- **Button**: primary (solid), secondary (outlined) and tertiary (text), each in a default (soft blue) or destructive (red) tone.
- **TextInput**: always has a visible label, plus helper text, error and required states with the correct ARIA wiring.
- **Dropdown**: a custom single-select that follows the WAI-ARIA select-only combobox pattern, with full keyboard support.

Every colour pairing meets WCAG 2.2 AA contrast, and every value is a `--jic-*` CSS variable you can override.

## Getting started

```bash
npm install
npm run dev        # kitchen-sink demo at http://localhost:5173
```

The demo has a left sidebar with one page per component. It covers every variant and state, plus keyboard reference tables.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the kitchen-sink demo (`demo/`) |
| `npm run build` | Builds the library to `dist/` (ESM, `.d.ts` type declarations, `styles.css`). The demo is not included |
| `npm run build:demo` | Builds the demo as a static site to `dist-demo/` |
| `npm test` | Runs Vitest: behaviour tests and axe accessibility checks for every component and demo page |
| `npm run typecheck` | Runs `tsc --noEmit` |
| `npm run lint` | Runs ESLint, including `jsx-a11y` |

## Using it in an app

```tsx
import 'just-in-case-ui/styles.css';
import { Button, Dropdown, TextInput } from 'just-in-case-ui';

<TextInput label="Email" type="email" autoComplete="email" required />
<Dropdown label="Team" options={[{ value: 'design', label: 'Design' }]} name="team" />
<Button tone="destructive">Delete project</Button>
```

## Planning

This project was planned with OpenSpec. See `openspec/changes/create-just-in-case-ui-library/` at the root of the GitHub folder.
