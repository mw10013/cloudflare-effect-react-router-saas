# Tooltip

A tooltip displays a description of an element on hover or focus.

| Command                                         | Version |
| :---------------------------------------------- | :------ |
| `yarn add react-aria-components`                | 1.9.0   |
| `import {Tooltip} from 'react-aria-components'` |         |

[View ARIA pattern W3C](https://www.w3.org/TR/wai-aria-1.2/#tooltip)
[View repository GitHub](https://github.com/adobe/react-spectrum/tree/main/packages/react-aria-components)
[View package NPM](https://www.npmjs.com/package/react-aria-components)

## Example

```typescript
import {
  Button,
  OverlayArrow,
  Tooltip,
  TooltipTrigger
} from 'react-aria-components';
import * as React from 'react'; // Added for React.useState in later examples

<TooltipTrigger>
  <Button>✏️</Button>
  <Tooltip>
    <OverlayArrow>
      <svg width={8} height={8} viewBox="0 0 8 8">
        <path d="M0 0 L4 4 L8 0" />
      </svg>
    </OverlayArrow>
    Edit
  </Tooltip>
</TooltipTrigger>
```

## Features

The HTML `title` attribute can be used to create a tooltip, but it cannot be styled. `TooltipTrigger` and `Tooltip` help build fully accessible tooltips that can be styled as needed.

- **Styleable** – States for entry and exit animations are included for easy styling, and an optional arrow element can be rendered.
- **Accessible** – The trigger element is automatically associated with the tooltip via `aria-describedby`. Tooltips are displayed when an element receives focus.
- **Hover behavior** – Tooltips display after a global delay on hover of the first tooltip, with no delay on subsequent tooltips. Emulated hover events on touch devices are ignored.
- **Positioning** – The tooltip is positioned relative to the trigger element, and automatically flips and adjusts to avoid overlapping with the edge of the browser window.

## Anatomy

A tooltip consists of two parts: the trigger element and the tooltip itself. Users may reveal the tooltip by hovering or focusing the trigger.

```typescript
import {
  Button,
  OverlayArrow,
  Tooltip,
  TooltipTrigger
} from 'react-aria-components';

<TooltipTrigger>
  <Button />
  <Tooltip>
    <OverlayArrow />
  </Tooltip>
</TooltipTrigger>
```

### Accessibility

Tooltip triggers must be focusable and hoverable. `TooltipTrigger` automatically associates the tooltip with the trigger element.

Note: tooltips are not shown on touch screen interactions. Ensure UI is usable without tooltips, or use an alternative like [Popover](https://react-spectrum.adobe.com/react-aria/Popover.html).

## Starter kits

Pre-styled starter kits are available for various styling solutions.

- [Vanilla CSS Download ZIP](https://react-spectrum.adobe.com/react-aria-starter.3285e6b73.zip) | [Preview](https://react-spectrum.adobe.com/react-aria-starter/index.html?path=/docs/tooltip--docs)
- [Tailwind CSS Download ZIP](https://react-spectrum.adobe.com/react-aria-tailwind-starter.3285e6b73.zip) | [Preview](https://react-spectrum.adobe.com/react-aria-tailwind-starter/index.html?path=/docs/tooltip--docs)

## Reusable wrappers

Wrap `Tooltip` and its children into a reusable component for consistency.

```typescript
import type {TooltipProps} from 'react-aria-components';
import { Tooltip, OverlayArrow, TooltipTrigger, Button } from 'react-aria-components'; // Added imports for example
import * as React from 'react';


interface MyTooltipProps
  extends Omit<TooltipProps, 'children'> {
  children: React.ReactNode;
}

function MyTooltip({ children, ...props }: MyTooltipProps) {
  return (
    <Tooltip {...props}>
      <OverlayArrow>
        <svg width={8} height={8} viewBox="0 0 8 8">
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </Tooltip>
  );
}

<TooltipTrigger>
  <Button>💾</Button>
  <MyTooltip>Save</MyTooltip>
</TooltipTrigger>
```

## Interactions

### Delay

Tooltips appear after a short "warmup period" on hover, or instantly on focus. This delay is global. The `delay` prop adjusts hover delay.

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined as above

<div style={{ display: 'flex', gap: 8 }}>
  <TooltipTrigger>
    <Button>Hover me</Button>
    <MyTooltip>I come up after a delay.</MyTooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <Button>Then hover me</Button>
    <MyTooltip>
      If you did it quickly, I appear immediately.
    </MyTooltip>
  </TooltipTrigger>
</div>
```

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

<TooltipTrigger delay={0}>
  <Button>💾</Button>
  <MyTooltip>Save</MyTooltip>
</TooltipTrigger>
```

### Trigger

The `trigger` prop can be set to `"focus"` to display the tooltip only on focus.

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

<TooltipTrigger trigger="focus">
  <Button>💿</Button>
  <MyTooltip>Burn CD</MyTooltip>
</TooltipTrigger>
```

## Controlled open state

Control open state with `defaultOpen` and `isOpen` props.

```typescript
import * as React from 'react';
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

function Example() {
  let [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <TooltipTrigger
        isOpen={isOpen}
        onOpenChange={setOpen}
      >
        <Button>📣</Button>
        <MyTooltip>Notifications</MyTooltip>
      </TooltipTrigger>
      <p>Tooltip is {isOpen ? 'showing' : 'not showing'}</p>
    </>
  );
}
```

## Positioning

### Placement

Adjust placement with the `placement` prop (e.g., `start`, `top`, `bottom`, `end`).

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

<div style={{ display: 'flex', gap: 8 }}>
  <TooltipTrigger>
    <Button>⬅️</Button>
    <MyTooltip placement="start">
      In left-to-right, this is on the left. In
      right-to-left, this is on the right.
    </MyTooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <Button>⬆️</Button>
    <MyTooltip placement="top">
      This tooltip is above the button.
    </MyTooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <Button>⬇️</Button>
    <MyTooltip placement="bottom">
      This tooltip is below the button.
    </MyTooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <Button>➡️</Button>
    <MyTooltip placement="end">
      In left-to-right, this is on the right. In
      right-to-left, this is on the left.
    </MyTooltip>
  </TooltipTrigger>
</div>
```

### Offset and cross offset

Adjust offset with `offset` (main axis) and `crossOffset` (cross axis) props.

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

<TooltipTrigger>
  <Button>☝️</Button>
  <MyTooltip offset={50}>This will shift up.</MyTooltip>
</TooltipTrigger>
```

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

<TooltipTrigger>
  <Button>👉</Button>
  <MyTooltip crossOffset={60} placement="bottom">
    This will shift over to the right.
  </MyTooltip>
</TooltipTrigger>
```

## Disabled

Use `isDisabled` on `TooltipTrigger` to disable the tooltip without disabling the trigger.

```typescript
import { TooltipTrigger, Button } from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined

<TooltipTrigger isDisabled>
  <Button>🖨</Button>
  <MyTooltip>Print</MyTooltip>
</TooltipTrigger>
```

## Custom trigger

Wrap custom trigger elements with `<Focusable>`. Ensure the child has an ARIA role or uses semantic HTML.

```typescript
import {Focusable, TooltipTrigger} from 'react-aria-components';
import { MyTooltip } from './MyTooltip'; // Assuming MyTooltip is defined
import * as React from 'react';


<TooltipTrigger>
  <Focusable>
    <span role="button" tabIndex={0}>Custom trigger</span>
  </Focusable>
  <MyTooltip>Tooltip</MyTooltip>
</TooltipTrigger>
```

Custom trigger components must forward `ref` and spread props.

```typescript
import * as React from 'react';

const CustomTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
  <button {...props} ref={ref} />
));
CustomTrigger.displayName = "CustomTrigger";
```

`<Pressable>` elements used in `DialogTrigger` or `MenuTrigger` work automatically without needing `<Focusable>`.

## Props

### TooltipTrigger

Refer to the official documentation for `TooltipTrigger` props.

### Tooltip

Refer to the official documentation for `Tooltip` props.

### OverlayArrow

`OverlayArrow` accepts all HTML attributes. Refer to the official documentation.

## Styling

React Aria components can be styled using CSS classes, inline styles, utility classes, etc.

- Default `className`: `react-aria-ComponentName`
- Custom `className` overrides the default.
- Data attributes for states (e.g., `data-placement="left"`).
- `className` and `style` props accept functions for dynamic styling.
- Entry and exit animations via data attributes (`data-entering`, `data-exiting`).

```css
.react-aria-Tooltip {
  /* ... */
}

.react-aria-Tooltip[data-placement="left"] {
  /* ... */
}

.react-aria-Tooltip {
  transition: opacity 300ms;
}

.react-aria-Tooltip[data-entering],
.react-aria-Tooltip[data-exiting] {
  opacity: 0;
}
```

```typescript
import { OverlayArrow } from 'react-aria-components'; // Assuming OverlayArrow is used

<OverlayArrow
  className={({ placement }) =>
    placement === 'left' || placement === 'right'
      ? 'rotate-90' // Example class
      : ''} // Example class
>
  <svg width={8} height={8} viewBox="0 0 8 8">
    <path d="M0 0 L4 4 L8 0" />
  </svg>
</OverlayArrow>
```

### TooltipTrigger (Styling)

`TooltipTrigger` renders no DOM elements itself, so it does not support direct styling. Wrap children if a styled container is needed.

```typescript
import { TooltipTrigger } from 'react-aria-components';

<TooltipTrigger>
  <div className="my-tooltip-trigger">
    {/* Trigger element and Tooltip */}
  </div>
</TooltipTrigger>
```

### Tooltip (Styling)

Target with `.react-aria-Tooltip` or custom `className`.
Refer to the official documentation for states and render props.

### OverlayArrow (Styling)

Target with `.react-aria-OverlayArrow` or custom `className`.
Refer to the official documentation for states and render props.

## Advanced customization

### State

`TooltipTrigger` provides `TooltipTriggerState` via `TooltipTriggerStateContext`.

### Hooks

For deeper customization, use [useTooltipTrigger](https://react-spectrum.adobe.com/react-aria/useTooltipTrigger.html).
