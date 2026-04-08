import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarX } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-8 text-center animate-in fade-in zoom-in duration-500">
      {/* Icon Wrapper */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping scale-150 duration-1000 opacity-20" />
        <div className="bg-primary/5 p-4 rounded-full relative border border-primary/10">
          <CalendarX className="size-12 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text Block */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-[500px] leading-relaxed">
        The event you are looking for might have been deleted, or the link could
        be incorrect.
      </p>

      {/* Actions */}
      <Button asChild size="lg" className="rounded-full px-8">
        <Link href="/">Back</Link>
      </Button>
    </div>
  );
}
