// src/authConfig.ts
import { Configuration, LogLevel } from "@azure/msal-browser";

const msalConfig: Configuration = {
    auth: {
        clientId: "c7fda2de-4eac-4398-b2d6-fe4bca584bc1", // Application (client) ID
        authority: "https://kilimoanga.ciamlogin.com/3136dc51-6dd0-4ca5-abbd-1e73aba5652a",
        redirectUri: "http://localhost:5173",
        knownAuthorities: ["kilimoanga.ciamlogin.com"], // Important for B2C
    },
    cache: {
        cacheLocation: "localStorage", // or "sessionStorage"
        storeAuthStateInCookie: false,
    },

    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (!containsPii) {
                    console.log(`[MSAL] ${message}`);
                }
            },
            logLevel: LogLevel.Verbose,
        },
    }
};

export default msalConfig;
