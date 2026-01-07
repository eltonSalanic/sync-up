export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex-1 w-screen flex flex-col items-center p-10">
      <h1 className="text-secondary-foreground pb-10">Create Event</h1>
      {children}
    </main>
  )
}