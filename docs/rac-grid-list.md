# GridList

A grid list displays a list of interactive items, with support for keyboard navigation, single or multiple selection, and row actions.

| Command                                          | Version |
| :----------------------------------------------- | :------ |
| `yarn add react-aria-components`                 | 1.9.0   |
| `import {GridList} from 'react-aria-components'` |         |

[View ARIA pattern W3C](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
[View repository GitHub](https://github.com/adobe/react-spectrum/tree/main/packages/react-aria-components)
[View package NPM](https://www.npmjs.com/package/react-aria-components)

## Example

```typescript
import {
  Button,
  GridList,
  GridListItem
} from 'react-aria-components';
import {MyCheckbox} from './Checkbox'; // Assuming MyCheckbox is defined

<GridList
  aria-label="Favorite pokemon"
  selectionMode="multiple"
>
  <GridListItem textValue="Charizard">
    <MyCheckbox slot="selection" />
    Charizard
    <Button aria-label="Info">ⓘ</Button>
  </GridListItem>
  <GridListItem textValue="Blastoise">
    <MyCheckbox slot="selection" />
    Blastoise
    <Button aria-label="Info">ⓘ</Button>
  </GridListItem>
  <GridListItem textValue="Venusaur">
    <MyCheckbox slot="selection" />
    Venusaur
    <Button aria-label="Info">ⓘ</Button>
  </GridListItem>
  <GridListItem textValue="Pikachu">
    <MyCheckbox slot="selection" />
    Pikachu
    <Button aria-label="Info">ⓘ</Button>
  </GridListItem>
</GridList>
```

## Features

A list can be built using `<ul>` or `<ol>` HTML elements, but does not support any user interactions. HTML lists are meant for static content, rather than lists with rich interactions like focusable elements within rows, keyboard navigation, row selection, etc. `GridList` helps achieve accessible and interactive list components that can be styled as needed.

- **Item selection** – Single or multiple selection, with optional checkboxes, disabled rows, and both `toggle` and `replace` selection behaviors.
- **Interactive children** – List items may include interactive elements such as buttons, checkboxes, menus, etc.
- **Actions** – Items support optional row actions such as navigation via click, tap, double click, or Enter key.
- **Async loading** – Support for loading items asynchronously.
- **Keyboard navigation** – List items and focusable children can be navigated using the arrow keys, along with page up/down, home/end, etc. Typeahead, auto scrolling, and selection modifier keys are supported as well.
- **Drag and drop** – GridList supports drag and drop to reorder, insert, or update items via mouse, touch, keyboard, and screen reader interactions.
- **Virtualized scrolling** – Use [Virtualizer](https://react-spectrum.adobe.com/react-aria/Virtualizer.html) to improve performance of large lists by rendering only the visible items.
- **Touch friendly** – Selection and actions adapt their behavior depending on the device. For example, selection is activated via long press on touch when item actions are present.
- **Accessible** – Follows the [ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), with additional selection announcements via an ARIA live region. Extensively tested across many devices and [assistive technologies](https://react-spectrum.adobe.com/react-aria/accessibility.html#testing) to ensure announcements and behaviors are consistent.

Note: Use `GridList` when your list items may contain interactive elements such as buttons, checkboxes, menus, etc. within them. If your list items contain only static content such as text and images, then consider using [ListBox](https://react-spectrum.adobe.com/react-aria/ListBox.html) instead for a slightly better screen reader experience (especially on mobile).

## Anatomy

A grid list consists of a container element, with rows of data inside. The rows within a list may contain focusable elements or plain text content. If the list supports row selection, each row can optionally include a selection checkbox.

```typescript
import {
  Button,
  Checkbox,
  GridList,
  GridListItem
} from 'react-aria-components';

<GridList>
  <GridListItem>
    <Button slot="drag" />
    <Checkbox slot="selection" />
  </GridListItem>
</GridList>
```

### Concepts

`GridList` makes use of the following concepts:

- [Collections](https://react-spectrum.adobe.com/react-aria/collections.html)
- [Selection](https://react-spectrum.adobe.com/react-aria/selection.html)
- [Drag and drop](https://react-spectrum.adobe.com/react-aria/dnd.html)

### Composed components

A `GridList` uses the following components, which may also be used standalone or reused in other components.

- [Checkbox](https://react-spectrum.adobe.com/react-aria/Checkbox.html)
- [Button](https://react-spectrum.adobe.com/react-aria/Button.html)

## Examples

- [iOS List View](https://react-spectrum.adobe.com/react-aria/examples/ios-list.html)

## Starter kits

To help kick-start your project, we offer starter kits that include example implementations of all React Aria components with various styling solutions. All components are fully styled, including support for dark mode, high contrast mode, and all UI states. Each starter comes with a pre-configured [Storybook](https://storybook.js.org/) that you can experiment with, or use as a starting point for your own component library.

- [Vanilla CSS Download ZIP](https://react-spectrum.adobe.com/react-aria-starter.3285e6b73.zip) | [Preview](https://react-spectrum.adobe.com/react-aria-starter/index.html?path=/docs/gridlist--docs)
- [Tailwind CSS Download ZIP](https://react-spectrum.adobe.com/react-aria-tailwind-starter.3285e6b73.zip) | [Preview](https://react-spectrum.adobe.com/react-aria-tailwind-starter/index.html?path=/docs/gridlist--docs)

## Reusable wrappers

If you will use a GridList in multiple places in your app, you can wrap all of the pieces into a reusable component. This way, the DOM structure, styling code, and other logic are defined in a single place and reused everywhere to ensure consistency.

This example wraps `GridList` and `GridListItem` to include a custom checkbox and drag handle automatically.

```typescript
import type {
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import { GridList, GridListItem, Button } from 'react-aria-components';
import {MyCheckbox} from './Checkbox'; // Assuming MyCheckbox is defined
import * as React from 'react';


export function MyGridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    <GridList {...props}>
      {children}
    </GridList>
  );
}

export function MyItem(
  { children, ...props }:
    & Omit<GridListItemProps, 'children'>
    & { children?: React.ReactNode }
) {
  let textValue = typeof children === 'string'
    ? children
    : undefined;
  return (
    <GridListItem textValue={textValue} {...props}>
      {(
        { selectionMode, selectionBehavior, allowsDragging }
      ) => (
        <>
          {allowsDragging && <Button slot="drag">≡</Button>}
          {selectionMode === 'multiple' &&
            selectionBehavior === 'toggle' && (
            <MyCheckbox slot="selection" />
          )}
          {children}
        </>
      )}
    </GridListItem>
  );
}

<MyGridList
  aria-label="Ice cream flavors"
  selectionMode="multiple"
>
  <MyItem>Chocolate</MyItem>
  <MyItem>Mint</MyItem>
  <MyItem>Strawberry</MyItem>
  <MyItem>Vanilla</MyItem>
</MyGridList>
```

## Content

Dynamic collections can be used when the data comes from an external data source.

```typescript
import type { GridListProps } from 'react-aria-components';
import { Button } from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

interface ItemValue {
  id: number;
  name: string;
}

function ExampleList(props: GridListProps<ItemValue>) {
  let rows = [
    { id: 1, name: 'Games' },
    { id: 2, name: 'Program Files' },
    { id: 3, name: 'bootmgr' },
    { id: 4, name: 'log.txt' }
  ];

  return (
    <MyGridList
      aria-label="Example dynamic collection List"
      selectionMode="multiple"
      items={rows}
      {...props}
    >
      {(item) => (
        <MyItem textValue={item.name} id={item.id}>
          {item.name}
          <Button
            aria-label="Info"
            onPress={() =>
              alert(`Info for ${item.name}...`)}
          >
            ⓘ
          </Button>
        </MyItem>
      )}
    </MyGridList>
  );
}
```

## Selection

### Single selection

Enable single selection using `selectionMode="single"`.

```typescript
// Using the ExampleList from above
<ExampleList
  aria-label="List with single selection"
  selectionMode="single"
  defaultSelectedKeys={[2]}/>
```

### Multiple selection

Enable multiple selection using `selectionMode="multiple"`.

```typescript
<ExampleList
  aria-label="List with multiple selection"
  selectionMode="multiple"
  defaultSelectedKeys={[2, 4]} />
```

### Disallow empty selection

Use `disallowEmptySelection` to force at least one item to be selected.

```typescript
<ExampleList
  aria-label="List with disallowed empty selection"
  selectionMode="multiple"
  defaultSelectedKeys={[2]}
  disallowEmptySelection/>
```

### Controlled selection

Control selection programmatically using `selectedKeys` and `onSelectionChange`.

```typescript
import type {Selection, GridListProps} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components
import * as React from 'react';

interface ItemValue { // Assuming ItemValue is defined as in previous examples
  id: number;
  name: string;
}

function PokemonList(props: GridListProps<ItemValue>) {
  let rows = [
    { id: 1, name: 'Charizard' },
    { id: 2, name: 'Blastoise' },
    { id: 3, name: 'Venusaur' },
    { id: 4, name: 'Pikachu' }
  ];

  let [selectedKeys, setSelectedKeys] = React.useState<
    Selection
  >(new Set([2]));

  return (
    <MyGridList
      aria-label="List with controlled selection"
      items={rows}
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      {...props}
    >
      {(item) => <MyItem id={item.id}>{item.name}</MyItem>}
    </MyGridList>
  );
}
```

### Selection behavior

Default is `"toggle"`. Use `selectionBehavior="replace"` for replace behavior.

```typescript
<PokemonList // Assuming PokemonList is defined as above
  aria-label="List with replace selection behavior"
  selectionMode="multiple"
  selectionBehavior="replace"/>
```

## Row actions

Use `onAction` for row actions.

```typescript
// Using ExampleList defined earlier
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
  <ExampleList
    aria-label="Checkbox selection list with row actions"
    selectionMode="multiple"
    selectionBehavior="toggle"
    onAction={key => alert(`Opening item ${key}...`)}
  />
  <ExampleList
    aria-label="Highlight selection list with row actions"
    selectionMode="multiple"
    selectionBehavior="replace"
    onAction={key => alert(`Opening item ${key}...`)}
  />
</div>
```

`onAction` can also be applied directly to `GridListItem`.

```typescript
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

<MyGridList
  aria-label="List with onAction applied on the rows directly"
  selectionMode="multiple"
>
  <MyItem onAction={() => alert(`Opening Games`)}>
    Games
  </MyItem>
  <MyItem onAction={() => alert(`Opening Program Files`)}>
    Program Files
  </MyItem>
  <MyItem onAction={() => alert(`Opening bootmgr`)}>
    bootmgr
  </MyItem>
  <MyItem onAction={() => alert(`Opening log.txt`)}>
    log.txt
  </MyItem>
</MyGridList>
```

### Links

Items can be links using the `href` prop on `GridListItem`.

```typescript
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

<MyGridList aria-label="Links" selectionMode="multiple">
  <MyItem href="https://adobe.com/" target="_blank">
    Adobe
  </MyItem>
  <MyItem href="https://apple.com/" target="_blank">
    Apple
  </MyItem>
  <MyItem href="https://google.com/" target="_blank">
    Google
  </MyItem>
  <MyItem href="https://microsoft.com/" target="_blank">
    Microsoft
  </MyItem>
</MyGridList>
```

#### Client side routing

`<GridListItem>` works with client-side routers via `RouterProvider`. See the [client side routing guide](https://react-spectrum.adobe.com/react-aria/routing.html).

## Disabled items

Disable items using `isDisabled` on `GridListItem` or `disabledKeys` on `GridList`.
The `disabledBehavior` prop on `GridList` can alter this (default is `all`, `selection` allows other interactions).

```typescript
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

<MyGridList
  aria-label="List with disabled rows"
  selectionMode="multiple"
>
  <MyItem>Charizard</MyItem>
  <MyItem>Blastoise</MyItem>
  <MyItem isDisabled>Venusaur</MyItem>
  <MyItem>Pikachu</MyItem>
</MyGridList>
```

```typescript
<MyGridList
  aria-label="List with disabled rows"
  selectionMode="multiple"
  disabledBehavior="selection">
  <MyItem>Charizard</MyItem>
  <MyItem>Blastoise</MyItem>
  <MyItem isDisabled>Venusaur</MyItem>
  <MyItem>Pikachu</MyItem>
</MyGridList>
```

```typescript
// Using PokemonList defined earlier
<PokemonList
  aria-label="List with disabled rows"
  selectionMode="multiple"
  disabledKeys={[3]}/>
```

## Asynchronous loading

Use [useAsyncList](https://react-spectrum.adobe.com/react-stately/useAsyncList.html) for asynchronous data loading.

```typescript
import {useAsyncList} from 'react-stately';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

interface Character {
  name: string;
}

function AsyncList() {
  let list = useAsyncList<Character>({
    async load({ signal, cursor }) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(
        cursor ||
          `https://swapi.py4e.com/api/people/?search=`,
        { signal }
      );
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <MyGridList
      selectionMode="multiple"
      aria-label="Async loading ListView example"
      items={list.items}
    >
      {(item) => <MyItem id={item.name}>{item.name}
      </MyItem>}
    </MyGridList>
  );
}
```

## Empty state

Use `renderEmptyState` to customize the display when there are no items.

```typescript
import { GridList } from 'react-aria-components';

<GridList
  aria-label="Search results"
  renderEmptyState={() => 'No results found.'}>
  {[]}
</GridList>
```

## Drag and drop

GridList supports drag and drop via `useDragAndDrop` and the `dragAndDropHooks` prop. Draggable items need a `<Button slot="drag">`.

### Reorderable

Enable reordering with `onReorder`.

```typescript
import {useListData} from 'react-stately';
import {useDragAndDrop} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

function Example() {
  let list = useListData({
    initialItems: [
      { id: 1, name: 'Adobe Photoshop' },
      { id: 2, name: 'Adobe XD' },
      { id: 3, name: 'Adobe Dreamweaver' },
      { id: 4, name: 'Adobe InDesign' },
      { id: 5, name: 'Adobe Connect' }
    ]
  });

  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        'text/plain': list.getItem(key).name
      })),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });
  return (
    <MyGridList
      aria-label="Reorderable list"
      selectionMode="multiple"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
    >
      {(item) => <MyItem id={item.id}>{item.name}</MyItem>}
    </MyGridList>
  );
}
```

### Custom drag preview

Render a custom drag preview with `renderDragPreview`.

```typescript
import {useListData} from 'react-stately'; // Assuming useListData is set up
import {useDragAndDrop, DragItem} from 'react-aria-components';

function Example() {
  const list = useListData({ initialItems: [{id:1, name: "Item 1"}] }); // Example list data
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => // getItems must be provided
      [...keys].map((key) => ({
        'text/plain': list.getItem(key).name
      })),
    renderDragPreview(items: DragItem[]) { // Explicitly type items
      return (
        <div className="drag-preview">
          {items[0]['text/plain']}
          <span className="badge">{items.length}</span>
        </div>
      );
    }
  });
  // ... return a MyGridList or GridList component using dragAndDropHooks
  return <div/>;
}
```

### Drag data

Provide multiple data formats in `getItems`.

```typescript
import {useDragAndDrop} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components
import * as React from 'react'; // Import React

function DraggableGridList() {
  let items = new Map([
    ['ps', { name: 'Photoshop', style: 'strong' as const }],
    ['xd', { name: 'XD', style: 'strong' as const }],
    ['id', { name: 'InDesign', style: 'strong' as const }],
    ['dw', { name: 'Dreamweaver', style: 'em' as const }],
    ['co', { name: 'Connect', style: 'em' as const }]
  ]);

  let { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        let item = items.get(key as string)!;
        return {
          'text/plain': item.name,
          'text/html':
            `<${item.style}>${item.name}</${item.style}>`,
          'custom-app-type': JSON.stringify({
            id: key,
            ...item
          })
        };
      });
    }
  });

  return (
    <MyGridList
      aria-label="Draggable list"
      selectionMode="multiple"
      items={Array.from(items.entries())} // Convert Map to Array for items prop
      dragAndDropHooks={dragAndDropHooks}
    >
      {([id, item]) => ( // Destructure the array entry
        <MyItem id={id} textValue={item.name}>
          {React.createElement(
            item.style || 'span',
            null,
            item.name
          )}
        </MyItem>
      )}
    </MyGridList>
  );
}

// <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//   <DraggableGridList />
//   <DroppableGridList /> {/* Defined below */}
// </div>
```

### Dropping on the collection

Enable dropping on the list with `onRootDrop`.

```typescript
import * as React from 'react';
import {useDragAndDrop, GridListItem, DropItem} from 'react-aria-components';
import { MyGridList } from './ReusableGridListComponents'; // Assuming MyGridList is defined
import { DraggableGridList } from './DraggableGridList'; // Assuming DraggableGridList is defined

interface Item {
  id: number;
  name: string;
}

function Example() {
  let [items, setItems] = React.useState<Item[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items.map(async (item: DropItem, i: number) => { // Explicitly type item and i
          let name = item.kind === 'text'
            ? await item.getText('text/plain')
            : item.name;
          return { id: i, name };
        })
      );
      setItems(droppedItems);
    }
  });

  return (
    <div
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
    >
      <DraggableGridList />
      <MyGridList
        aria-label="Droppable list"
        items={items}
        dragAndDropHooks={dragAndDropHooks}
        renderEmptyState={() => 'Drop items here'}
      >
        {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
      </MyGridList>
    </div>
  );
}
```

### Dropping on items

Enable dropping on items with `onItemDrop`.

```typescript
import {useDragAndDrop} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components
import { DraggableGridList } from './DraggableGridList'; // Assuming DraggableGridList is defined

function Example() {
  let { dragAndDropHooks } = useDragAndDrop({
    onItemDrop(e) {
      alert(`Dropped on ${e.target.key}`);
    }
  });

  return (
    <div
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
    >
      <DraggableGridList />
      <MyGridList
        aria-label="Droppable list"
        dragAndDropHooks={dragAndDropHooks}
      >
        <MyItem id="applications">Applications</MyItem>
        <MyItem id="documents">Documents</MyItem>
        <MyItem id="pictures">Pictures</MyItem>
      </MyGridList>
    </div>
  );
}
```

### Dropping between items

Enable dropping between items with `onInsert`. Style `.react-aria-DropIndicator`.

```typescript
import {useListData} from 'react-stately';
import {useDragAndDrop, GridListItem, DropIndicator, DropIndicatorProps, DropItem} from 'react-aria-components';
import { MyGridList } from './ReusableGridListComponents'; // Assuming MyGridList is defined
import { DraggableGridList } from './DraggableGridList'; // Assuming DraggableGridList is defined
import * as React from 'react';


function Example() {
  let list = useListData({
    initialItems: [
      { id: 1, name: 'Illustrator' },
      { id: 2, name: 'Premiere' },
      { id: 3, name: 'Acrobat' }
    ]
  });

  let { dragAndDropHooks } = useDragAndDrop({
    async onInsert(e) {
      let itemsToInsert = await Promise.all(
        e.items.map(async (item: DropItem) => { // Explicitly type item
          let name = item.kind === 'text'
            ? await item.getText('text/plain')
            : item.name;
          return { id: Math.random(), name };
        })
      );

      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...itemsToInsert);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...itemsToInsert);
      }
    },
    renderDropIndicator(target) { // Example of custom drop indicator
      return (
        <DropIndicator
          target={target}
          className={({ isDropTarget }: DropIndicatorProps) => // Explicitly type render props
            `my-drop-indicator ${
              isDropTarget ? 'active' : ''
            }`}
        />
      );
    }
  });

  return (
    <div
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
    >
      <DraggableGridList />
      <MyGridList
        aria-label="Droppable list"
        items={list.items}
        dragAndDropHooks={dragAndDropHooks}
      >
        {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
      </MyGridList>
    </div>
  );
}
```

### Drop data types

- **Text**: `TextDropItem` for textual data. Use `acceptedDragTypes` to filter.
- **Files**: `FileDropItem` for files.
- **Directories**: `DirectoryDropItem` for directories. Use `DIRECTORY_DRAG_TYPE`.

#### Text Example

```typescript
import * as React from 'react';
import {isTextDropItem, useDragAndDrop, DropItem} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components
import { DraggableGridList } from './DraggableGridList'; // Assuming DraggableGridList is defined

interface TextItem {
  id: string;
  name: string;
  style: string;
}

function DroppableGridList() {
  let [items, setItems] = React.useState<TextItem[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ['custom-app-type'],
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item: DropItem) => // Explicitly type item
            JSON.parse(
              await item.getText('custom-app-type')
            )
          )
      );
      setItems(droppedItems);
    }
  });

  return (
    <MyGridList
      aria-label="Droppable list"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop items here'}
    >
      {(item) => (
        <MyItem id={item.id} textValue={item.name}>
          {React.createElement(
            item.style || 'span',
            null,
            item.name
          )}
        </MyItem>
      )}
    </MyGridList>
  );
}

// <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//   <DraggableGridList />
//   <DroppableGridList />
// </div>
```

#### Files Example

```typescript
import * as React from 'react';
import {isFileDropItem, useDragAndDrop, DropItem} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

interface ImageItem {
  id: number;
  url: string;
  name: string;
}

function Example() {
  let [items, setItems] = React.useState<ImageItem[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ['image/jpeg', 'image/png'],
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items.filter(isFileDropItem).map(
          async (item: DropItem) => { // Explicitly type item
            if (item.kind === 'file') { // Check if item is FileDropItem
                const file = await item.getFile();
                return {
                    id: Math.random(),
                    url: URL.createObjectURL(file),
                    name: item.name
                };
            }
            return null; // Should not happen with isFileDropItem filter
          }
        )
      );
      setItems(droppedItems.filter(Boolean) as ImageItem[]); // Filter out nulls and cast
    }
  });

  return (
    <MyGridList
      aria-label="Droppable list"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop images here'}
    >
      {(item) => (
        <MyItem id={item.id} textValue={item.name}>
          <div className="image-item">
            <img src={item.url} alt={item.name} style={{maxWidth: '50px', maxHeight: '50px'}}/>
            <span>{item.name}</span>
          </div>
        </MyItem>
      )}
    </MyGridList>
  );
}
```

#### Directories Example

```typescript
import * as React from 'react';
// import FileIcon from '@spectrum-icons/workflow/FileTxt'; // Placeholder
// import FolderIcon from '@spectrum-icons/workflow/Folder'; // Placeholder
const FileIcon = () => <span>📄</span>; // Placeholder
const FolderIcon = () => <span>📁</span>; // Placeholder

import {
  DIRECTORY_DRAG_TYPE,
  isDirectoryDropItem,
  useDragAndDrop,
  DropItem
} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

interface DirItem {
  name: string;
  kind: 'file' | 'directory';
}

function Example() {
  let [files, setFiles] = React.useState<DirItem[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: [DIRECTORY_DRAG_TYPE],
    async onRootDrop(e) {
      const dir = e.items.find(isDirectoryDropItem);
      if (dir && dir.kind === 'directory') { // Check if dir is DirectoryDropItem
        let collectedFiles: DirItem[] = [];
        for await (let entry of dir.getEntries()) {
          collectedFiles.push({
            name: entry.name,
            kind: entry.kind,
          });
        }
        setFiles(collectedFiles);
      }
    }
  });

  return (
    <MyGridList
      aria-label="Droppable list"
      items={files}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop directory here'}
    >
      {(item) => (
        <MyItem id={item.name} textValue={item.name}>
          <div className="dir-item">
            {item.kind === 'directory'
              ? <FolderIcon />
              : <FileIcon />}
            <span>{item.name}</span>
          </div>
        </MyItem>
      )}
    </MyGridList>
  );
}
```

### Drop operations

- `onDragEnd`: Respond when drag ends.
- `getAllowedDropOperations`: Control allowed operations.
- `getDropOperation`: Provide feedback on hover.
- Drop events (`onInsert`, `onItemDrop`) include `dropOperation`.

#### onDragEnd Example

```typescript
import {useListData} from 'react-stately';
import {useDragAndDrop} from 'react-aria-components';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components
import { DroppableGridList } from './DroppableGridList'; // Assuming DroppableGridList is defined

interface Item { id: number; name: string; } // Define Item interface

function Example() {
  let list = useListData({
    initialItems: [
      { id: 1, name: 'Adobe Photoshop' },
      { id: 2, name: 'Adobe XD' },
      { id: 3, name: 'Adobe Dreamweaver' },
      { id: 4, name: 'Adobe InDesign' },
      { id: 5, name: 'Adobe Connect' }
    ] as Item[] // Cast to Item[]
  });

  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => // getItems must be provided
      [...keys].map((key) => ({
        'text/plain': list.getItem(key).name
      })),
    onDragEnd(e) {
      if (e.dropOperation === 'move') {
        list.remove(...e.keys);
      }
    }
  });

  return (
    <div
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
    >
      <MyGridList
        aria-label="Draggable list"
        selectionMode="multiple"
        items={list.items}
        dragAndDropHooks={dragAndDropHooks}
      >
        {(item) => <MyItem id={item.id}>{item.name}</MyItem>}
      </MyGridList>
      <DroppableGridList />
    </div>
  );
}
```

### Drag between lists

Example combining concepts for dragging items between lists.

```typescript
import * as React from 'react';
import {
  isTextDropItem,
  useDragAndDrop,
  DropItem,
  Selection
} from 'react-aria-components';
import {useListData} from 'react-stately';
import { MyGridList, MyItem } from './ReusableGridListComponents'; // Assuming reusable components

interface FileItem {
  id: string;
  name: string;
  type: string;
}

interface DndGridListProps {
  initialItems: FileItem[];
  'aria-label': string;
}

function DndGridList(props: DndGridListProps) {
  let list = useListData({
    initialItems: props.initialItems
  });

  let { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        let item = list.getItem(key);
        return {
          'custom-app-type': JSON.stringify(item),
          'text/plain': item.name
        };
      });
    },
    acceptedDragTypes: ['custom-app-type'],
    getDropOperation: () => 'move',
    async onInsert(e) {
      let processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item: DropItem) => // Explicitly type item
            JSON.parse(
              await item.getText('custom-app-type')
            )
          )
      );
      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...processedItems);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...processedItems);
      }
    },
    async onRootDrop(e) {
      let processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item: DropItem) => // Explicitly type item
            JSON.parse(
              await item.getText('custom-app-type')
            )
          )
      );
      list.append(...processedItems);
    },
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    onDragEnd(e) {
      if (e.dropOperation === 'move' && !e.isInternal) {
        list.remove(...e.keys);
      }
    }
  });

  return (
    <MyGridList
      aria-label={props['aria-label']}
      selectionMode="multiple"
      selectedKeys={list.selectedKeys}
      onSelectionChange={(keys: Selection) => list.setSelectedKeys(keys)}
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop items here'}
    >
      {(item) => <MyItem id={item.id}>{item.name}</MyItem>}
    </MyGridList>
  );
}

// <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//   <DndGridList
//     initialItems={[
//       { id: '1', type: 'file', name: 'Adobe Photoshop' }, /* ... more items */
//     ]}
//     aria-label="First GridList"
//   />
//   <DndGridList
//     initialItems={[
//       { id: '7', type: 'folder', name: 'Pictures' }, /* ... more items */
//     ]}
//     aria-label="Second GridList"
//   />
// </div>
```

## Props

### GridList

Refer to the [official documentation](https://react-spectrum.adobe.com/react-aria/GridList.html#props) for detailed props.

### GridListItem

A `<GridListItem>` defines an option. If children are not plain text, `textValue` must be set.

## Styling

Style with CSS selectors (`.react-aria-GridList`, `.react-aria-GridListItem`) or data attributes (`data-selected`, `data-focused`).
`className` and `style` props accept functions for dynamic styling. Render props can alter rendering based on state.

```css
.react-aria-GridList {
  /* ... */
}
.react-aria-GridListItem[data-selected] {
  /* ... */
}
```

```typescript
<GridListItem
  className={({ isSelected }) =>
    isSelected ? 'bg-blue-400' : 'bg-gray-100'}
>
  Item
</GridListItem>
```

```typescript
import { Checkbox, GridListItem } from "react-aria-components"; // Assuming Checkbox is imported

<GridListItem>
  {({selectionMode}) => (
    <>
      {selectionMode !== 'none' && <Checkbox slot="selection" />} {/* slot="selection" is common for checkboxes in lists */}
      Item
    </>
  )}
</GridListItem>
```

## Advanced customization

### Composition

Wrap components like `GridListItem` to customize props.

```typescript
import { GridListItem, GridListItemProps } from "react-aria-components";
import * as React from "react";

function MyItem(props: GridListItemProps) { // Add type for props
  return <GridListItem {...props} className={`my-item ${props.className || ''}`} /> // Merge classNames
}
```

### Contexts

Use exported contexts (e.g., `GridListContext`, `ToggleButtonContext`) to send props from parent elements.

```typescript
import type {SelectionMode} from 'react-aria-components';
import * as React from 'react';
import {
  GridListContext,
  ToggleButtonContext
} from 'react-aria-components';
// Assuming MyItem and ToggleButton are defined/imported
// import { MyItem } from './ReusableGridListComponents';
// import { ToggleButton, GridList } from 'react-aria-components';


function Selectable({ children }: { children: React.ReactNode }) {
  let [isSelected, onChange] = React.useState(false);
  let selectionMode: SelectionMode = isSelected
    ? 'multiple'
    : 'none';
  return (
    <ToggleButtonContext.Provider
      value={{ isSelected, onChange }}
    >
      <GridListContext.Provider value={{ selectionMode }}>
        {children}
      </GridListContext.Provider>
    </ToggleButtonContext.Provider>
  );
}

// Usage:
// <Selectable>
//   <ToggleButton style={{ marginBottom: '8px' }}>
//     Select
//   </ToggleButton>
//   <GridList aria-label="Ice cream flavors">
//     <MyItem>Chocolate</MyItem>
//     <MyItem>Mint</MyItem>
//     <MyItem>Strawberry</MyItem>
//     <MyItem>Vanilla</MyItem>
//   </GridList>
// </Selectable>
```

### Custom children

Consume contexts (e.g., `CheckboxContext`) in custom components using `useContextProps`.

```typescript
import type {CheckboxProps} from 'react-aria-components';
import * as React from 'react';
import {
  CheckboxContext,
  useContextProps
} from 'react-aria-components';
import {useToggleState} from 'react-stately';
import {useCheckbox} from 'react-aria';
// Assuming GridList and GridListItem are imported for usage example

const MyCustomCheckbox = React.forwardRef(
  (
    props: CheckboxProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    let mergedProps = useContextProps(props, ref, CheckboxContext)[0]; // ref is handled by useContextProps
    let state = useToggleState(mergedProps);
    let { inputProps } = useCheckbox(mergedProps, state, ref as React.RefObject<HTMLInputElement>); // Cast ref
    return <input {...inputProps} ref={ref} />;
  }
);
MyCustomCheckbox.displayName = "MyCustomCheckbox";


// Usage:
// <GridList>
//   <GridListItem>
//     <MyCustomCheckbox slot="selection" />
//     Item Content
//   </GridListItem>
// </GridList>
```

### Hooks

Use lower-level hooks like [useGridList](https://react-spectrum.adobe.com/react-aria/useGridList.html) for more control.

## Testing

### Test utils (alpha)

`@react-aria/test-utils` provides utilities for testing.

```typescript
// GridList.test.ts (Conceptual example)
// import {render, within} from '@testing-library/react';
// import {User} from '@react-aria/test-utils'; // Conceptual import
// import { GridList, GridListItem } from 'react-aria-components'; // For rendering

// let testUtilUser = new User({ interactionType: 'mouse' }); // Conceptual

// it('GridList can select a row via keyboard', async function () {
//   let { getByTestId } = render(
//     <GridList
//       data-testid="test-gridlist"
//       selectionMode="single"
//     >
//       <GridListItem id="item1">Item 1 <Checkbox slot="selection"/></GridListItem> {/* Ensure Checkbox for selection testing */}
//     </GridList>
//   );
//   let gridListTester = testUtilUser.createTester( // Conceptual
//     'GridList',
//     {
//       root: getByTestId('test-gridlist'),
//       interactionType: 'keyboard'
//     }
//   );

//   let row = gridListTester.rows[0];
//   expect(within(row).getByRole('checkbox')).not.toBeChecked();
//   expect(gridListTester.selectedRows).toHaveLength(0);

//   await gridListTester.toggleRowSelection({ row: 0 });
//   expect(within(row).getByRole('checkbox')).toBeChecked();
//   expect(gridListTester.selectedRows).toHaveLength(1);

//   await gridListTester.toggleRowSelection({ row: 0 });
//   expect(within(row).getByRole('checkbox')).not.toBeChecked();
//   expect(gridListTester.selectedRows).toHaveLength(0);
// });
```

Refer to `@react-aria/test-utils` documentation for details on tester properties and methods.
