# Virtualizer

A Virtualizer renders a scrollable collection of data using customizable layouts. It supports very large collections by only rendering visible items to the DOM, reusing them as the user scrolls.

| Command                                             | Version |
| :-------------------------------------------------- | :------ |
| `yarn add react-aria-components`                    | 1.9.0   |
| `import {Virtualizer} from 'react-aria-components'` |         |

[View repository GitHub](https://github.com/adobe/react-spectrum/tree/main/packages/react-aria-components)
[View package NPM](https://www.npmjs.com/package/react-aria-components)

## Example

```typescript
import {
  ListBox,
  ListBoxItem,
  ListLayout,
  Virtualizer
} from 'react-aria-components';

let items: { id: number; name: string }[] = [];
for (let i = 0; i < 5000; i++) {
  items.push({ id: i, name: `Item ${i}` });
}

function Example() {
  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: 32,
        padding: 4,
        gap: 4
      }}
    >
      <ListBox
        aria-label="Virtualized ListBox"
        selectionMode="multiple"
        items={items}
      >
        {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
      </ListBox>
    </Virtualizer>
  );
}
```

## Features

Virtualized scrolling is a performance optimization for large lists. Instead of rendering all items to the DOM at once, it only renders the visible items, reusing them as the user scrolls.

- **Integrated** – Works with React Aria [ListBox](https://react-spectrum.adobe.com/react-aria/ListBox.html), [GridList](https://react-spectrum.adobe.com/react-aria/GridList.html), [Tree](https://react-spectrum.adobe.com/react-aria/Tree.html), and [Table](https://react-spectrum.adobe.com/react-aria/Table.html) components. Integrated with React Aria's [drag and drop](https://react-spectrum.adobe.com/react-aria/dnd.html), [selection](https://react-spectrum.adobe.com/react-aria/selection.html), and [table column resizing](https://react-spectrum.adobe.com/react-aria/Table.html#column-resizing) implementations.
- **Custom layouts** – Support for list, grid, waterfall, and table layouts out of the box, with fixed or variable size items. Create a `Layout` subclass to build your own custom layout.
- **Accessible** – Persists the focused element in the DOM even when out of view, ensuring keyboard navigation always works. Adds ARIA attributes like `aria-rowindex` to give screen reader users context.

## Anatomy

Collection components such as [ListBox](https://react-spectrum.adobe.com/react-aria/ListBox.html), [GridList](https://react-spectrum.adobe.com/react-aria/GridList.html), [Tree](https://react-spectrum.adobe.com/react-aria/Tree.html), and [Table](https://react-spectrum.adobe.com/react-aria/Table.html) can be virtualized by wrapping them in a `<Virtualizer>`, and providing a `Layout` object such as `ListLayout` or `GridLayout`.

```typescript
import {
  ListLayout,
  Virtualizer,
  ListBox // Assuming ListBox is used
} from 'react-aria-components';

<Virtualizer layout={ListLayout}>
  <ListBox>
    {/* ... */}
  </ListBox>
</Virtualizer>
```

**Virtualized components must have a defined size.** This may be an explicit CSS `width` and `height`, or an implicit size (e.g. percentage or `flex`) bounded by an ancestor element. Without a bounded size, all items will be rendered to the DOM.

## Layouts

Virtualizer uses `Layout` objects to determine the position and size of each item. CSS layout properties like flexbox and grid do not apply to virtualized items.

### ListLayout

`ListLayout` supports layout of items in a vertical stack. Rows can be fixed or variable height.
Options: `rowHeight`, `estimatedRowHeight`, `padding`, `gap`.

```typescript
import {
  ListLayout,
  Virtualizer
} from 'react-aria-components';
// Assuming MyGridList and MyItem are defined as in React Aria docs
// import {MyGridList, MyItem} from './GridList';
import { GridList, GridListItem } from 'react-aria-components'; // Using RAC directly

// Assuming 'items' is defined as in the first example
const items: { id: number; name: string }[] = [];
for (let i = 0; i < 100; i++) { // Reduced for brevity
  items.push({ id: i, name: `Item ${i} with potentially long text that wraps to multiple lines` });
}


function Example() {
  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        estimatedRowHeight: 75,
        gap: 4,
        padding: 4
      }}
    >
      <GridList // Using GridList as an example
        aria-label="Virtualized GridList"
        selectionMode="multiple"
        items={items}
      >
        {(item) => <GridListItem id={item.id} textValue={item.name}>{item.name}</GridListItem>}
      </GridList>
    </Virtualizer>
  );
}
```

### GridLayout

`GridLayout` supports layout of items in an equal size grid.
Options: `minItemSize`, `maxItemSize`, `itemPadding`, `padding`, `gap`, `minSpace`, `maxColumns`.
Set `layout="grid"` on the collection component.

```typescript
import {
  GridLayout,
  Size,
  Text,
  Virtualizer,
  ListBox,
  ListBoxItem
} from 'react-aria-components';

// Assuming 'albums' data is defined
interface Album { id: string; title: string; artist: string; image: string; }
const albums: Album[] = Array.from({ length: 100 }, (_, i) => ({ // Sample data
  id: `album-${i}`,
  title: `Album Title ${i}`,
  artist: `Artist Name ${i}`,
  image: `https://via.placeholder.com/100x140?text=Album+${i}`
}));


function Example() {
  return (
    <div className="resizable" style={{ width: '100%', height: '400px', border: '1px solid gray', resize: 'horizontal', overflow: 'auto' }}>
      <Virtualizer
        layout={GridLayout}
        layoutOptions={{
          minItemSize: new Size(100, 140),
          minSpace: new Size(8, 8)
        }}
      >
        <ListBox
          layout="grid"
          aria-label="Virtualized grid layout"
          selectionMode="multiple"
          items={albums}
        >
          {(item) => (
            <ListBoxItem textValue={item.title} id={item.id}>
              <img src={item.image} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover'}} />
              <Text slot="label">{item.title}</Text>
              <Text slot="description">{item.artist}</Text>
            </ListBoxItem>
          )}
        </ListBox>
      </Virtualizer>
    </div>
  );
}
```

### WaterfallLayout

`WaterfallLayout` arranges variable height items in a column layout.
Options: `minItemSize`, `maxItemSize`, `itemPadding`, `padding`, `gap`, `minSpace`, `maxColumns`.

```typescript
import {
  Size,
  Text,
  WaterfallLayout,
  Virtualizer,
  ListBox,
  ListBoxItem
} from 'react-aria-components';

// Assuming 'images' data is defined
interface ImageItem { id: string; title: string; user: string; image: string; aspectRatio: number; }
const images: ImageItem[] = Array.from({ length: 100 }, (_, i) => ({ // Sample data
  id: `image-${i}`,
  title: `Image Title ${i}`,
  user: `User ${i}`,
  image: `https://via.placeholder.com/${150 + Math.floor(Math.random() * 100)}x${150 + Math.floor(Math.random() * 100)}?text=Image+${i}`,
  aspectRatio: (150 + Math.floor(Math.random() * 100)) / (150 + Math.floor(Math.random() * 100))
}));

function Example() {
  return (
    <Virtualizer
      layout={WaterfallLayout}
      layoutOptions={{
        minItemSize: new Size(150, 150),
        minSpace: new Size(8, 8)
      }}
    >
      <ListBox
        layout="grid"
        aria-label="Virtualized waterfall layout"
        selectionMode="multiple"
        items={images}
      >
        {(item) => (
          <ListBoxItem textValue={item.title} id={item.id}>
            <img
              src={item.image}
              alt=""
              style={{ width: '100%', aspectRatio: String(item.aspectRatio) }}
            />
            <Text slot="label">{item.title}</Text>
            <Text slot="description">{item.user}</Text>
          </ListBoxItem>
        )}
      </ListBox>
    </Virtualizer>
  );
}
```

### TableLayout

`TableLayout` provides layout for `Table` components, supporting virtualization of horizontal and vertical scrolling.
Options: `rowHeight`, `estimatedRowHeight`, `headingHeight`, `padding`, `gap`.

```typescript
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLayout,
  Virtualizer,
  Checkbox // Assuming MyCheckbox is a RAC Checkbox or similar
} from 'react-aria-components';
// import {MyCheckbox} from './Checkbox'; // As per original example

interface TableRowData { id: number; foo: string; bar: string; baz: string; }
let rows: TableRowData[] = [];
for (let i = 0; i < 1000; i++) {
  rows.push({
    id: i,
    foo: `Foo ${i}`,
    bar: `Bar ${i}`,
    baz: `Baz ${i}`
  });
}

function Example() {
  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        rowHeight: 32,
        headingHeight: 32,
        padding: 4,
        gap: 4
      }}
    >
      <Table
        aria-label="Virtualized Table"
        selectionMode="multiple"
      >
        <TableHeader>
          <Column width={40} minWidth={0}>
            <Checkbox slot="selection" />
          </Column>
          <Column isRowHeader>Foo</Column>
          <Column>Bar</Column>
          <Column>Baz</Column>
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <Row
              id={item.id} // id prop for Row
              style={{
                width: 'inherit', // These might not be necessary depending on CSS
                height: 'inherit'
              }}
            >
              <Cell>
                <Checkbox slot="selection" />
              </Cell>
              <Cell>{item.foo}</Cell>
              <Cell>{item.bar}</Cell>
              <Cell>{item.baz}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Virtualizer>
  );
}
```

## Advanced: Custom layouts

Custom layouts can be created by extending the `Layout` abstract base class. Implement `getVisibleLayoutInfos`, `getLayoutInfo`, and `getContentSize`.

### LayoutInfo

Layouts produce `LayoutInfo` objects describing item position, size, etc.
Refer to the official documentation for `LayoutInfo` properties.

### Example: HorizontalLayout

```typescript
import {
  Key,
  Layout,
  LayoutInfo,
  Rect,
  Size,
  Virtualizer,
  ListBox,
  ListBoxItem
} from 'react-aria-components';

class HorizontalLayout extends Layout {
  getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    let virtualizer = this.virtualizer!;
    let keys = Array.from(virtualizer.collection.getKeys());
    let startIndex = Math.max(0, Math.floor(rect.x / 100));
    let endIndex = Math.min(
      keys.length - 1,
      Math.ceil(rect.maxX / 100)
    );
    let layoutInfos = [];
    for (let i = startIndex; i <= endIndex; i++) {
      layoutInfos.push(this.getLayoutInfo(keys[i])!); // Added non-null assertion
    }

    for (let key of virtualizer.persistedKeys) {
      let item = virtualizer.collection.getItem(key);
      const layoutInfo = this.getLayoutInfo(key);
      if (layoutInfo && item) { // Check if layoutInfo and item exist
        if (item.index < startIndex && !layoutInfos.find(li => li.key === key)) {
          layoutInfos.unshift(layoutInfo);
        } else if (item.index > endIndex && !layoutInfos.find(li => li.key === key)) {
          layoutInfos.push(layoutInfo);
        }
      }
    }
    return layoutInfos;
  }

  getLayoutInfo(key: Key): LayoutInfo | null {
    let node = this.virtualizer!.collection.getItem(key);
    if (!node) {
      return null;
    }
    let rect = new Rect(node.index * 100, 0, 100, 100);
    return new LayoutInfo(node.type, node.key, rect);
  }

  getContentSize(): Size {
    let numItems = this.virtualizer!.collection.size;
    return new Size(numItems * 100, 100);
  }
}

function Example() {
  let items: { id: number; name: string }[] = [];
  for (let i = 0; i < 200; i++) {
    items.push({ id: i, name: `Item ${i}` });
  }

  return (
    <Virtualizer layout={HorizontalLayout}>
      <ListBox
        aria-label="Favorite animal"
        items={items}
        orientation="horizontal"
        style={{ height: '120px', width: '300px', border: '1px solid gray' }} // Added fixed size for ListBox
      >
        {(item) => (
          <ListBoxItem id={item.id} textValue={item.name} style={{width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid lightgray', margin: '2px'}}>
            {item.name}
          </ListBoxItem>
        )}
      </ListBox>
    </Virtualizer>
  );
}
```
