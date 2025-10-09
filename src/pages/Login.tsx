import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { PopupRequest } from '@azure/msal-browser';

const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'api://kipepeo.space/kilimoanga-api/read'],
};

const Login: React.FC = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response?.account) {
          instance.setActiveAccount(response.account);
          navigate('/');
        } else {
          const account = instance.getActiveAccount();
          if (account) {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('[MSAL] Redirect handling error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [instance, navigate]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  if (checkingAuth) return null; // Prevent UI flicker during redirect handling


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src="/assets/kilimoanga_logo.png" className="h-12 w-12" alt="Kilimo Anga Logo" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your Anga View account
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <button
                        onClick={handleLogin}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                        Sign in with Email
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <span className="font-medium text-green-600 hover:text-green-500">
                            Sign up is handled during login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
