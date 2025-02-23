
import { Button } from "@/components/ui/button";
import GroceryList from "@/components/GroceryList";
import GroceryBackground from "@/components/GroceryBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <GroceryBackground />
      {/* Header */}
      <header className="w-full p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-sm animate-fade-in">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 animate-fade-in">
            Smart Grocery Tracker
          </h1>
          <p className="text-center text-muted-foreground text-sm sm:text-base animate-fade-in" style={{ animationDelay: "100ms" }}>
            Create and manage your grocery lists with ease
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto p-4 sm:p-6 md:p-8 animate-fade-in relative" style={{ animationDelay: "200ms" }}>
        <div className="grid grid-cols-1 gap-6">
          <GroceryList />
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button
              className="bg-[#87CEEB] hover:bg-[#87CEEB]/80 transition-all duration-200 min-w-[48px] min-h-[48px] text-base"
            >
              Create New List
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
