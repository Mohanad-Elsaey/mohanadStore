import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                className: 'font-manrope z-[9999] font-bold text-slate-900 border-2 border-slate-50 shadow-2xl rounded-2xl',
              }}
            />
        </QueryClientProvider>
    </React.StrictMode>,
);
