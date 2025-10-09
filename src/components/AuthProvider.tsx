import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { instance } = useMsal();
  const [redirectHandled, setRedirectHandled] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response?.account) {
          instance.setActiveAccount(response.account);
        }
      } catch (error) {
        console.error("[MSAL] Redirect error:", error);
      } finally {
        setRedirectHandled(true);
      }
    };

    handleRedirect();
  }, [instance]);

  // Optionally block rendering until redirect is handled
  if (!redirectHandled) return null;

  return <>{children}</>;
};

export default AuthProvider;