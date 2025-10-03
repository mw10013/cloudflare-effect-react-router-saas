export interface ComponentCategory {
  slug: string;
  name: string;
  components: { name: string }[];
}

export const categories: ComponentCategory[] = [
  {
    slug: "autocomplete",
    name: "Autocomplete",
    components: [],
  },
  {
    slug: "button",
    name: "Button",
    components: [{ name: "button-demo" }, { name: "button-demo-disabled" }],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    components: [],
  },
  {
    slug: "checkbox-group",
    name: "Checkbox Group",
    components: [],
  },
  {
    slug: "combo-box",
    name: "Combo Box",
    components: [],
  },
  {
    slug: "dialog",
    name: "Dialog",
    components: [],
  },
  {
    slug: "disclosure",
    name: "Disclosure",
    components: [],
  },
  {
    slug: "field-error",
    name: "Field Error",
    components: [],
  },
  {
    slug: "form",
    name: "Form",
    components: [],
  },
  {
    slug: "group",
    name: "Group",
    components: [],
  },
  {
    slug: "header",
    name: "Header",
    components: [],
  },
  {
    slug: "heading",
    name: "Heading",
    components: [],
  },
  {
    slug: "input",
    name: "Input",
    components: [
      { name: "input-demo" },
      { name: "input-demo-password" },
      { name: "input-demo-disabled" },
    ],
  },
  {
    slug: "keyboard",
    name: "Keyboard",
    components: [],
  },
  {
    slug: "label",
    name: "Label",
    components: [],
  },
  {
    slug: "link",
    name: "Link",
    components: [],
  },
  {
    slug: "list-box",
    name: "List Box",
    components: [],
  },
  {
    slug: "menu",
    name: "Menu",
    components: [],
  },
  {
    slug: "modal",
    name: "Modal",
    components: [],
  },
  {
    slug: "number-field",
    name: "Number Field",
    components: [],
  },
  {
    slug: "popover",
    name: "Popover",
    components: [],
  },
  {
    slug: "radio-group",
    name: "Radio Group",
    components: [],
  },
  {
    slug: "search-field",
    name: "Search Field",
    components: [],
  },
  {
    slug: "select",
    name: "Select",
    components: [],
  },
  {
    slug: "separator",
    name: "Separator",
    components: [],
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    components: [],
  },
  {
    slug: "slider",
    name: "Slider",
    components: [],
  },
  {
    slug: "switch",
    name: "Switch",
    components: [],
  },
  {
    slug: "table",
    name: "Table",
    components: [],
  },
  {
    slug: "text",
    name: "Text",
    components: [],
  },
  {
    slug: "text-area",
    name: "Text Area",
    components: [],
  },
  {
    slug: "text-field",
    name: "Text Field",
    components: [{ name: "text-field-ex" }],
  },
];

export function getCategory(slug: string): ComponentCategory | undefined {
  return categories.find((category) => category.slug === slug);
}
