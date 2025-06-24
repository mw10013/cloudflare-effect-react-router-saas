import * as Rac from "react-aria-components";
import { Button } from "./oui-button";
import { Text } from "./oui-text";

export interface ToastContentEx {
  title: string;
  description?: string;
}

export function ToastRegionEx<T extends ToastContentEx>(
  props: Omit<Rac.ToastRegionProps<T>, "children">,
) {
  return (
    <Rac.UNSTABLE_ToastRegion
      className="data-[focus-visible]:outline-ring fixed bottom-4 right-4 flex flex-col-reverse gap-2 rounded-lg outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2"
      {...props}
    >
      {({ toast }) => (
        <Rac.UNSTABLE_Toast
          toast={toast}
          className="bg-popover text-popover-foreground border-border data-[focus-visible]:outline-ring flex items-center gap-4 rounded-lg border p-3 text-sm outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2"
        >
          <Rac.UNSTABLE_ToastContent className="flex min-w-0 flex-1 flex-col [&_[slot=title]]:font-medium">
            <Text slot="title">{toast.content.title}</Text>
            <Text slot="description">{toast.content.description}</Text>
          </Rac.UNSTABLE_ToastContent>
          <Button slot="close">x</Button>
        </Rac.UNSTABLE_Toast>
      )}
    </Rac.UNSTABLE_ToastRegion>
  );
}

// export interface OuiToastProps {
//   toast: any;
//   title?: React.ReactNode;
//   children?: React.ReactNode;
//   className?: string;
// }

// export function OuiToast({ toast, title, children, className }: OuiToastProps) {
//   return (
//     <Rac.UNSTABLE_Toast
//       toast={toast}
//       className={composeTailwindRenderProps(
//         className,
//         "bg-card text-card-foreground relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm",
//       )}
//     >
//       {title && (
//         <Heading
//           className="col-start-2 min-h-4 font-medium tracking-tight"
//           variant="default"
//         >
//           {title}
//         </Heading>
//       )}
//       {children && (
//         <Text
//           slot="description"
//           className="text-muted-foreground col-start-2 text-sm"
//         >
//           {children}
//         </Text>
//       )}
//     </Rac.UNSTABLE_Toast>
//   );
// }
