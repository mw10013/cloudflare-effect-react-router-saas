export interface ComponentCategory {
  slug: string;
  name: string;
  components: { name: string }[];
  isNew?: boolean;
}

export const categories: ComponentCategory[] = [
  {
    slug: "button",
    name: "Button",
    components: [],
  },
  {
    slug: "link",
    name: "Link",
    components: [],
  },
];
