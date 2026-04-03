import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return (
    <div className="Mohaned store-app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
