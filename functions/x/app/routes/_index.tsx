import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/components/ui/card";

export default function RouteComponent() {
  return (
    <div data-home>
      <div className="max-w-3xl max-sm:text-center">
        <h1 className="font-heading mb-4 text-4xl/[1.1] font-bold tracking-tight text-foreground md:text-5xl/[1.1]">
          React Aria Components with Shadcn characteristics.
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          An open-source collection of copy-and-paste components for UIs.
        </p>
        {/* <SearchButton /> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
}
