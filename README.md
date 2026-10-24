# Just In Case UI

Accessible React components with soft corners: built just in case anyone needs them, so everyone can use them.

- **Accessibility first.** Native elements wherever they exist, the matching [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) pattern where they don't, full keyboard support, and WCAG 2.2 AA contrast.
- **Soft look.** Rounded corners, soft blue actions and red for anything destructive. Primary buttons are solid, secondary are outlined and tertiary are text.
- **Small and plain.** React and CSS only: no runtime dependencies. Every value is a `--jic-*` CSS variable you can override.

## Components

| Group | Components |
|---|---|
| Inputs | `Button`, `TextInput`, `PasswordInput`, `SearchInput`, `Textarea`, `Dropdown`, `Combobox`, `Checkbox` / `CheckboxGroup`, `RadioGroup`, `Switch` |
| Navigation and disclosure | `Link`, `Breadcrumbs`, `Pagination`, `Tabs`, `Accordion` |
| Overlays and feedback | `Alert`, `Badge`, `Progress`, `Spinner`, `Dialog`, `Popover`, `Menu`, `Tooltip`, `ToastProvider` / `useToast` |

The kitchen-sink demo has one page per component, with every variant and state, copyable code, a keyboard reference and accessibility notes.

## Getting started

```bash
npm install
npm run dev        # kitchen-sink demo at http://localhost:5173
```

## Using it in an app

```tsx
import 'just-in-case-ui/styles.css';
import { Breadcrumbs, Button, Combobox, PasswordInput, TextInput, ToastProvider, useToast } from 'just-in-case-ui';

function SaveButton() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: 'Saved', tone: 'success' })}>Save</Button>;
}

export function App() {
  return (
    <ToastProvider>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sign up' }]} />
      <TextInput label="Email" type="email" autoComplete="email" required />
      <PasswordInput label="Password" autoComplete="new-password" required />
      <Combobox label="Country" options={[{ value: 'ca', label: 'Canada' }]} name="country" />
      <SaveButton />
      <Button variant="secondary" tone="destructive">Delete project</Button>
    </ToastProvider>
  );
}
```

Import the stylesheet once, and wrap your app in `ToastProvider` if you use toasts. React 18 or newer is required.

## Theming

All colours, radii, spacing, type sizes, motion and z-index values are CSS variables on `:root`, defined in `src/styles/tokens.css`. Override them in your own CSS:

```css
:root {
  --jic-color-action: #2f5db8;
  --jic-radius-control: 6px;
}
```

If you change colours, keep text pairs at 4.5:1 contrast and borders, icons and focus rings at 3:1. `src/styles/tokens.test.ts` checks every pairing the components use. Motion switches off automatically for people who ask for reduced motion, and components adapt to Windows High Contrast (forced colours).

## Accessibility notes

- Every control has a visible label. Placeholders are never labels.
- Errors use text and an icon as well as colour, are tied to the field with `aria-describedby`, and set `aria-invalid`.
- Overlays follow their patterns: `Dialog` uses the native `<dialog>` and returns focus; `Popover` and `Menu` return focus to their button on Escape; `Tooltip` meets WCAG 1.4.13 (dismissible, hoverable, persistent).
- `Badge` always carries text, `Link` is always underlined, and `Progress` and `Spinner` have spoken labels and stop moving for people who prefer reduced motion. `Pagination` marks the current page with `aria-current` and announces each change. If a page has more than one `Breadcrumbs` or `Pagination`, give each a distinct `label`.
- `Toast` uses two always-present live regions. Errors and toasts with actions don't time out, and the timer pauses on hover and focus.
- Known limits: tooltips never appear on touch devices, so never put essential information in one. Toasts sit outside a modal dialog, so they can't be reached while one is open.
- Automated checks catch a lot, but not everything. Please also test with a screen reader (VoiceOver, NVDA) in your own app.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the kitchen-sink demo (`demo/`) |
| `npm run build` | Builds the library to `dist/` (ESM, `.d.ts` type declarations, `styles.css`). The demo is not included |
| `npm run build:demo` | Builds the demo as a static site to `dist-demo/` |
| `npm test` | Runs Vitest: behaviour tests and axe accessibility checks for every component and demo page |
| `npm run typecheck` | Runs `tsc --noEmit` |
| `npm run lint` | Runs ESLint, including `jsx-a11y` |
| `npm run format` / `format:check` | Formats with, or checks against, Prettier |
| `npm run check` | Typecheck, lint, test and build in one go (also runs before publishing) |

## Project layout

```text
src/components/<Name>/   component, CSS module and tests
src/styles/tokens.css    design tokens (CSS variables)
src/utils/               shared hooks and helpers (positioning, controlled state)
demo/                    kitchen-sink app, one page per component
```

## Planning

This project is planned with [OpenSpec](https://openspec.dev). Each batch of components has a change in `openspec/changes/` at the root of the GitHub folder, with a proposal, design notes, specs and a task list.

## License

MIT
