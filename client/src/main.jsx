import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ThemeProvider from "./themes/ThemeProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <ThemeProvider>
        <BrowserRouter>
            <StrictMode>
                <App />
            </StrictMode>
        </BrowserRouter>
    </ThemeProvider>
);
