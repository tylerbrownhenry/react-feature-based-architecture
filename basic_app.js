// src/App.js
import { BrowserRouter } from 'react-router-dom';
import AppProviders from './AppProviders';
import { PluginLoader } from './core/plugins/pluginLoader';
import Routes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        {/* Load all plugins */}
        <PluginLoader />
        
        {/* Actual app rendering */}
        <Routes />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
