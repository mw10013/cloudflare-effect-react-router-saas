export interface Category {
  slug: string;
  name: string;
  components: { name: string }[];
}

export const categories: Category[] = [
  {
    name: "Autocomplete",
    slug: "autocomplete",
    components: [],
  },
  {
    name: "Button",
    slug: "button",
    components: [
      { name: "oui-button-demo" },
      { name: "oui-button-demo-outline" },
      { name: "oui-button-demo-ghost" },
      { name: "oui-button-demo-destructive" },
      { name: "oui-button-demo-secondary" },
      { name: "oui-button-demo-link" },
      { name: "oui-button-demo-icon-left" },
      { name: "oui-button-demo-icon-right" },
      { name: "oui-button-demo-disabled" },
      { name: "oui-button-demo-disabled-animation" },
      { name: "oui-button-demo-sm" },
      { name: "oui-button-demo-lg" },
    ],
  },
  {
    name: "Checkbox",
    slug: "checkbox",
    components: [],
  },
  {
    name: "Checkbox Group",
    slug: "checkbox-group",
    components: [],
  },
  {
    name: "Combo Box",
    slug: "combo-box",
    components: [],
  },
  {
    name: "Dialog",
    slug: "dialog",
    components: [
      { name: "oui-dialog-ex-demo-form" },
      { name: "oui-dialog-ex-demo-scrollable-content" },
      { name: "oui-dialog-ex-demo-sticky-footer" },
      { name: "oui-dialog-ex-demo-alert" },
      { name: "oui-dialog-ex-alert-demo-confirm" },
      { name: "oui-dialog-ex-alert-demo-ack" },
      { name: "oui-dialog-ex-alert-demo-programmatic" },
      { name: "oui-dialog-ex" },
      { name: "oui-dialog-ex-alert" },
      { name: "oui-dialog-ex-sheet" },
    ],
  },
  {
    name: "Disclosure",
    slug: "disclosure",
    components: [],
  },
  {
    name: "Field Error",
    slug: "field-error",
    components: [],
  },
  {
    name: "Form",
    slug: "form",
    components: [],
  },
  {
    name: "Group",
    slug: "group",
    components: [],
  },
  {
    name: "Header",
    slug: "header",
    components: [],
  },
  {
    name: "Heading",
    slug: "heading",
    components: [],
  },
  {
    name: "Input",
    slug: "input",
    components: [
      { name: "oui-input-demo" },
      { name: "oui-input-demo-password" },
      { name: "oui-input-demo-disabled" },
    ],
  },
  {
    name: "Keyboard",
    slug: "keyboard",
    components: [],
  },
  {
    name: "Label",
    slug: "label",
    components: [],
  },
  {
    name: "Link",
    slug: "link",
    components: [],
  },
  {
    name: "List Box",
    slug: "list-box",
    components: [],
  },
  {
    name: "Menu",
    slug: "menu",
    components: [],
  },
  {
    name: "Modal",
    slug: "modal",
    components: [{ name: "oui-modal-ex" }, { name: "oui-modal-ex-sheet" }],
  },
  {
    name: "Number Field",
    slug: "number-field",
    components: [],
  },
  {
    name: "Popover",
    slug: "popover",
    components: [],
  },
  {
    name: "Radio Group",
    slug: "radio-group",
    components: [],
  },
  {
    name: "Search Field",
    slug: "search-field",
    components: [{ name: "oui-search-field-ex" }],
  },
  {
    name: "Select",
    slug: "select",
    components: [],
  },
  {
    name: "Separator",
    slug: "separator",
    components: [],
  },
  {
    name: "Sidebar",
    slug: "sidebar",
    components: [],
  },
  {
    name: "Slider",
    slug: "slider",
    components: [],
  },
  {
    name: "Switch",
    slug: "switch",
    components: [
      { name: "oui-switch-ex-demo" },
      { name: "oui-switch-ex-demo-blue" },
      { name: "oui-switch-ex-demo-description" },
      { name: "oui-switch-ex-demo-disabled" },
      { name: "oui-switch-ex" },
    ],
  },
  {
    name: "Table",
    slug: "table",
    components: [],
  },
  {
    name: "Text",
    slug: "text",
    components: [],
  },
  {
    name: "Text Area",
    slug: "text-area",
    components: [],
  },
  {
    name: "Text Field",
    slug: "text-field",
    components: [
      { name: "oui-text-field-ex-demo" },
      { name: "oui-text-field-ex-horizontal-demo" },
      { name: "oui-text-field-ex" },
      { name: "oui-text-field-ex-horizontal" },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
