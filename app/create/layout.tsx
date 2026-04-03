export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 w-screen flex flex-col items-center p-2">
      <div className="w-full md:w-[80%] lg:w-[60%]">{children}</div>
    </main>
  );
}
