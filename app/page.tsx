import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"

const sampleCode = `import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function MessageList() {
  const messages = useQuery(api.messages.list);

  return (
    <ul>
      {messages?.map((msg) => (
        <li key={msg._id}>
          <strong>{msg.author}</strong>: {msg.body}
        </li>
      ))}
    </ul>
  );
}`;

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-2xl min-w-0 flex-col gap-6 text-sm leading-loose">
        <div>
          <h1 className="font-heading text-lg font-medium">Everforest Theme</h1>
          <p className="text-muted-foreground">
            Darkest dark &amp; lightest light.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["bg-hl-red", "Red"],
              ["bg-hl-orange", "Orange"],
              ["bg-hl-yellow", "Yellow"],
              ["bg-hl-green", "Green"],
              ["bg-hl-aqua", "Aqua"],
              ["bg-hl-blue", "Blue"],
              ["bg-hl-purple", "Purple"],
            ] as const
          ).map(([bg, label]) => (
            <span
              key={label}
              className={`${bg} text-hl-bg0 inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["bg-hl-bg-red", "text-hl-red", "bg_red"],
              ["bg-hl-bg-yellow", "text-hl-yellow", "bg_yellow"],
              ["bg-hl-bg-green", "text-hl-green", "bg_green"],
              ["bg-hl-bg-blue", "text-hl-blue", "bg_blue"],
              ["bg-hl-bg-purple", "text-hl-purple", "bg_purple"],
              ["bg-hl-bg-visual", "text-foreground", "bg_visual"],
            ] as const
          ).map(([bg, text, label]) => (
            <span
              key={label}
              className={`${bg} ${text} inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium`}
            >
              {label}
            </span>
          ))}
        </div>

        <CodeBlock code={sampleCode} lang="tsx" />

        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
