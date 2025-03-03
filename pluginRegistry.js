// src/core/plugins/PluginRegistry.js
import { createContext, useContext, useState, useEffect } from 'react';

const PluginRegistryContext = createContext();

export function PluginRegistryProvider({ children }) {
  const [plugins, setPlugins] = useState([]);
  const [contextProviders, setContextProviders] = useState([]);
  
  const registerPlugin = (plugin) => {
    setPlugins(prev => [...prev, plugin]);
    
    // If plugin has a context provider, register it
    if (plugin.ContextProvider) {
      setContextProviders(prev => [...prev, plugin.ContextProvider]);
    }
  };
  
  // Wrap children with all registered context providers
  const wrappedChildren = contextProviders.reduce(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
  
  return (
    <PluginRegistryContext.Provider value={{ 
      plugins, 
      registerPlugin
    }}>
      {wrappedChildren}
    </PluginRegistryContext.Provider>
  );
}

export const usePluginRegistry = () => {
  return useContext(PluginRegistryContext);
};
