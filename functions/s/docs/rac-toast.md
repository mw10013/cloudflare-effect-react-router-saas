# Toast

A Toast displays a brief, temporary notification of actions, errors, or other events in an application.

| Command                                                    | Version |
| :--------------------------------------------------------- | :------ |
| `yarn add react-aria-components`                           | 1.9.0   |
| `import {ToastRegion, Toast} from 'react-aria-components'` |         |

[View ARIA pattern W3C](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
[View repository GitHub](https://github.com/adobe/react-spectrum/tree/main/packages/react-aria-components)
[View package NPM](https://www.npmjs.com/package/react-aria-components)

### Under construction

This component is in alpha. More documentation is coming soon!

## Example

First, render a `ToastRegion` in the root of your app.

```typescript
import * as React from 'react'; // Added for React.useState in later examples
import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion
} from 'react-aria-components';

// Define the type for your toast content.
interface MyToastContent {
  title: string;
  description?: string;
}

// Create a global ToastQueue.
export const queue = new ToastQueue<MyToastContent>();

// Render a <ToastRegion> in the root of your app.
export function App() {
  return (
    <>
      <ToastRegion queue={queue}>
        {({ toast }) => (
          <Toast toast={toast}>
            <ToastContent>
              <Text slot="title">
                {toast.content.title}
              </Text>
              {toast.content.description && (
                <Text slot="description">
                  {toast.content.description}
                </Text>
              )}
            </ToastContent>
            <Button slot="close">x</Button>
          </Toast>
        )}
      </ToastRegion>
      {/* Your app here */}
    </>
  );
}
```

Then, you can trigger a toast from anywhere using the exported `queue`.

```typescript
<Button
  onPress={() => queue.add({
    title: 'Toast complete!',
    description: 'Great success.'
  })}>
  Toast
</Button>
```

## Features

There is no built in way to display toast notifications in HTML. `<ToastRegion>` and `<Toast>` help achieve accessible toasts that can be styled as needed.

- **Accessible** – Toasts follow the [ARIA alertdialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/). They are rendered in a [landmark region](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/), which keyboard and screen reader users can easily jump to when an alert is announced.
- **Focus management** – When a toast unmounts, focus is moved to the next toast if any. Otherwise, focus is restored to where it was before navigating to the toast region.

## Anatomy

A `<ToastRegion>` is an [ARIA landmark region](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) labeled "Notifications" by default. A `<ToastRegion>` accepts a function to render one or more visible toasts, in chronological order. When the limit is reached, additional toasts are queued until the user dismisses one. Each `<Toast>` is a non-modal ARIA [alertdialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/), containing the content of the notification and a close button.

Landmark regions including the toast container can be navigated using the keyboard by pressing the F6 key to move forward, and the Shift + F6 key to move backward. This provides an easy way for keyboard users to jump to the toasts from anywhere in the app. When the last toast is closed, keyboard focus is restored.

```typescript
import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_ToastQueue as ToastQueue // Added for queue definition
} from 'react-aria-components';

// Define the type for your toast content.
interface MyToastContent {
  title: string;
  description?: string;
}

// Assuming 'queue' is defined, for example:
const queue = new ToastQueue<MyToastContent>();


<ToastRegion queue={queue}>
  {({ toast }) => (
    <Toast toast={toast}>
      <ToastContent>
        <Text slot="title">{toast.content.title}</Text>
        {toast.content.description && (
          <Text slot="description">{toast.content.description}</Text>
        )}
      </ToastContent>
      <Button slot="close">x</Button>
    </Toast>
  )}
</ToastRegion>
```

## Auto-dismiss

Toasts support a `timeout` option to automatically hide them after a certain amount of time. For accessibility, toasts should have a minimum timeout of 5 seconds. If a toast includes interactive elements, it should not auto-dismiss. Timers pause on focus or hover.

Use auto-dismiss only for non-critical information or information available elsewhere.

```typescript
import { Button } from 'react-aria-components';
import { queue } from './App'; // Assuming queue is exported from your App setup as in the first example

<Button
  onPress={() =>
    queue.add({ title: 'Toast is done!' }, {
      timeout: 5000
    })}>
  Show toast
</Button>
```

## Programmatic dismissal

Toasts can be dismissed programmatically using `queue.close(key)`. `queue.add` returns the key.

```typescript
import * as React from 'react';
import { Button } from 'react-aria-components';
import { queue } from './App'; // Assuming queue is exported as in the first example

function Example() {
  let [toastKey, setToastKey] = React.useState<string | number | null>(null);

  return (
    <Button
      onPress={() => {
        if (!toastKey) {
          const newToastKey = queue.add({ title: 'Unable to save' }, {
            onClose: () => setToastKey(null)
          });
          setToastKey(newToastKey);
        } else {
          queue.close(toastKey);
        }
      }}
    >
      {toastKey ? 'Hide' : 'Show'} Toast
    </Button>
  );
}
```

## Animations

Toast entry and exit animations can be done using third-party libraries or native CSS view transitions.
This example uses `wrapUpdate` with CSS view transitions.

```typescript
import { flushSync } from 'react-dom';
import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion
} from 'react-aria-components';

interface MyToastContent { // Assuming MyToastContent is defined as in the first example
  title: string;
  description?: string;
}

const animatedQueue = new ToastQueue<MyToastContent>({
  wrapUpdate(fn) {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => { // Use 'any' for startViewTransition
        flushSync(fn);
      });
    } else {
      fn();
    }
  }
});

<ToastRegion queue={animatedQueue}>
  {({ toast }) => (
    <Toast
      style={{ viewTransitionName: String(toast.key) }} // Ensure key is string for CSS
      toast={toast}
    >
      <ToastContent>
        <Text slot="title">{toast.content.title}</Text>
        {toast.content.description && (
          <Text slot="description">
            {toast.content.description}
          </Text>
        )}
      </ToastContent>
      <Button slot="close">x</Button>
    </Toast>
  )}
</ToastRegion>
<Button onPress={() => animatedQueue.add({ title: 'Toasted!' })}>
  Toast
</Button>
```

## Props

### ToastRegion

`<ToastRegion>` renders a group of toasts.
Refer to the official documentation for detailed props.

### Toast

`<Toast>` renders an individual toast.
Refer to the official documentation for detailed props.

### ToastContent

`<ToastContent>` renders the main content of a toast. It accepts all HTML attributes.

## ToastQueue API

A `ToastQueue` manages the state for a `<ToastRegion>`.

### Properties

Refer to the official documentation for `ToastQueue` properties.

### Methods

Refer to the official documentation for `ToastQueue` methods.
