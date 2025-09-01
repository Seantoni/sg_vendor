import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/common/Layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </AppProvider>
  );
}

export default App;
