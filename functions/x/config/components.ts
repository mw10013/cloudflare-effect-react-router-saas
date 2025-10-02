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

export function getCategory(slug: string): ComponentCategory | undefined {
  return categories.find((category) => category.slug === slug)
}
