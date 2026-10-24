import type { ComponentType } from 'react';
import { AccordionPage } from './pages/AccordionPage';
import { AlertPage } from './pages/AlertPage';
import { BadgePage } from './pages/BadgePage';
import { BreadcrumbsPage } from './pages/BreadcrumbsPage';
import { ButtonPage } from './pages/ButtonPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { ComboboxPage } from './pages/ComboboxPage';
import { DialogPage } from './pages/DialogPage';
import { DropdownPage } from './pages/DropdownPage';
import { LinkPage } from './pages/LinkPage';
import { MenuPage } from './pages/MenuPage';
import { OverviewPage } from './pages/OverviewPage';
import { PaginationPage } from './pages/PaginationPage';
import { PasswordInputPage } from './pages/PasswordInputPage';
import { PopoverPage } from './pages/PopoverPage';
import { ProgressPage } from './pages/ProgressPage';
import { RadioGroupPage } from './pages/RadioGroupPage';
import { SearchInputPage } from './pages/SearchInputPage';
import { SpinnerPage } from './pages/SpinnerPage';
import { SwitchPage } from './pages/SwitchPage';
import { TabsPage } from './pages/TabsPage';
import { TextInputPage } from './pages/TextInputPage';
import { TextareaPage } from './pages/TextareaPage';
import { ToastPage } from './pages/ToastPage';
import { TooltipPage } from './pages/TooltipPage';

export interface DemoRoute {
  path: string;
  label: string;
  group: 'Foundations' | 'Inputs' | 'Navigation and disclosure' | 'Overlays and feedback';
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
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'Primary is solid, secondary is outlined and tertiary is text only. Any of them can be destructive.',
    Page: ButtonPage,
  },
  {
    path: 'text-input',
    label: 'Text input',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A single-line field with a visible label, helper text, and errors that are announced, not just coloured.',
    Page: TextInputPage,
  },
  {
    path: 'password-input',
    label: 'Password input',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A password field with a Show password toggle that keeps focus and your text exactly where they were.',
    Page: PasswordInputPage,
  },
  {
    path: 'search-input',
    label: 'Search input',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A native search field with a named Clear search button, Escape to clear and Enter to search.',
    Page: SearchInputPage,
  },
  {
    path: 'textarea',
    label: 'Textarea',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A multi-line field with the same label, helper text and error handling as the text input, plus an optional character counter.',
    Page: TextareaPage,
  },
  {
    path: 'dropdown',
    label: 'Dropdown',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A single-select dropdown that follows the WAI-ARIA select-only combobox pattern, with full keyboard support.',
    Page: DropdownPage,
  },
  {
    path: 'combobox',
    label: 'Combobox',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A select you can type into. It filters as you type, announces how many options match, and always holds a real option.',
    Page: ComboboxPage,
  },
  {
    path: 'checkbox',
    label: 'Checkbox',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'A native checkbox with soft corners, plus a group for several options. Supports a “select all” mixed state.',
    Page: CheckboxPage,
  },
  {
    path: 'radio-group',
    label: 'Radio group',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'Choose exactly one of a few options. It uses native radios, so the arrow keys and the single Tab stop come from the browser.',
    Page: RadioGroupPage,
  },
  {
    path: 'switch',
    label: 'Switch',
    group: 'Inputs',
    eyebrow: 'Component',
    description:
      'An on/off control for settings that apply immediately. A native checkbox underneath, so Space and forms just work.',
    Page: SwitchPage,
  },
  {
    path: 'link',
    label: 'Link',
    group: 'Navigation and disclosure',
    eyebrow: 'Component',
    description:
      'Always underlined, so it never relies on colour. External links open a new tab and say so.',
    Page: LinkPage,
  },
  {
    path: 'breadcrumbs',
    label: 'Breadcrumbs',
    group: 'Navigation and disclosure',
    eyebrow: 'Component',
    description:
      'Shows where you are in a hierarchy, as a labelled list with the current page marked.',
    Page: BreadcrumbsPage,
  },
  {
    path: 'pagination',
    label: 'Pagination',
    group: 'Navigation and disclosure',
    eyebrow: 'Component',
    description:
      'Previous, next and numbered pages, with the current page marked and each change announced.',
    Page: PaginationPage,
  },
  {
    path: 'tabs',
    label: 'Tabs',
    group: 'Navigation and disclosure',
    eyebrow: 'Component',
    description:
      'Switch between related panels on one page. Arrow keys move between tabs; only the selected tab is a Tab stop.',
    Page: TabsPage,
  },
  {
    path: 'accordion',
    label: 'Accordion',
    group: 'Navigation and disclosure',
    eyebrow: 'Component',
    description:
      'Sections that open and close. Each title is a heading with a real button inside, following the WAI-ARIA accordion pattern.',
    Page: AccordionPage,
  },
  {
    path: 'alert',
    label: 'Alert',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A message that stays in the page. Meaning comes from an icon and text as well as colour, and it is silent unless you ask it to be announced.',
    Page: AlertPage,
  },
  {
    path: 'badge',
    label: 'Badge',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A short status label. Always has words, so colour is never the only clue.',
    Page: BadgePage,
  },
  {
    path: 'progress',
    label: 'Progress',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A progress bar with a visible label. Determinate or indeterminate, and still when motion is reduced.',
    Page: ProgressPage,
  },
  {
    path: 'spinner',
    label: 'Spinner',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A loading indicator with a spoken label. It fades instead of spinning for people who prefer reduced motion.',
    Page: SpinnerPage,
  },
  {
    path: 'dialog',
    label: 'Dialog',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A modal dialog built on the native <dialog> element. Focus moves in, stays in, and comes back. Use alert dialogs to confirm destructive actions.',
    Page: DialogPage,
  },
  {
    path: 'popover',
    label: 'Popover',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A small floating panel opened from a button. The page stays usable; Escape closes it and returns you to the button.',
    Page: PopoverPage,
  },
  {
    path: 'menu',
    label: 'Menu',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A list of actions opened from a button, with arrow keys, type-ahead and focus that returns to where you were.',
    Page: MenuPage,
  },
  {
    path: 'tooltip',
    label: 'Tooltip',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'A short hint on hover or focus. It is dismissible, hoverable and never the only place information lives.',
    Page: TooltipPage,
  },
  {
    path: 'toast',
    label: 'Toast',
    group: 'Overlays and feedback',
    eyebrow: 'Component',
    description:
      'Brief messages that appear without taking focus, announced through live regions and paused while you read.',
    Page: ToastPage,
  },
];

export const ROUTE_PATHS = ROUTES.map((route) => route.path);
export const DEFAULT_PATH = 'overview';
