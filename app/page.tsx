import Link from "next/link";
import {
  CalendarDays,
  Link as LinkIcon,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Suspense } from "react";
import { SuccessBanner } from "@/components/SuccessBanner";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center overflow-hidden relative">
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 py-24 md:py-32 flex flex-col items-center text-center gap-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-accent font-medium mb-4 border border-secondary/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Simplify Your Scheduling
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-main tracking-tight leading-[1.1] max-w-4xl text-balance">
          The easiest way to find everyone's{" "}
          <span className="text-primary relative inline-block">
            availability
            <svg
              className="absolute w-full h-4 -bottom-1 left-0 text-accent/40"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <path
                d="M0 15 Q 50 0 100 15"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground font-secondary max-w-2xl mt-4 leading-relaxed">
          Stop the back-and-forth messaging. Sync-up is the fastest way to
          schedule meetings, dinners, and events with your group.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/create/anon-user"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all font-secondary shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] shadow-primary/40 hover:shadow-primary/60 transform hover:-translate-y-1"
          >
            Create Event <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="w-full max-w-6xl px-6 py-24 mb-24 z-10 relative">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-main">
            How it works
          </h2>
          <p className="text-muted-foreground font-secondary text-lg max-w-xl mx-auto">
            Get your entire team on the same page in four simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Desktop horizontal connecting line */}
          <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-border z-0" />

          {/* Mobile vertical connecting line */}
          <div className="block lg:hidden absolute top-[48px] bottom-20 left-13 w-[2px] bg-border z-0" />

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 justify-between relative px-2">
            {/* Step 1 */}
            <div className="flex flex-row lg:flex-col items-start lg:items-center gap-8 lg:w-1/4 group cursor-default">
              <div className="bg-card z-10 p-5 rounded-2xl shadow-xl border border-border flex items-center justify-center w-24 h-24 shrink-0 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <CalendarDays className="w-10 h-10 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="lg:text-center mt-2 lg:mt-6 flex-1">
                <div className="text-sm font-bold text-primary font-accent mb-3 uppercase tracking-widest opacity-80">
                  Step 1
                </div>
                <h3 className="text-2xl font-bold font-main mb-3 text-foreground">
                  Create Event
                </h3>
                <p className="text-muted-foreground font-secondary leading-relaxed">
                  Set up your event details and propose a range of possible
                  dates and times.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-row lg:flex-col items-start lg:items-center gap-8 lg:w-1/4 group cursor-default">
              <div className="bg-card z-10 p-5 rounded-2xl shadow-xl border border-border flex items-center justify-center w-24 h-24 shrink-0 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <LinkIcon className="w-10 h-10 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="lg:text-center mt-2 lg:mt-6 flex-1">
                <div className="text-sm font-bold text-primary font-accent mb-3 uppercase tracking-widest opacity-80">
                  Step 2
                </div>
                <h3 className="text-2xl font-bold font-main mb-3 text-foreground">
                  Send Invite Link
                </h3>
                <p className="text-muted-foreground font-secondary leading-relaxed">
                  Share the event link with your attendees
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-row lg:flex-col items-start lg:items-center gap-8 lg:w-1/4 group cursor-default">
              <div className="bg-card z-10 p-5 rounded-2xl shadow-xl border border-border flex items-center justify-center w-24 h-24 shrink-0 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <Users className="w-10 h-10 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="lg:text-center mt-2 lg:mt-6 flex-1">
                <div className="text-sm font-bold text-primary font-accent mb-3 uppercase tracking-widest opacity-80">
                  Step 3
                </div>
                <h3 className="text-2xl font-bold font-main mb-3 text-foreground">
                  Guests Input Availability
                </h3>
                <p className="text-muted-foreground font-secondary leading-relaxed">
                  Guests quickly mark their available times — no sign-up
                  required.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-row lg:flex-col items-start lg:items-center gap-8 lg:w-1/4 group cursor-default">
              <div className="bg-card z-10 p-5 rounded-2xl shadow-xl border border-border flex items-center justify-center w-24 h-24 shrink-0 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <CheckCircle className="w-10 h-10 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="lg:text-center mt-2 lg:mt-6 flex-1">
                <div className="text-sm font-bold text-primary font-accent mb-3 uppercase tracking-widest opacity-80">
                  Step 4
                </div>
                <h3 className="text-2xl font-bold font-main mb-3 text-foreground">
                  Find Aligning Slots
                </h3>
                <p className="text-muted-foreground font-secondary leading-relaxed">
                  Instantly see overlapping free time and finalize your event
                  schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
