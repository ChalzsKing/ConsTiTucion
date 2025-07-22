import React from 'react';
import { User } from '../types';
import { GoogleIcon, BookOpenIcon, ArrowRightIcon } from './icons';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;

// Es necesario un componente dedicado para el botón de inicio de sesión de Google
// para llamar condicionalmente al hook `useGoogleLogin`.
const GoogleLoginButton: React.FC<{onLogin: (user: User) => void}> = ({ onLogin }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.access_token}`
                    }
                });
                if (!userInfoResponse.ok) {
                    throw new Error('Failed to fetch user info');
                }
                const userInfo = await userInfoResponse.json();
                const user: User = {
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture,
                };
                onLogin(user);
            } catch (error) {
                console.error("Failed to fetch user info from Google", error);
            }
        },
        onError: () => {
            console.error('Google Login Failed');
        },
    });

    return (
        <button
          onClick={() => login()}
          className="w-full inline-flex justify-center items-center gap-3 bg-white text-slate-800 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-200 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-white"
        >
          <GoogleIcon />
          Iniciar sesión con Google
        </button>
    );
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const handleDemoLogin = () => {
    const demoUser: User = {
      name: 'Usuario Demo',
      email: 'demo@alejandria.app',
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Demo`,
    };
    onLogin(demoUser);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 transition-colors duration-300">
      <div className="text-center max-w-md w-full">
        <div className="inline-block p-4 bg-sky-500/10 rounded-full mb-6">
            <BookOpenIcon className="w-16 h-16 text-sky-500 dark:text-sky-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
          Bienvenido a Alejandría
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          Tu biblioteca personal de conocimiento, generada por IA.
        </p>

        {googleClientId ? (
            <GoogleLoginButton onLogin={onLogin} />
        ) : (
            <>
                <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200 p-4 rounded-r-lg mb-8 text-left text-sm" role="alert">
                    <p className="font-bold">Modo de demostración</p>
                    <p>La autenticación con Google no está configurada. Puedes continuar con un usuario de demostración.</p>
                </div>
                <button
                    onClick={handleDemoLogin}
                    className="w-full inline-flex justify-center items-center gap-3 bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-sky-500 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500"
                >
                    Continuar como Invitado
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
