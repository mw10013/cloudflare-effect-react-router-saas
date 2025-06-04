# Table

A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys, and optionally supports row selection and sorting.

| Command                                       | Version |
| :-------------------------------------------- | :------ |
| `yarn add react-aria-components`              | 1.9.0   |
| `import {Table} from 'react-aria-components'` |         |

[View ARIA pattern W3C](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
[View repository GitHub](https://github.com/adobe/react-spectrum/tree/main/packages/react-aria-components)
[View package NPM](https://www.npmjs.com/package/react-aria-components)

## Example

```typescript
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader
} from 'react-aria-components';
import {MyCheckbox} from './Checkbox';

<Table aria-label="Files" selectionMode="multiple">
  <TableHeader>
    <Column>
      <MyCheckbox slot="selection" />
    </Column>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>
        <MyCheckbox slot="selection" />
      </Cell>
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
    </Row>
    <Row>
      <Cell>
        <MyCheckbox slot="selection" />
      </Cell>
      <Cell>Program Files</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
    </Row>
    <Row>
      <Cell>
        <MyCheckbox slot="selection" />
      </Cell>
      <Cell>bootmgr</Cell>
      <Cell>System file</Cell>
      <Cell>11/20/2010</Cell>
    </Row>
    <Row>
      <Cell>
        <MyCheckbox slot="selection" />
      </Cell>
      <Cell>log.txt</Cell>
      <Cell>Text Document</Cell>
      <Cell>1/18/2016</Cell>
    </Row>
  </TableBody>
</Table>
```

## Features

A table can be built using the `<table>`, `<tr>`, `<td>`, and other table specific HTML elements, but is very limited in functionality especially when it comes to user interactions. HTML tables are meant for static content, rather than tables with rich interactions like focusable elements within cells, keyboard navigation, row selection, sorting, etc. `Table` helps achieve accessible and interactive table components that can be styled as needed.

- **Row selection** – Single or multiple selection, with optional checkboxes, disabled rows, and both `toggle` and `replace` selection behaviors.
- **Columns** – Support for column sorting and [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) columns. Columns may optionally allow user resizing via mouse, touch, and keyboard interactions.
- **Interactive children** – Table cells may include interactive elements such as buttons, menus, etc.
- **Actions** – Rows and cells support optional actions such as navigation via click, tap, double click, or Enter key.
- **Async loading** – Support for loading and sorting items asynchronously.
- **Keyboard navigation** – Table rows, cells, and focusable children can be navigated using the arrow keys, along with page up/down, home/end, etc. Typeahead, auto scrolling, and selection modifier keys are supported as well.
- **Drag and drop** – Tables support drag and drop to reorder, insert, or update rows via mouse, touch, keyboard, and screen reader interactions.
- **Virtualized scrolling** – Use [Virtualizer](https://react-spectrum.adobe.com/react-aria/Virtualizer.html) to improve performance of large tables by rendering only the visible rows.
- **Touch friendly** – Selection and actions adapt their behavior depending on the device. For example, selection is activated via long press on touch when row actions are present.
- **Accessible** – Follows the [ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), with additional selection announcements via an ARIA live region. Extensively tested across many devices and [assistive technologies](https://react-spectrum.adobe.com/react-aria/accessibility.html#testing) to ensure announcements and behaviors are consistent.

## Anatomy

A table consists of a container element, with columns and rows of cells containing data inside. The cells within a table may contain focusable elements or plain text content.

If the table supports row selection, each row can optionally include a selection checkbox. Additionally, a "select all" checkbox may be displayed in a column header if the table supports multiple row selection. A drag button may also be included within a cell if the row is draggable.

If a table supports column resizing, then it should also be wrapped in a `<ResizableTableContainer>`, and a `<ColumnResizer>` should be included in each resizable column.

```typescript
import {
  Button,
  Cell,
  Checkbox,
  Column,
  ColumnResizer,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader
} from 'react-aria-components';

<ResizableTableContainer>
  <Table>
    <TableHeader>
      <Column />
      <Column>
        <Checkbox slot="selection" />
      </Column>
      <Column>
        <ColumnResizer />
      </Column>
      <Column>
        <Column />
        <Column />
      </Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>
          <Button slot="drag" />
        </Cell>
        <Cell>
          <Checkbox slot="selection" />
        </Cell>
        <Cell />
        <Cell />
        <Cell />
      </Row>
    </TableBody>
  </Table>
</ResizableTableContainer>
```

### Concepts

`Table` makes use of the following concepts:

- [Collections](https://react-spectrum.adobe.com/react-aria/collections.html)
- [Selection](https://react-spectrum.adobe.com/react-aria/selection.html)
- [Drag and drop](https://react-spectrum.adobe.com/react-aria/dnd.html)

### Composed components

A `Table` uses the following components, which may also be used standalone or reused in other components.

- [Checkbox](https://react-spectrum.adobe.com/react-aria/Checkbox.html)
- [Button](https://react-spectrum.adobe.com/react-aria/Button.html)

## Examples

- [Stock Table](https://react-spectrum.adobe.com/react-aria/examples/stock-table.html)

## Starter kits

To help kick-start your project, we offer starter kits that include example implementations of all React Aria components with various styling solutions. All components are fully styled, including support for dark mode, high contrast mode, and all UI states. Each starter comes with a pre-configured [Storybook](https://storybook.js.org/) that you can experiment with, or use as a starting point for your own component library.

- [Vanilla CSS Download ZIP](https://react-spectrum.adobe.com/react-aria-starter.3285e6b73.zip) | [Preview](https://react-spectrum.adobe.com/react-aria-starter/index.html?path=/docs/table--docs)
- [Tailwind CSS Download ZIP](https://react-spectrum.adobe.com/react-aria-tailwind-starter.3285e6b73.zip) | [Preview](https://react-spectrum.adobe.com/react-aria-tailwind-starter/index.html?path=/docs/table--docs)

## Reusable wrappers

If you will use a Table in multiple places in your app, you can wrap all of the pieces into a reusable component. This way, the DOM structure, styling code, and other logic are defined in a single place and reused everywhere to ensure consistency.

The following example includes a custom Column component with a sort indicator. It displays an upwards facing arrow when the column is sorted in the ascending direction, and a downward facing arrow otherwise.

```typescript
import type {ColumnProps} from 'react-aria-components';

export function MyColumn(
  props: Omit<ColumnProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  return (
    <Column {...props}>
      {({ allowsSorting, sortDirection }) => (
        <>
          {props.children}
          {allowsSorting && (
            <span
              aria-hidden="true"
              className="sort-indicator"
            >
              {sortDirection === 'ascending' ? '▲' : '▼'}
            </span>
          )}
        </>
      )}
    </Column>
  );
}
```

The TableHeader and Row components can also be wrapped to automatically include [checkboxes](https://react-spectrum.adobe.com/react-aria/Checkbox.html) for selection, and a drag handle when drag and drop is enabled, allowing consumers to avoid repeating them in each row. In this example, the select all checkbox is displayed when multiple selection is enabled and the selection behavior is "toggle". These options can be retrieved from the table using the `useTableOptions` hook. We also use the `Collection` component to generate children from either static or dynamic collections the same way as the default TableHeader and Row components.

```typescript
import type {
  RowProps,
  TableHeaderProps
} from 'react-aria-components';
import {
  Collection,
  useTableOptions
} from 'react-aria-components';
import { MyCheckbox } from './Checkbox'; // Assuming MyCheckbox is defined elsewhere
import { Button } from 'react-aria-components'; // Assuming Button is imported

export function MyTableHeader<T extends object>(
  { columns, children }: TableHeaderProps<T>
) {
  let { selectionBehavior, selectionMode, allowsDragging } =
    useTableOptions();

  return (
    <TableHeader>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <Column />}
      {selectionBehavior === 'toggle' && (
        <Column>
          {selectionMode === 'multiple' && (
            <MyCheckbox slot="selection" />
          )}
        </Column>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </TableHeader>
  );
}

export function MyRow<T extends object>(
  { id, columns, children, ...otherProps }: RowProps<T>
) {
  let { selectionBehavior, allowsDragging } =
    useTableOptions();

  return (
    <Row id={id} {...otherProps}>
      {allowsDragging && (
        <Cell>
          <Button slot="drag">≡</Button>
        </Cell>
      )}
      {selectionBehavior === 'toggle' && (
        <Cell>
          <MyCheckbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </Row>
  );
}
```

Now we can render a table with a default selection column built in.

```typescript
<Table aria-label="Files" selectionMode="multiple">
  <MyTableHeader>
    <MyColumn isRowHeader>Name</MyColumn>
    <MyColumn>Type</MyColumn>
    <MyColumn>Date Modified</MyColumn>
  </MyTableHeader>
  <TableBody>
    <MyRow>
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
    </MyRow>
    <MyRow>
      <Cell>Program Files</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
    </MyRow>
    <MyRow>
      <Cell>bootmgr</Cell>
      <Cell>System file</Cell>
      <Cell>11/20/2010</Cell>
    </MyRow>
  </TableBody>
</Table>
```

## Content

So far, our examples have shown static collections, where the data is hard coded. Dynamic collections, as shown below, can be used when the table data comes from an external data source such as an API, or updates over time. In the example below, both the columns and the rows are provided to the table via a render function, enabling the user to hide and show columns and add additional rows. You can also make the columns static and only the rows dynamic.

Note: Dynamic collections are automatically memoized to improve performance. Use the `dependencies` prop to invalidate cached elements that depend on external state (e.g. `columns` in this example). See the [collections](https://react-spectrum.adobe.com/react-aria/collections.html#dependencies) guide for more details.

```typescript
import type {TableProps} from 'react-aria-components';
import {MyCheckboxGroup} from './CheckboxGroup'; // Assuming MyCheckboxGroup is defined
import {MyCheckbox} from './Checkbox'; // Assuming MyCheckbox is defined
import {MyTableHeader, MyRow} from './ReusableTableComponents'; // Assuming reusable components
import { Button, Cell, Column, Table, TableBody } from 'react-aria-components';
import * as React from 'react';


function FileTable(props: TableProps) {
  let [showColumns, setShowColumns] = React.useState([
    'name',
    'type',
    'date'
  ]);
  let columns = [
    { name: 'Name', id: 'name', isRowHeader: true },
    { name: 'Type', id: 'type' },
    { name: 'Date Modified', id: 'date' }
  ].filter((column) => showColumns.includes(column.id));

  let [rows, setRows] = React.useState([
    {
      id: 1,
      name: 'Games',
      date: '6/7/2020',
      type: 'File folder'
    },
    {
      id: 2,
      name: 'Program Files',
      date: '4/7/2021',
      type: 'File folder'
    },
    {
      id: 3,
      name: 'bootmgr',
      date: '11/20/2010',
      type: 'System file'
    },
    {
      id: 4,
      name: 'log.txt',
      date: '1/18/2016',
      type: 'Text Document'
    }
  ]);

  let addRow = () => {
    let date = new Date().toLocaleDateString();
    setRows((rows) => [
      ...rows,
      {
        id: rows.length + 1,
        name: 'file.txt',
        date,
        type: 'Text Document'
      }
    ]);
  };

  return (
    <div className="flex-col">
      <MyCheckboxGroup
        aria-label="Show columns"
        value={showColumns}
        onChange={setShowColumns}
        style={{ flexDirection: 'row' }}
      >
        <MyCheckbox value="type">Type</MyCheckbox>
        <MyCheckbox value="date">Date Modified</MyCheckbox>
      </MyCheckboxGroup>
      <Table aria-label="Files" {...props}>
        <MyTableHeader columns={columns}>
          {(column) => (
            <Column isRowHeader={column.isRowHeader}>
              {column.name}
            </Column>
          )}
        </MyTableHeader>
        <TableBody items={rows} dependencies={[columns]}>
          {(item) => (
            <MyRow columns={columns}>
              {(column) => <Cell>{item[column.id]}</Cell>}
            </MyRow>
          )}
        </TableBody>
      </Table>
      <Button onPress={addRow}>Add row</Button>
    </div>
  );
}
```

## Selection

### Single selection

By default, `Table` doesn't allow row selection but this can be enabled using the `selectionMode` prop. Use `defaultSelectedKeys` to provide a default set of selected rows. Note that the value of the selected keys must match the `id` prop of the row.

The example below enables single selection mode, and uses `defaultSelectedKeys` to select the row with id equal to `2`. A user can click on a different row to change the selection, or click on the same row again to deselect it entirely.

```typescript
// Using the example above
<FileTable
  selectionMode="single"
  defaultSelectedKeys={[2]}
/>
```

### Multiple selection

Multiple selection can be enabled by setting `selectionMode` to `multiple`.

```typescript
// Using the example above
<FileTable
  selectionMode="multiple"
  defaultSelectedKeys={[2, 4]}
/>
```

### Disallow empty selection

Table also supports a `disallowEmptySelection` prop which forces the user to have at least one row in the Table selected at all times. In this mode, if a single row is selected and the user presses it, it will not be deselected.

```typescript
// Using the example above
<FileTable
  selectionMode="single"
  defaultSelectedKeys={[2]}
  disallowEmptySelection
/>
```

### Controlled selection

To programmatically control row selection, use the `selectedKeys` prop paired with the `onSelectionChange` callback. The `id` prop from the selected rows will be passed into the callback when the row is pressed, allowing you to update state accordingly.

```typescript
import type {Selection, TableProps} from 'react-aria-components';
import { Cell, Column, Table, TableBody } from 'react-aria-components';
import {MyTableHeader, MyRow} from './ReusableTableComponents'; // Assuming reusable components
import * as React from 'react';

interface Pokemon {
  id: number;
  name: string;
  type: string;
  level: string;
}

interface PokemonTableProps extends TableProps {
  items?: Pokemon[];
  renderEmptyState?: () => string;
}

function PokemonTable(props: PokemonTableProps) {
  let items = props.items || [
    {
      id: 1,
      name: 'Charizard',
      type: 'Fire, Flying',
      level: '67'
    },
    {
      id: 2,
      name: 'Blastoise',
      type: 'Water',
      level: '56'
    },
    {
      id: 3,
      name: 'Venusaur',
      type: 'Grass, Poison',
      level: '83'
    },
    {
      id: 4,
      name: 'Pikachu',
      type: 'Electric',
      level: '100'
    }
  ];

  let [selectedKeys, setSelectedKeys] = React.useState<
    Selection
  >(new Set());
  return (
    <Table
      aria-label="Pokemon table"
      {...props}
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}    >
      <MyTableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Level</Column>
      </MyTableHeader>
      <TableBody
        items={items}
        renderEmptyState={props.renderEmptyState}
      >
        {(item) => (
          <MyRow>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.level}</Cell>
          </MyRow>
        )}
      </TableBody>
    </Table>
  );
}

<PokemonTable selectionMode="multiple" />
```

### Selection behavior

By default, `Table` uses the `"toggle"` selection behavior, which behaves like a checkbox group: clicking, tapping, or pressing the Space or Enter keys toggles selection for the focused row. Using the arrow keys moves focus but does not change selection. The `"toggle"` selection mode is often paired with a column of checkboxes in each row as an explicit affordance for selection.

When the `selectionBehavior` prop is set to `"replace"`, clicking a row with the mouse replaces the selection with only that row. Using the arrow keys moves both focus and selection. To select multiple rows, modifier keys such as Ctrl, Cmd, and Shift can be used. To move focus without moving selection, the Ctrl key on Windows or the Option key on macOS can be held while pressing the arrow keys. Holding this modifier while pressing the Space key toggles selection for the focused row, which allows multiple selection of non-contiguous items. On touch screen devices, selection always behaves as toggle since modifier keys may not be available. This behavior emulates native platforms such as macOS and Windows, and is often used when checkboxes in each row are not desired.

```typescript
<PokemonTable
  selectionMode="multiple"
  selectionBehavior="replace"
/>
```

## Row actions

`Table` supports row actions via the `onRowAction` prop, which is useful for functionality such as navigation. In the default `"toggle"` selection behavior, when nothing is selected, clicking or tapping the row triggers the row action. When at least one item is selected, the table is in selection mode, and clicking or tapping a row toggles the selection. Actions may also be triggered via the Enter key, and selection using the Space key.

This behavior is slightly different in the `"replace"` selection behavior, where single clicking selects the row and actions are performed via double click. On touch devices, the action becomes the primary tap interaction, and a long press enters into selection mode, which temporarily swaps the selection behavior to `"toggle"` to perform selection (you may wish to display checkboxes when this happens). Deselecting all items exits selection mode and reverts the selection behavior back to `"replace"`. Keyboard behaviors are unaffected.

```typescript
<div
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px'
  }}
>
  <PokemonTable
    aria-label="Pokemon table with row actions and toggle selection behavior"
    onRowAction={(key) => alert(`Opening item ${key}...`)}
    selectionMode="multiple"
  />
  <PokemonTable
    aria-label="Pokemon table with row actions and replace selection behavior"
    onRowAction={(key) => alert(`Opening item ${key}...`)}
    selectionBehavior="replace"
    selectionMode="multiple"
  />
</div>
```

Rows may also have a row action specified by directly applying `onAction` on the `Row` itself. This may be especially convenient in static collections. If `onAction` is also provided to the `Table`, both the table's and the row's `onAction` are called.

```typescript
import { Cell, Column, Table, TableBody } from 'react-aria-components';
import {MyTableHeader, MyRow} from './ReusableTableComponents'; // Assuming reusable components

<Table
  aria-label="Table with onAction applied on the rows directly"
  selectionMode="multiple"
>
  <MyTableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Level</Column>
  </MyTableHeader>
  <TableBody>
    <MyRow onAction={() => alert(`Opening Charizard`)}>
      <Cell>Charizard</Cell>
      <Cell>Fire, Flying</Cell>
      <Cell>67</Cell>
    </MyRow>
    <MyRow onAction={() => alert(`Opening Blastoise`)}>
      <Cell>Blastoise</Cell>
      <Cell>Water</Cell>
      <Cell>56</Cell>
    </MyRow>
    <MyRow onAction={() => alert(`Opening Venusaur`)}>
      <Cell>Venusaur</Cell>
      <Cell>Grass, Poison</Cell>
      <Cell>83</Cell>
    </MyRow>
    <MyRow onAction={() => alert(`Opening Pikachu`)}>
      <Cell>Pikachu</Cell>
      <Cell>Electric</Cell>
      <Cell>100</Cell>
    </MyRow>
  </TableBody>
</Table>
```

### Links

Table rows may also be links to another page or website. This can be achieved by passing the `href` prop to the `<Row>` component. Links behave the same way as described above for row actions depending on the `selectionMode` and `selectionBehavior`.

```typescript
import { Cell, Column, Table, TableBody } from 'react-aria-components';
import {MyTableHeader, MyRow} from './ReusableTableComponents'; // Assuming reusable components

<Table aria-label="Bookmarks" selectionMode="multiple">
  <MyTableHeader>
    <Column isRowHeader>Name</Column>
    <Column>URL</Column>
    <Column>Date added</Column>
  </MyTableHeader>
  <TableBody>
    <MyRow href="https://adobe.com/" target="_blank">
      <Cell>Adobe</Cell>
      <Cell>https://adobe.com/</Cell>
      <Cell>January 28, 2023</Cell>
    </MyRow>
    <MyRow href="https://google.com/" target="_blank">
      <Cell>Google</Cell>
      <Cell>https://google.com/</Cell>
      <Cell>April 5, 2023</Cell>
    </MyRow>
    <MyRow href="https://nytimes.com/" target="_blank">
      <Cell>New York Times</Cell>
      <Cell>https://nytimes.com/</Cell>
      <Cell>July 12, 2023</Cell>
    </MyRow>
  </TableBody>
</Table>
```

#### Client side routing

The `<Row>` component works with frameworks and client side routers like [Next.js](https://nextjs.org/) and [React Router](https://reactrouter.com/en/main). As with other React Aria components that support links, this works via the `RouterProvider` component at the root of your app. See the [client side routing guide](https://react-spectrum.adobe.com/react-aria/routing.html) to learn how to set this up.

## Disabled rows

A `Row` can be disabled with the `isDisabled` prop. This will disable all interactions on the row, unless the `disabledBehavior` prop on `Table` is used to change this behavior. Note that you are responsible for the styling of disabled rows, however, the selection checkbox will be automatically disabled.

```typescript
import { Cell, Column, Table, TableBody } from 'react-aria-components';
import {MyTableHeader, MyRow} from './ReusableTableComponents'; // Assuming reusable components

<Table
  aria-label="Table with disabled rows"
  selectionMode="multiple"
>
  <MyTableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Level</Column>
  </MyTableHeader>
  <TableBody>
    <MyRow>
      <Cell>Charizard</Cell>
      <Cell>Fire, Flying</Cell>
      <Cell>67</Cell>
    </MyRow>
    <MyRow isDisabled>
      <Cell>Venusaur</Cell>
      <Cell>Grass, Poison</Cell>
      <Cell>83</Cell>
    </MyRow>
    <MyRow>
      <Cell>Pikachu</Cell>
      <Cell>Electric</Cell>
      <Cell>100</Cell>
    </MyRow>
  </TableBody>
</Table>
```

By default, only row selection is disabled. When `disabledBehavior` is set to `all`, all interactions such as focus, dragging, and actions are also disabled.

```typescript
import { Cell, Column, Table, TableBody } from 'react-aria-components';
import {MyTableHeader, MyRow} from './ReusableTableComponents'; // Assuming reusable components

<Table
  aria-label="Table with disabled rows"
  selectionMode="multiple"
  disabledBehavior="all">
  <MyTableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Level</Column>
  </MyTableHeader>
  <TableBody>
    <MyRow>
      <Cell>Charizard</Cell>
      <Cell>Fire, Flying</Cell>
      <Cell>67</Cell>
    </MyRow>
    <MyRow isDisabled>
      <Cell>Venusaur</Cell>
      <Cell>Grass, Poison</Cell>
      <Cell>83</Cell>
    </MyRow>
    <MyRow>
      <Cell>Pikachu</Cell>
      <Cell>Electric</Cell>
      <Cell>100</Cell>
    </MyRow>
  </TableBody>
</Table>
```

In dynamic collections, it may be more convenient to use the `disabledKeys` prop at the `Table` level instead of `isDisabled` on individual rows. This accepts a list of row ids that are disabled. A row is considered disabled if its key exists in `disabledKeys` or if it has `isDisabled`.

```typescript
// Using the same table as above (PokemonTable)
<PokemonTable selectionMode="multiple" disabledKeys={[3]} />
```

## Sorting

Table supports sorting its data when a column header is pressed. To designate that a Column should support sorting, provide it with the `allowsSorting` prop. The Table accepts a `sortDescriptor` prop that defines the current column key to sort by and the sort direction (ascending/descending). When the user presses a sortable column header, the column's key and sort direction is passed into the `onSortChange` callback, allowing you to update the `sortDescriptor` appropriately.

This example performs client side sorting by passing a `sort` function to the [useAsyncList](https://react-spectrum.adobe.com/react-stately/useAsyncList.html) hook. See the docs for more information on how to perform server side sorting.

```typescript
import {useAsyncList} from 'react-stately';
import { Cell, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import {MyColumn} from './ReusableTableComponents'; // Assuming MyColumn is defined

interface Character {
  name: string;
  height: number;
  mass: number;
  birth_year: number;
}

function AsyncSortTable() {
  let list = useAsyncList<Character>({
    async load({ signal }) {
      let res = await fetch(
        `https://swapi.py4e.com/api/people/?search`,
        { signal }
      );
      let json = await res.json();
      return {
        items: json.results
      };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          let first = a[sortDescriptor.column as keyof Character];
          let second = b[sortDescriptor.column as keyof Character];
          let cmp =
            (parseInt(first as string) || first) <
                (parseInt(second as string) || second)
              ? -1
              : 1;
          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }
          return cmp;
        })
      };
    }
  });

  return (
    <Table
      aria-label="Example table with client side sorting"
      sortDescriptor={list.sortDescriptor}
      onSortChange={list.sort}    >
      <TableHeader>
        <MyColumn id="name" isRowHeader allowsSorting>
          Name
        </MyColumn>
        <MyColumn id="height" allowsSorting>
          Height
        </MyColumn>
        <MyColumn id="mass" allowsSorting>Mass</MyColumn>
        <MyColumn id="birth_year" allowsSorting>
          Birth Year
        </MyColumn>
      </TableHeader>
      <TableBody items={list.items}>
        {(item) => (
          <Row id={item.name}>
            <Cell>{item.name}</Cell>
            <Cell>{item.height}</Cell>
            <Cell>{item.mass}</Cell>
            <Cell>{item.birth_year}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
```

## Empty state

Use the `renderEmptyState` prop to customize what the `TableBody` will display if there are no items.

```typescript
import { Column, Table, TableBody, TableHeader } from 'react-aria-components';

<Table aria-label="Search results">
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody renderEmptyState={() => 'No results found.'}>
    {[]}
  </TableBody>
</Table>
```

## Column Resizing

Table supports resizable columns, allowing users to dynamically adjust the width of a column. This is enabled by wrapping the `<Table>` with a `<ResizableTableContainer>` element, which serves as a scrollable container for the Table. Then, to make a column resizable, render a `<ColumnResizer>` element inside a `<Column>`. This allows a user to drag a resize handle to change the width of a column. Keyboard users can also resize a column by pressing Enter to enter resizing mode and then using the arrow keys to resize. Screen reader users can resize columns by operating the resizer like a slider.

### Width values

By default, a Table relies on the browser's default table layout algorithm to determine column widths. However, when a Table is wrapped in a `<ResizableTableContainer>`, column widths are calculated in JavaScript by React Aria. When no additional props are provided, Table divides the available space evenly among the columns. The `Column` component also supports four different width props that allow you to control column sizing behavior: `defaultWidth`, `width`, `minWidth`, and `maxWidth`.

An initial, uncontrolled width can be provided to a Column using the `defaultWidth` prop. This allows the column width to freely shrink and grow in relation to other column widths. Alternatively, a controlled value can be provided by the `width` prop. These props accept fixed pixel values, percentages of the total table width, or [fractional](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout#the_fr_unit) values (the `fr` unit), which represent a fraction of the available space. Columns without a defined width are equivalent to `1fr`.

The `minWidth` and `maxWidth` props define constraints on the size of a column, which may be defined either as fixed pixel values or as percentages of the total table width. These are respected when calculating the size of a column, and also provide limits for column resizing.

The example below illustrates how each of the column width props affects their respective column's resize behavior. Note that the column names are wrapped in a `<span tabIndex={-1}>` so that they can be focused with the keyboard in addition to the `<ColumnResizer>`.

```typescript
import {
  Cell,
  Column,
  ColumnResizer,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader
} from 'react-aria-components';

<ResizableTableContainer>
  <Table aria-label="Table with resizable columns">
    <TableHeader>
      <Column id="file" isRowHeader maxWidth={500}>
        <div className="flex-wrapper">
          <span tabIndex={-1} className="column-name">
            File Name
          </span>
          <ColumnResizer />
        </div>
      </Column>
      <Column id="size" width={80}>Size</Column>
      <Column id="date" minWidth={100}>
        <div className="flex-wrapper">
          <span tabIndex={-1} className="column-name">
            Date Modified
          </span>
          <ColumnResizer />
        </div>
      </Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>
          2022-Roadmap-Proposal-Revision-012822-Copy(2)
        </Cell>
        <Cell>214 KB</Cell>
        <Cell>November 27, 2022 at 4:56PM</Cell>
      </Row>
      <Row>
        <Cell>62259692_p0_master1200</Cell>
        <Cell>120 KB</Cell>
        <Cell>January 27, 2021 at 1:56AM</Cell>
      </Row>
    </TableBody>
  </Table>
</ResizableTableContainer>
```

### Resize events

Table accepts an `onResize` prop which is triggered whenever a column resizer is moved by the user. This can be used in combination with the `width` prop to update a Column's width in a controlled fashion. Table also accepts an `onResizeEnd` prop, which is triggered when the user finishes a column resize operation. Both events receive a Map object containing the widths of every column in the Table.

The example below uses `onResize` to update each of the Table's controlled column widths. It also saves the finalized column widths to `localStorage` in `onResizeEnd`, allowing the Table's state to be preserved between page loads and refreshes.

```typescript
import * as React from 'react';
import {
  Cell,
  Column,
  ColumnResizer,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader
} from 'react-aria-components';

let initialColumns = [
  { name: 'File Name', id: 'file', width: '1fr' as const },
  { name: 'Size', id: 'size', width: 80 as const },
  { name: 'Date', id: 'date', width: 100 as const }
];

type ColumnType = typeof initialColumns[number];

function ResizableTable() {
  let [columns, setColumns] = React.useState(() => {
    let localStorageWidths = localStorage.getItem(
      'table-widths'
    );
    if (localStorageWidths) {
      let widths = JSON.parse(localStorageWidths) as Record<string, string | number>;
      return initialColumns.map((col) => ({
        ...col,
        width: widths[col.id]
      }));
    } else {
      return initialColumns;
    }
  });

  let onResize = (widths: Map<React.Key, number | string>) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        width: widths.get(col.id) ?? col.width
      }))
    );
  };

  let onResizeEnd = (widths: Map<React.Key, number | string>) => {
    localStorage.setItem(
      'table-widths',
      JSON.stringify(Object.fromEntries(widths))
    );
  };
  return (
    <ResizableTableContainer
      onResize={onResize}
      onResizeEnd={onResizeEnd}
    >
      <Table aria-label="Table with controlled, resizable columns saved in local storage">
        <TableHeader columns={columns}>
          {(column: ColumnType) => (
            <Column
              isRowHeader={column.id === 'file'}
              width={column.width}
              id={column.id}
            >
              <div className="flex-wrapper">
                <span tabIndex={-1} className="column-name">
                  {column.name}
                </span>
                <ColumnResizer />
              </div>
            </Column>
          )}
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>
              2022-Roadmap-Proposal-Revision-012822-Copy(2)
            </Cell>
            <Cell>214 KB</Cell>
            <Cell>November 27, 2022 at 4:56PM</Cell>
          </Row>
          <Row>
            <Cell>62259692_p0_master1200</Cell>
            <Cell>120 KB</Cell>
            <Cell>January 27, 2021 at 1:56AM</Cell>
          </Row>
        </TableBody>
      </Table>
    </ResizableTableContainer>
  );
}

<ResizableTable />
```

### Column header menu

The `Column` component exposes a `startResize` function as part of its render props which allows initiating column resizing programmatically. In addition, sorting can also be performed using the `sort` function. This enables you to create a dropdown menu that the user can use to sort or resize a column, along with any other custom actions you may have. Using a menu to initiate column resizing provides a larger hit area for touch screen users.

This example shows how to create a reusable component that wraps `<Column>` to include a menu with sorting and resizing functionality.

```typescript
import * as React from 'react';
import {
  Button,
  Column,
  ColumnProps,
  ColumnResizer,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  ResizableTableContainer,
  Table,
  TableHeader,
  TableBody,
  Row,
  Cell,
  SortDescriptor
} from 'react-aria-components';

interface ResizableTableColumnProps<T>
  extends Omit<ColumnProps, 'children'> {
  children: React.ReactNode;
}

function ResizableTableColumn<T extends object>(
  props: ResizableTableColumnProps<T>
) {
  return (
    <Column {...props}>
      {(
        { startResize, sort, allowsSorting, sortDirection }
      ) => (
        <div className="flex-wrapper">
          <MenuTrigger>
            <Button>{props.children}</Button>
            <Popover>
              <Menu
                onAction={(action) => {
                  if (action === 'sortAscending' && sort) {
                    sort('ascending');
                  } else if (action === 'sortDescending' && sort) {
                    sort('descending');
                  } else if (action === 'resize' && startResize) {
                    startResize();
                  }
                }}
              >
                <MenuItem id="sortAscending">
                  Sort Ascending
                </MenuItem>
                <MenuItem id="sortDescending">
                  Sort Descending
                </MenuItem>
                <MenuItem id="resize">Resize</MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
          {allowsSorting && (
            <span
              aria-hidden="true"
              className="sort-indicator"
            >
              {sortDirection === 'ascending' ? '▲' : '▼'}
            </span>
          )}
          <ColumnResizer />
        </div>
      )}
    </Column>
  );
}

// Example usage:
function Example() {
  let [sortDescriptor, setSortDescriptor] = React.useState<
    SortDescriptor
  >({
    column: 'file',
    direction: 'ascending'
  });

  let items = [
    { file: 'Adobe Photoshop', size: '250MB', date: '01/01/2023' },
    { file: 'Adobe XD', size: '100MB', date: '02/01/2023' },
  ].sort((a, b) => {
    let valA = a[sortDescriptor.column as keyof typeof a];
    let valB = b[sortDescriptor.column as keyof typeof b];
    let d = valA.localeCompare(valB);
    return sortDescriptor.direction === 'descending'
      ? -d
      : d;
  });

  return (
    <ResizableTableContainer>
      <Table
        aria-label="Table with resizable columns"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <ResizableTableColumn
            id="file"
            isRowHeader
            allowsSorting
          >
            File Name
          </ResizableTableColumn>
          <ResizableTableColumn id="size" allowsSorting>
            Size
          </ResizableTableColumn>
          <ResizableTableColumn id="date" allowsSorting>
            Date Modified
          </ResizableTableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <Row>
              <Cell>{item.file}</Cell>
              <Cell>{item.size}</Cell>
              <Cell>{item.date}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </ResizableTableContainer>
  );
}
```

## Drag and drop

Table supports drag and drop interactions when the `dragAndDropHooks` prop is provided using the `useDragAndDrop` hook. Users can drop data on the table as a whole, on individual rows, insert new items between existing rows, or reorder rows.

React Aria supports traditional mouse and touch based drag and drop, but also implements keyboard and screen reader friendly interactions. Users can press Enter on a draggable element to enter drag and drop mode. Then, they can press Tab to navigate between drop targets. A table is treated as a single drop target, so that users can easily tab past it to get to the next drop target. Within a table, keys such as ArrowDown and ArrowUp can be used to select a drop position, such as on an row, or between rows.

Draggable rows must include a focusable drag handle using a `<Button slot="drag">`. This enables keyboard and screen reader users to initiate drag and drop. The `MyRow` component defined in the reusable wrappers section above includes this as an extra column automatically when the table allows dragging.

See the [drag and drop introduction](https://react-spectrum.adobe.com/react-aria/dnd.html) to learn more.

### Reorderable

This example shows a basic table that allows users to reorder rows via drag and drop. This is enabled using the `onReorder` event handler, provided to the `useDragAndDrop` hook. The `getItems` function must also be implemented for items to become draggable.

This uses [useListData](https://react-spectrum.adobe.com/react-stately/useListData.html) from React Stately to manage the item list. Note that `useListData` is a convenience hook, not a requirement. You can manage your state however you wish.

```typescript
import {useListData} from 'react-stately';
import {
  Button,
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  useDragAndDrop
} from 'react-aria-components';
import {MyCheckbox} from './Checkbox'; // Assuming MyCheckbox is defined

function Example() {
  let list = useListData({
    initialItems: [
      {
        id: 1,
        name: 'Games',
        date: '6/7/2020',
        type: 'File folder'
      },
      {
        id: 2,
        name: 'Program Files',
        date: '4/7/2021',
        type: 'File folder'
      },
      {
        id: 3,
        name: 'bootmgr',
        date: '11/20/2010',
        type: 'System file'
      },
      {
        id: 4,
        name: 'log.txt',
        date: '1/18/2016',
        type: 'Text Document'
      }
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
    <Table
      aria-label="Files"
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}
    >
      <TableHeader>
        <Column></Column>
        <Column>
          <MyCheckbox slot="selection" />
        </Column>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Date Modified</Column>
      </TableHeader>
      <TableBody items={list.items}>
        {(item) => (
          <Row id={item.id}>
            <Cell>
              <Button slot="drag">≡</Button>
            </Cell>
            <Cell>
              <MyCheckbox slot="selection" />
            </Cell>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.date}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
```

### Custom drag preview

By default, the drag preview shown under the user's pointer or finger is a copy of the original element that started the drag. A custom preview can be rendered by implementing the `renderDragPreview` function, passed to `useDragAndDrop`. This receives the dragged data that was returned by `getItems`, and returns a rendered preview for those items.

This example renders a custom drag preview which shows the number of items being dragged.

```typescript
import {useListData} from 'react-stately';
import {useDragAndDrop, DragItem} from 'react-aria-components';

function Example() {
  // ... (list definition from previous example)
  const list = useListData({ /* ... */ initialItems: [] });
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        'text/plain': list.getItem(key).name // Ensure list.getItem(key) returns an object with a name property
      })),
    renderDragPreview(items: DragItem[]) {
      return (
        <div className="drag-preview">
          {items[0]['text/plain']}
          <span className="badge">{items.length}</span>
        </div>
      );
    }
  });
  // ... (Table rendering from previous example)
  return <div/>;
}
```

### Drag data

Data for draggable items can be provided in multiple formats at once. This allows drop targets to choose data in a format that they understand. For example, you could serialize a complex object as JSON in a custom format for use within your own application, and also provide plain text and/or rich HTML fallbacks that can be used when a user drops data in an external application (e.g. an email message).

This can be done by returning multiple keys for an item from the `getItems` function. Types can either be a standard [mime type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) for interoperability with external applications, or a custom string for use within your own app.

This example provides representations of each item as plain text, HTML, and a custom app-specific data format.

```typescript
import {useDragAndDrop} from 'react-aria-components';
import {PokemonTable} from './PokemonTable'; // Assuming PokemonTable is defined as in earlier examples

function DraggableTable() {
  let items = [
    {
      id: 1,
      name: 'Charizard',
      type: 'Fire, Flying',
      level: '67'
    },
    {
      id: 2,
      name: 'Blastoise',
      type: 'Water',
      level: '56'
    },
    {
      id: 3,
      name: 'Venusaur',
      type: 'Grass, Poison',
      level: '83'
    },
    {
      id: 4,
      name: 'Pikachu',
      type: 'Electric',
      level: '100'
    }
  ];

  let { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        let item = items.find((item) => item.id === key)!;
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html':
            `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    }
  });

  return (
    <PokemonTable
      items={items}
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}
    />
  );
}

// <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//   <DraggableTable />
//   {/* <DroppableTable /> see below */}
// </div>
```

### Dropping on the collection

Dropping on the Table as a whole can be enabled using the `onRootDrop` event. When a valid drag hovers over the Table, it receives the `isDropTarget` state and can be styled using the `[data-drop-target]` CSS selector.

```typescript
import * as React from 'react';
import {isTextDropItem, useDragAndDrop, DropItem} from 'react-aria-components';
import {PokemonTable, Pokemon} from './PokemonTable'; // Assuming PokemonTable and Pokemon type are defined
import {DraggableTable} from './DraggableTable'; // Assuming DraggableTable is defined

function Example() {
  let [items, setItems] = React.useState<Pokemon[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item: DropItem) => ( // Explicitly type item
            JSON.parse(await item.getText('pokemon'))
          ))
      );
      setItems(droppedItems);
    }
  });

  return (
    <div
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
    >
      <DraggableTable />
      <PokemonTable
        items={items}
        dragAndDropHooks={dragAndDropHooks}
        renderEmptyState={() => 'Drop items here'}
      />
    </div>
  );
}
```

### Dropping on items

Dropping on items can be enabled using the `onItemDrop` event. When a valid drag hovers over an item, it receives the `isDropTarget` state and can be styled using the `[data-drop-target]` CSS selector.

```typescript
import {useDragAndDrop} from 'react-aria-components';
import {DraggableTable} from './DraggableTable'; // Assuming DraggableTable is defined
import {FileTable} from './FileTable'; // Assuming FileTable is defined

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
      <DraggableTable />
      <FileTable dragAndDropHooks={dragAndDropHooks} />
    </div>
  );
}
```

### Dropping between items

Dropping between items can be enabled using the `onInsert` event. Table renders a `DropIndicator` between items to indicate the insertion position, which can be styled using the `.react-aria-DropIndicator` selector. When it is active, it receives the `[data-drop-target]` state.

```typescript
import * as React from 'react';
import {isTextDropItem, useDragAndDrop, DropItem, DropIndicator, DropIndicatorProps} from 'react-aria-components';
import {useListData} from 'react-stately';
import {PokemonTable, Pokemon} from './PokemonTable'; // Assuming PokemonTable and Pokemon type are defined
import {DraggableTable} from './DraggableTable'; // Assuming DraggableTable is defined

function Example() {
  let list = useListData({
    initialItems: [
      {
        id: 1,
        name: 'Bulbasaur',
        type: 'Grass, Poison',
        level: '65'
      },
      {
        id: 2,
        name: 'Charmander',
        type: 'Fire',
        level: '89'
      },
      {
        id: 3,
        name: 'Squirtle',
        type: 'Water',
        level: '77'
      },
      { id: 4, name: 'Caterpie', type: 'Bug', level: '46' }
    ] as Pokemon[] // Cast to Pokemon[]
  });

  let { dragAndDropHooks } = useDragAndDrop({
    async onInsert(e) {
      let itemsToInsert = await Promise.all(
        e.items.filter(isTextDropItem).map(async (item: DropItem) => { // Explicitly type item
          let { name, type, level } = JSON.parse(
            await item.getText('pokemon')
          );
          return { id: Math.random(), name, type, level };
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
      <DraggableTable />
      <PokemonTable
        items={list.items as Pokemon[]} // Cast items to Pokemon[]
        dragAndDropHooks={dragAndDropHooks}
      />
    </div>
  );
}
```

### Drop data

`Table` allows users to drop one or more drag items, each of which contains data to be transferred from the drag source to drop target. There are three kinds of drag items:

- `text` – represents data inline as a string in one or more formats
- `file` – references a file on the user's device
- `directory` – references the contents of a directory

#### Text

A `TextDropItem` represents textual data in one or more different formats. These may be either standard [mime types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) or custom app-specific formats.

The example below uses the `acceptedDragTypes` prop to accept items that include a custom app-specific type, which is retrieved using the item's `getText` method.

```typescript
import * as React from 'react';
import {isTextDropItem, useDragAndDrop, DropItem} from 'react-aria-components';
import {PokemonTable, Pokemon} from './PokemonTable'; // Assuming PokemonTable and Pokemon type are defined
import {DraggableTable} from './DraggableTable'; // Assuming DraggableTable is defined

function DroppableTable() {
  let [items, setItems] = React.useState<Pokemon[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ['pokemon'],
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item: DropItem) => // Explicitly type item
            JSON.parse(await item.getText('pokemon'))
          )
      );
      setItems(droppedItems);
    }
  });

  return (
    <PokemonTable
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop items here'}
    />
  );
}

// <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//   <DraggableTable />
//   <DroppableTable />
// </div>
```

#### Files

A `FileDropItem` references a file on the user's device. It includes the name and mime type of the file, and methods to read the contents as plain text, or retrieve a native [File](https://developer.mozilla.org/en-US/docs/Web/API/File) object.

This example accepts JPEG and PNG image files, and renders them by creating a local [object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).

```typescript
import * as React from 'react';
import {isFileDropItem, useDragAndDrop, Table, TableHeader, Column, TableBody, Row, Cell, DropItem} from 'react-aria-components';

interface ImageItem {
  id: number;
  url: string;
  name: string;
  type: string;
  lastModified: number;
}

function Example() {
  let [items, setItems] = React.useState<ImageItem[]>([]);
  let { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ['image/jpeg', 'image/png'],
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items.filter(isFileDropItem).map(async (item: DropItem) => { // Explicitly type item
          if (item.kind === 'file') { // Check if item is FileDropItem
            const file = await item.getFile();
            return {
              id: Math.random(),
              url: URL.createObjectURL(file),
              name: item.name,
              type: file.type,
              lastModified: file.lastModified
            };
          }
          return null; // Should not happen with isFileDropItem filter
        })
      );
      setItems(droppedItems.filter(Boolean) as ImageItem[]); // Filter out nulls and cast
    }
  });

  return (
    <Table
      aria-label="Droppable table"
      dragAndDropHooks={dragAndDropHooks}
    >
      <TableHeader>
        <Column>Image</Column>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Last Modified</Column>
      </TableHeader>
      <TableBody
        items={items}
        renderEmptyState={() => 'Drop images here'}
      >
        {(item) => (
          <Row id={item.id}>
            <Cell>
              <img src={item.url} alt={item.name} style={{maxWidth: '50px', maxHeight: '50px'}} />
            </Cell>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>
              {new Date(item.lastModified).toLocaleString()}
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
```

#### Directories

A `DirectoryDropItem` references the contents of a directory on the user's device. The `getEntries` method returns an [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) object.

This example accepts directory drops over the whole collection, and renders the contents as items in the list.

```typescript
import * as React from 'react';
// import File from '@spectrum-icons/workflow/FileTxt'; // Placeholder for actual icon components
// import Folder from '@spectrum-icons/workflow/Folder'; // Placeholder for actual icon components
const FileIcon = () => <span>📄</span>; // Placeholder
const FolderIcon = () => <span>📁</span>; // Placeholder

import {
  DIRECTORY_DRAG_TYPE,
  isDirectoryDropItem,
  useDragAndDrop,
  Table, TableHeader, Column, TableBody, Row, Cell, DropItem
} from 'react-aria-components';

interface DirItem {
  name: string;
  kind: 'file' | 'directory';
  type: string;
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
            type: entry.kind === 'directory'
              ? 'Directory'
              : await entry.getType() // getType is async for FileSystemFileHandle
          });
        }
        setFiles(collectedFiles);
      }
    }
  });

  return (
    <Table
      aria-label="Droppable table"
      dragAndDropHooks={dragAndDropHooks}
    >
      <TableHeader>
        <Column>Kind</Column>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
      </TableHeader>
      <TableBody
        items={files}
        renderEmptyState={() => 'Drop directory here'}
      >
        {(item) => (
          <Row id={item.name}>
            <Cell>
              {item.kind === 'directory'
                ? <FolderIcon />
                : <FileIcon />}
            </Cell>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
```

### Drop operations

A `DropOperation` is an indication of what will happen when dragged data is dropped on a particular drop target. These are: `move`, `copy`, `link`, `cancel`.

#### onDragEnd

The `onDragEnd` event allows the drag source to respond when a drag that it initiated ends. The `dropOperation` property of the event object indicates the operation that was performed.

This example removes the dragged items from the UI when a move operation is completed.

```typescript
import {useListData} from 'react-stately';
import {useDragAndDrop} from 'react-aria-components';
import {PokemonTable, Pokemon} from './PokemonTable'; // Assuming PokemonTable and Pokemon type are defined
import {DroppableTable} from './DroppableTable'; // Assuming DroppableTable is defined

function Example() {
  let list = useListData({
    initialItems: [
      { id: 1, name: 'Charizard', type: 'Fire, Flying', level: '67' },
      { id: 2, name: 'Blastoise', type: 'Water', level: '56' },
      { id: 3, name: 'Venusaur', type: 'Grass, Poison', level: '83' },
      { id: 4, name: 'Pikachu', type: 'Electric', level: '100' }
    ] as Pokemon[] // Cast to Pokemon[]
  });

  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
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
      <PokemonTable
        items={list.items as Pokemon[]} // Cast items to Pokemon[]
        selectionMode="multiple"
        dragAndDropHooks={dragAndDropHooks}
      />
      <DroppableTable />
    </div>
  );
}
```

#### getAllowedDropOperations

The drag source can also control which drop operations are allowed for the data using `getAllowedDropOperations`.

```typescript
import {useListData} from 'react-stately';
import {useDragAndDrop} from 'react-aria-components';
import {PokemonTable, Pokemon} from './PokemonTable'; // Assuming PokemonTable and Pokemon type are defined
import {DroppableTable} from './DroppableTable'; // Assuming DroppableTable is defined

function Example() {
  let list = useListData({ /* ... initialItems ... */ initialItems: [] as Pokemon[] }); // Provide initial items
  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        'text/plain': list.getItem(key).name
      })),
    getAllowedDropOperations: () => ['copy']
  });

  return (
    <div
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
    >
      <PokemonTable
        items={list.items as Pokemon[]} // Cast items to Pokemon[]
        selectionMode="multiple"
        dragAndDropHooks={dragAndDropHooks}
      />
      <DroppableTable />
    </div>
  );
}
```

#### getDropOperation

The `getDropOperation` function passed to `useDragAndDrop` can be used to provide appropriate feedback to the user when a drag hovers over the drop target.

```typescript
import * as React from 'react';
import {isFileDropItem, useDragAndDrop, DropItem} from 'react-aria-components';
// Assuming ImageItem and a Table component to display images are defined elsewhere.

interface ImageItem { id: number; url: string; name: string; type: string; lastModified: number; }

function Example() {
  let [items, setItems] = React.useState<ImageItem[]>([]);

  let { dragAndDropHooks } = useDragAndDrop({
    getDropOperation: () => 'copy',
    acceptedDragTypes: ['image/png'],
    async onRootDrop(e) {
      let droppedItems = await Promise.all(
        e.items.filter(isFileDropItem).map(async (item: DropItem) => {
          if (item.kind === 'file') {
            const file = await item.getFile();
            return {
              id: Math.random(),
              url: URL.createObjectURL(file),
              name: item.name,
              type: file.type,
              lastModified: file.lastModified
            };
          }
          return null;
        })
      );
      setItems(droppedItems.filter(Boolean) as ImageItem[]);
    }
  });

  // ... (render a Table component using these hooks and items)
  return <div/>;
}
```

#### Drop events

Drop events such as `onInsert`, `onItemDrop`, etc. also include the `dropOperation`.

```typescript
// MyAppFileService is a placeholder for actual service implementation
const MyAppFileService = {
  move: (sourcePath: string, targetPath: string) =>
    console.log(`Moved ${sourcePath} to ${targetPath}`),
  copy: (sourcePath: string, targetPath: string) =>
    console.log(`Copied ${sourcePath} to ${targetPath}`),
  link: (sourcePath: string, targetPath: string) =>
    console.log(`Linked ${sourcePath} to ${targetPath}`),
};

interface FileDropEvent {
  items: { getText(type: string): Promise<string> }[];
  dropOperation: "move" | "copy" | "link" | "cancel";
}

interface FilePathProps {
  filePath: string;
}

let onItemDrop = async (e: FileDropEvent, props: FilePathProps) => {
  let data = JSON.parse(await e.items[0].getText("my-app-file"));
  switch (e.dropOperation) {
    case "move":
      MyAppFileService.move(data.filePath, props.filePath);
      break;
    case "copy":
      MyAppFileService.copy(data.filePath, props.filePath);
      break;
    case "link":
      MyAppFileService.link(data.filePath, props.filePath);
      break;
  }
};
```

### Drag between tables

This example puts together many of the concepts described above, allowing users to drag items between tables bidirectionally.

```typescript
import * as React from 'react';
import {
  isTextDropItem,
  useDragAndDrop,
  Table, TableHeader, Column, TableBody, Row, Cell, Button, DropItem,
  Selection
} from 'react-aria-components';
import {useListData} from 'react-stately';
import {MyCheckbox} from './Checkbox'; // Assuming MyCheckbox is defined

interface FileItem {
  id: string;
  name: string;
  type: string;
}

interface DndTableProps {
  initialItems: FileItem[];
  'aria-label': string;
}

function DndTable(props: DndTableProps) {
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
    <Table
      aria-label={props['aria-label']}
      selectionMode="multiple"
      selectedKeys={list.selectedKeys}
      onSelectionChange={(keys: Selection) => list.setSelectedKeys(keys)}
      dragAndDropHooks={dragAndDropHooks}
    >
      <TableHeader>
        <Column />
        <Column>
          <MyCheckbox slot="selection" />
        </Column>
        <Column>ID</Column>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
      </TableHeader>
      <TableBody
        items={list.items}
        renderEmptyState={() => 'Drop items here'}
      >
        {(item) => (
          <Row id={item.id}>
            <Cell>
              <Button slot="drag">≡</Button>
            </Cell>
            <Cell>
              <MyCheckbox slot="selection" />
            </Cell>
            <Cell>{item.id}</Cell>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}

// <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//   <DndTable
//     initialItems={[
//       { id: '1', type: 'file', name: 'Adobe Photoshop' },
//       // ... more items
//     ]}
//     aria-label="First Table"
//   />
//   <DndTable
//     initialItems={[
//       { id: '7', type: 'folder', name: 'Pictures' },
//       // ... more items
//     ]}
//     aria-label="Second Table"
//   />
// </div>
```

## Props

For detailed props of each component (`Table`, `TableHeader`, `Column`, `TableBody`, `Row`, `Cell`, `ResizableTableContainer`, `ColumnResizer`), please refer to the [official React Aria Components documentation](https://react-spectrum.adobe.com/react-aria/Table.html#props).

## Styling

React Aria components can be styled using CSS classes, inline styles, utility classes, etc. They include builtin `className` attributes (`react-aria-ComponentName`) and expose states using data attributes (e.g., `data-selected`, `data-focused`).

```css
.react-aria-Table {
  /* ... */
}

.react-aria-Row[data-selected] {
  /* ... */
}

.react-aria-Row[data-focused] {
  /* ... */
}
```

The `className` and `style` props also accept functions for dynamic styling:

```typescript
<Row
  className={({ isSelected }) =>
    isSelected ? 'bg-blue-400' : 'bg-gray-100'}
>
  {/* ... */}
</Row>
```

Render props can be used to alter rendering based on state:

```typescript
<Column>
  {({ allowsSorting, sortDirection }) => (
    <>
      Column Title
      {allowsSorting && (
        // <MySortIndicator direction={sortDirection} />
        <span>{sortDirection === 'ascending' ? '▲' : '▼'}</span>
      )}
    </>
  )}
</Column>
```

Refer to the [official documentation](https://react-spectrum.adobe.com/react-aria/Table.html#styling) for specific states and selectors for each table-related component.

## Advanced customization

### Contexts

All React Aria Components export a corresponding context that can be used to send props to them from a parent element.

```typescript
import type {SelectionMode} from 'react-aria-components';
import * as React from 'react';
import {
  TableContext,
  ToggleButtonContext
} from 'react-aria-components';
// Assuming PokemonTable and ToggleButton are defined/imported
// import { PokemonTable } from './PokemonTable';
// import { ToggleButton } from 'react-aria-components';


function Selectable({ children }: { children: React.ReactNode }) {
  let [isSelected, onChange] = React.useState(false);
  let selectionMode: SelectionMode = isSelected
    ? 'multiple'
    : 'none';
  return (
    <ToggleButtonContext.Provider
      value={{ isSelected, onChange }}
    >
      <TableContext.Provider value={{ selectionMode }}>
        {children}
      </TableContext.Provider>
    </ToggleButtonContext.Provider>
  );
}

// Usage:
// <Selectable>
//   <ToggleButton>Select</ToggleButton>
//   <PokemonTable />
// </Selectable>
```

### Custom children

Contexts can be consumed in your own custom components to make them compatible with React Aria Components. `useContextProps` merges local props and ref with those from context.

```typescript
import type {CheckboxProps} from 'react-aria-components';
import * as React from 'react';
import {
  CheckboxContext,
  useContextProps
} from 'react-aria-components';
import {useToggleState} from 'react-stately';
import {useCheckbox} from 'react-aria';

const MyCustomCheckbox = React.forwardRef(
  (
    props: CheckboxProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    [props, ref] = useContextProps(
      props,
      ref,
      CheckboxContext
    );
    let state = useToggleState(props);
    let { inputProps } = useCheckbox(props, state, ref as React.RefObject<HTMLInputElement>); // Cast ref
    return <input {...inputProps} ref={ref} />;
  }
);
MyCustomCheckbox.displayName = "MyCustomCheckbox";


// Usage:
// <Table>
//   <TableHeader>{/* ... */}</TableHeader>
//   <TableBody>
//     <Row>
//       <Cell><MyCustomCheckbox slot="selection" /></Cell>
//       {/* ... */}
//     </Row>
//   </TableBody>
// </Table>
```

### Hooks

For deeper customization, use the lower-level Hook-based API. See [useTable](https://react-spectrum.adobe.com/react-aria/useTable.html) for more details.

## Testing

### Test utils (alpha)

`@react-aria/test-utils` offers common table interaction utilities. See [testing documentation](https://react-spectrum.adobe.com/react-aria/testing.html#react-aria-test-utils) for setup.

```typescript
// Table.test.ts (Conceptual example)
// import {render, within} from '@testing-library/react';
// import {User} from '@react-aria/test-utils'; // This is a conceptual import

// let testUtilUser = new User({ // Conceptual instantiation
//   interactionType: 'mouse',
//   advanceTimer: jest.advanceTimersByTime // Assuming Jest environment
// });

// it('Table can toggle row selection', async function () {
//   // Render your test component/app and initialize the table tester
//   let { getByTestId } = render(
//     <Table
//       data-testid="test-table"
//       selectionMode="multiple"
//     >
//       {/* ... table content ... */}
//     </Table>
//   );
//   let tableTester = testUtilUser.createTester('Table', { // Conceptual usage
//     root: getByTestId('test-table')
//   });
//   expect(tableTester.selectedRows).toHaveLength(0);

//   await tableTester.toggleSelectAll();
//   expect(tableTester.selectedRows).toHaveLength(10); // Assuming 10 rows

//   await tableTester.toggleRowSelection({ row: 2 });
//   expect(tableTester.selectedRows).toHaveLength(9);
//   let checkbox = within(tableTester.rows[2]).getByRole(
//     'checkbox'
//   );
//   expect(checkbox).not.toBeChecked();

//   await tableTester.toggleSelectAll();
//   expect(tableTester.selectedRows).toHaveLength(10);
//   expect(checkbox).toBeChecked();

//   await tableTester.toggleSelectAll();
//   expect(tableTester.selectedRows).toHaveLength(0);
// });
```

For properties and methods available on the table tester, refer to the `@react-aria/test-utils` documentation.
