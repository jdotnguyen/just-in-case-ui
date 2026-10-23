import type { ComponentType } from 'react';
import { ButtonPage } from './pages/ButtonPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { DialogPage } from './pages/DialogPage';
import { DropdownPage } from './pages/DropdownPage';
import { OverviewPage } from './pages/OverviewPage';
import { RadioGroupPage } from './pages/RadioGroupPage';
import { TextInputPage } from './pages/TextInputPage';

export interface DemoRoute {
  path: string;
  label: string;
  group: 'Foundations' | 'Components';
  eyebrow: string;
  description: string;
  Page: ComponentType;
}

export const ROUTES: DemoRoute[] = [
  {
    path: 'overview',
    label: 'Overview',
    group: 'Foundations',
    eyebrow: 'Just In Case UI',
    description:
      'Accessible React components with soft corners, built just in case anyone needs them, so everyone can use them.',
    Page: OverviewPage,
  },
  {
    path: 'button',
    label: 'Button',
    group: 'Components',
    eyebrow: 'Component',
    description:
      'Primary is solid, secondary is outlined and tertiary is text only. Any of them can be destructive.',
    Page: ButtonPage,
  },
  {
    path: 'text-input',
    label: 'Text input',
    group: 'Components',
    eyebrow: 'Component',
    description:
      'A single-line field with a visible label, helper text, and errors that are announced, not just coloured.',
    Page: TextInputPage,
  },
  {
    path: 'dropdown',
    label: 'Dropdown',
    group: 'Components',
    eyebrow: 'Component',
    description:
      'A single-select dropdown that follows the WAI-ARIA select-only combobox pattern, with full keyboard support.',
    Page: DropdownPage,
  },
  {
    path: 'checkbox',
    label: 'Checkbox',
    group: 'Components',
    eyebrow: 'Component',
    description:
      'A native checkbox with soft corners, plus a group for several options. Supports a “select all” mixed state.',
    Page: CheckboxPage,
  },
  {
    path: 'radio-group',
    label: 'Radio group',
    group: 'Components',
    eyebrow: 'Component',
    description:
      'Choose exactly one of a few options. It uses native radios, so the arrow keys and the single Tab stop come from the browser.',
    Page: RadioGroupPage,
  },
  {
    path: 'dialog',
    label: 'Dialog',
    group: 'Components',
    eyebrow: 'Component',
    description:
      'A modal dialog built on the native <dialog> element. Focus moves in, stays in, and comes back. Use alert dialogs to confirm destructive actions.',
    Page: DialogPage,
  },
];

export const ROUTE_PATHS = ROUTES.map((route) => route.path);
export const DEFAULT_PATH = 'overview';
