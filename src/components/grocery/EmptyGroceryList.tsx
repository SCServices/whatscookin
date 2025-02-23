
export const EmptyGroceryList = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
      <svg
        className="w-24 h-24 text-muted-foreground/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <p className="text-center text-muted-foreground">
        Your list is empty. Add some items!
      </p>
    </div>
  );
};
