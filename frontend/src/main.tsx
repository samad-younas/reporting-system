import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import store, { persistor } from "./store/store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./config/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);
const queryClient = new QueryClient();

msalInstance.initialize().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <BrowserRouter>
                <App />
                <ToastContainer position="top-right" autoClose={3000} />
              </BrowserRouter>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </MsalProvider>
    </StrictMode>,
  );
});
