import { Separator } from '@workspace/ui/components/ui/separator'

export function SeparatorDemo() {
  return (
    <div className="h-fit rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium leading-none">Tailwind CSS</div>
        <div className="text-muted-foreground text-sm">A utility-first CSS framework.</div>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  )
}
