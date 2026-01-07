import Link from "next/link"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-25 border-b bg-primary text-primary-foreground">
      <div className="w-full h-full flex items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-semibold transition-opacity hover:opacity-80 font-poppins"
        >
          <Calendar className="size-6" />
          <span>SyncUp</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button 
            asChild
            variant="secondary"
            size="default"
            className="font-medium"
          >
            <Link href="/events/create">Create Event</Link>
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
