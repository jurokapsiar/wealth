import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Home from "@/pages/Home";
import ETFViewer from "@/pages/ETFViewer";
import InflationViewer from "@/pages/InflationViewer";
import { Calculator, TrendingUp, TrendingDown } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
              <div className="container mx-auto px-4">
                <TabsList className="w-full justify-start h-14 bg-transparent rounded-none border-b-0">
                  <TabsTrigger
                    value="calculator"
                    className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    data-testid="tab-calculator"
                  >
                    <Calculator className="h-4 w-4" />
                    <span className="hidden sm:inline">Wealth Calculator</span>
                    <span className="sm:hidden">Calculator</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="etf"
                    className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    data-testid="tab-etf"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">ETF Viewer</span>
                    <span className="sm:hidden">ETFs</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="inflation"
                    className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    data-testid="tab-inflation"
                  >
                    <TrendingDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Inflation Viewer</span>
                    <span className="sm:hidden">Inflation</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="calculator" className="mt-0">
              <Home />
            </TabsContent>
            
            <TabsContent value="etf" className="mt-0">
              <ETFViewer />
            </TabsContent>
            
            <TabsContent value="inflation" className="mt-0">
              <InflationViewer />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
