import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import BarberLogin from "@/components/barber-login";
import BarberPanel from "@/components/barber-panel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/barber-login" component={BarberLogin} />
      <Route path="/barber-panel" component={BarberPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
