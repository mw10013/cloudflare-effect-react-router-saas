# Tree

## Example

This example's MyTreeItemContent is from the Reusable Wrappers section below.

```typescript
import {
  Button,
  Collection,
  Tree,
  TreeItem,
  TreeItemContent
} from 'react-aria-components';

<Tree
  aria-label="Files"
  style={{ height: '300px' }}
  defaultExpandedKeys={['documents', 'photos', 'project']}
  selectionMode="multiple"
  defaultSelectedKeys={['photos']}
>
  <TreeItem id="documents" textValue="Documents">
    <MyTreeItemContent>
      Documents
      <Button aria-label="Info">ⓘ</Button>
    </MyTreeItemContent>
    <TreeItem id="project" textValue="Project">
      <MyTreeItemContent>
        Project
        <Button aria-label="Info">ⓘ</Button>
      </MyTreeItemContent>
      <TreeItem id="report" textValue="Weekly Report">
        <MyTreeItemContent>
          Weekly Report
          <Button aria-label="Info">ⓘ</Button>
        </MyTreeItemContent>
      </TreeItem>
    </TreeItem>
  </TreeItem>
  <TreeItem id="photos" textValue="Photos">
    <MyTreeItemContent>
      Photos
      <Button aria-label="Info">ⓘ</Button>
    </MyTreeItemContent>
    <TreeItem id="one" textValue="Image 1">
      <MyTreeItemContent>
        Image 1
        <Button aria-label="Info">ⓘ</Button>
      </MyTreeItemContent>
    </TreeItem>
    <TreeItem id="two" textValue="Image 2">
      <MyTreeItemContent>
        Image 2
        <Button aria-label="Info">ⓘ</Button>
      </MyTreeItemContent>
    </TreeItem>
  </TreeItem>
</Tree>
```

## Features

A tree can be built using the `<ul>`, `<li>`, and `<ol>`, but is very limited in functionality especially when it comes to user interactions. HTML lists are meant for static content, rather than hierarchies with rich interactions like focusable elements within cells, keyboard navigation, item selection, sorting, etc. `Tree` helps achieve accessible and interactive tree components that can be styled as needed.

- Item selection – Single or multiple selection, with optional checkboxes, disabled items, and both `toggle` and `replace` selection behaviors.
- Interactive children – Tree items may include interactive elements such as buttons, menus, etc.
- Actions – Items support optional actions such as navigation via click, tap, double click, or Enter key.
- Keyboard navigation – Tree items and focusable children can be navigated using the arrow keys, along with page up/down, home/end, etc. Typeahead, auto scrolling, and selection modifier keys are supported as well.
- Virtualized scrolling – Use `Virtualizer` to improve performance of large lists by rendering only the visible items.
- Touch friendly – Selection and actions adapt their behavior depending on the device. For example, selection is activated via long press on touch when item actions are present.
- Accessible – Follows the ARIA treegrid pattern, with additional selection announcements via an ARIA live region. Extensively tested across many devices and assistive technologies to ensure announcements and behaviors are consistent.

## Anatomy

### Concepts

`Tree` makes use of the following concepts:

- Collections
- Selection

### Composed components

A `Tree` uses the following components, which may also be used standalone or reused in other components:

- Checkbox
- Button

### Example

```typescript
import {
  Button,
  Checkbox,
  Tree,
  TreeItem,
  TreeItemContent
} from 'react-aria-components';

<Tree>
  <TreeItem>
    <TreeItemContent>
      <Button slot="chevron" />
      <Checkbox slot="selection" />
    </TreeItemContent>
    <TreeItem>
      {/* ... */}
    </TreeItem>
  </TreeItem>
</Tree>
```

## Reusable wrappers

If you will use a Tree in multiple places in your app, you can wrap all of the pieces into a reusable component. This way, the DOM structure, styling code, and other logic are defined in a single place and reused everywhere to ensure consistency.

### Example

```typescript
import type {
  TreeItemContentProps,
  TreeItemContentRenderProps
} from 'react-aria-components';
import {Button} from 'react-aria-components';

function MyTreeItemContent(
  props: Omit<TreeItemContentProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  return (
    <TreeItemContent>
      {(
        { hasChildItems, selectionBehavior, selectionMode }: TreeItemContentRenderProps
      ) => (
        <>
          {selectionBehavior === 'toggle' &&
            selectionMode !== 'none' && (
            <MyCheckbox slot="selection" />
          )}
          <Button slot="chevron">
            <svg viewBox="0 0 24 24">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Button>
          {props.children}
        </>
      )}
    </TreeItemContent>
  );
}

interface MyTreeItemProps extends Partial<TreeItemProps> {
  title: string;
}

function MyTreeItem(props: MyTreeItemProps) {
  return (
    <TreeItem textValue={props.title} {...props}>
      <MyTreeItemContent>
        {props.title}
      </MyTreeItemContent>
      {props.children}
    </TreeItem>
  );
}

<Tree
  aria-label="Files"
  style={{ height: '300px' }}
  defaultExpandedKeys={['documents', 'photos', 'project']}
>
  <MyTreeItem title="Documents">
    <MyTreeItem title="Project">
      <MyTreeItem title="Weekly Report" />
    </MyTreeItem>
  </MyTreeItem>
  <MyTreeItem title="Photos">
    <MyTreeItem title="Image 1" />
    <MyTreeItem title="Image 2" />
  </MyTreeItem>
</Tree>
```
