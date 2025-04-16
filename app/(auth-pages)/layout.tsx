export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-2 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}
