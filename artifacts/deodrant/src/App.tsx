import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import ProfilePage from "./pages/ProfilePage";
import CallCentre from "./pages/CallCentre";
import GetLeadsSaar from "./pages/GetLeadsSaar";
import XCleanSaar from "./pages/XCleanSaar";
import NotFound from "./pages/not-found";
import "./index.css";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#f5c518",
    colorForeground: "#f5c518",
    colorMutedForeground: "#c8a040",
    colorDanger: "#ff4444",
    colorBackground: "#1a0033",
    colorInput: "#2a0044",
    colorInputForeground: "#f5c518",
    colorNeutral: "#6a2a8a",
    fontFamily: "'Boogaloo', 'Bangers', sans-serif",
    borderRadius: "2px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#1a0033] border-4 border-[#f5c518] w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent",
    footer: "!shadow-none !border-0 !bg-transparent",
    headerTitle: "text-[#f5c518] font-bold uppercase tracking-wider !text-[2.2rem]",
    headerSubtitle: "text-[#c8a040] !text-[1.5rem] !leading-snug",
    socialButtonsBlockButtonText: "!text-white font-bold uppercase !text-[1.1rem]",
    formFieldLabel: "text-[#f5c518] font-bold uppercase !text-[0.85rem] tracking-widest",
    footerActionLink: "text-[#f5c518] font-bold !text-[1rem]",
    footerActionText: "text-[#c8a040] !text-[1rem]",
    dividerText: "text-[#c8a040] !text-[1rem]",
    identityPreviewEditButton: "text-[#f5c518]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#f5c518]",
    logoBox: "flex justify-center py-2",
    logoImage: "h-14 w-auto",
    socialButtonsBlockButton: "!bg-[#f5c518] border-b-4 border-[#a07a00] !text-white font-bold uppercase hover:!bg-[#e0b010]",
    formButtonPrimary: "!bg-[#f5c518] !text-[#1a0033] font-bold uppercase border-b-4 border-[#a07a00] hover:!bg-[#e0b010] !text-[1.1rem]",
    formFieldInput: "bg-[#2a0044] border-2 border-[#f5c518] text-[#f5c518]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#4a1a6a]",
    alert: "bg-[#2a0044] border border-[#f5c518]",
    otpCodeFieldInput: "bg-[#2a0044] border-2 border-[#f5c518] text-[#f5c518]",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at center, #2a0044 0%, #0d001a 100%)" }}
    >
      <div className="w-full max-w-md">
        <p className="text-center text-[#f5c518] font-bold text-2xl tracking-[0.3em] uppercase mb-6 opacity-70">
          ⚠ JEETS WILL BE REJECTED ⚠
        </p>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at center, #2a0044 0%, #0d001a 100%)" }}
    >
      <div className="w-full max-w-md">
        <p className="text-center text-[#f5c518] font-bold text-2xl tracking-[0.3em] uppercase mb-6 opacity-70">
          ⚠ SMELL TEST IN PROGRESS ⚠
        </p>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
        />
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "ENTER THE DOJO",
            subtitle: "Prove you're not a jeet",
          },
        },
        signUp: {
          start: {
            title: "JOIN THE RESISTANCE",
            subtitle: "Jeets not welcome here",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/callcentre" component={CallCentre} />
          <Route path="/leads" component={GetLeadsSaar} />
          <Route path="/x-clean" component={XCleanSaar} />
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
