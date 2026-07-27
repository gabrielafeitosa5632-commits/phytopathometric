/**
 * PhytoPathometric — App Root
 * Design: AgTech Dashboard Moderno
 * Theme: Light (cream/emerald green)
 * Routes: / (landing) · /login · /signup · /app (protected)
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { I18nProvider } from "./contexts/I18nContext";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import { LoadingBar } from "./components/LoadingBar";
import { OfflineBanner } from "./components/OfflineBanner";
import { useOffline } from "./hooks/useOffline";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { useEffect } from "react";

/** Redirect already-logged-in users away from auth pages */
function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) navigate('/app');
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;
  return <Component />;
}

/** Require login to access /app */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login">
        <AuthRoute component={SignInPage} />
      </Route>
      <Route path="/signup">
        <AuthRoute component={SignUpPage} />
      </Route>
      <Route path="/app">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** Inner shell — has access to LoadingContext */
function AppShell() {
  const { isLoading } = useLoading();
  useOffline(); // registers SW silently
  return (
    <>
      <LoadingBar loading={isLoading} />
      <OfflineBanner />
      <Toaster position="top-center" richColors />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" switchable={true}>
            <LoadingProvider>
              <TooltipProvider>
                <AppShell />
              </TooltipProvider>
            </LoadingProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
