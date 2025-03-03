// src/core/plugins/pluginRegistry.js
import { createContext, useContext, useState, useEffect } from 'react';

const PluginRegistryContext = createContext();

export function PluginRegistryProvider({ children }) {
  const [plugins, setPlugins] = useState([]);
  const [contextProviders, setContextProviders] = useState([]);
  const [installedPlugins, setInstalledPlugins] = useState(() => {
    // Load installed plugins from localStorage
    try {
      const saved = localStorage.getItem('installedPlugins');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading installed plugins:', e);
      return [];
    }
  });
  
  const registerPlugin = (plugin) => {
    setPlugins(prev => [...prev, plugin]);
    
    // If plugin has a context provider, register it
    if (plugin.ContextProvider) {
      setContextProviders(prev => [...prev, plugin.ContextProvider]);
    }
  };
  
  const installPlugin = async (pluginId, version) => {
    // Add plugin to installed list
    const newPlugin = { id: pluginId, version };
    setInstalledPlugins(prev => {
      const updated = [...prev.filter(p => p.id !== pluginId), newPlugin];
      // Save to localStorage
      localStorage.setItem('installedPlugins', JSON.stringify(updated));
      return updated;
    });
    
    try {
      // Dynamic import of the plugin
      const module = await import(`../../plugins/${pluginId}`);
      const plugin = module.default;
      registerPlugin(plugin);
      
      if (plugin.initialize) {
        await plugin.initialize();
      }
      
      return true;
    } catch (err) {
      console.error(`Failed to install plugin ${pluginId}:`, err);
      // Remove from installed list if failed
      setInstalledPlugins(prev => {
        const updated = prev.filter(p => p.id !== pluginId);
        localStorage.setItem('installedPlugins', JSON.stringify(updated));
        return updated;
      });
      return false;
    }
  };
  
  const uninstallPlugin = (pluginId) => {
    // Find the plugin to call cleanup
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin && plugin.cleanup) {
      plugin.cleanup();
    }
    
    // Remove from plugins list
    setPlugins(prev => prev.filter(p => p.id !== pluginId));
    
    // Remove its context provider if any
    setContextProviders(prev => 
      prev.filter(Provider => Provider !== plugin?.ContextProvider)
    );
    
    // Update installed plugins
    setInstalledPlugins(prev => {
      const updated = prev.filter(p => p.id !== pluginId);
      localStorage.setItem('installedPlugins', JSON.stringify(updated));
      return updated;
    });
    
    return true;
  };
  
  // Wrap children with all registered context providers
  const wrappedChildren = contextProviders.reduce(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
  
  return (
    <PluginRegistryContext.Provider value={{ 
      plugins, 
      installedPlugins,
      registerPlugin,
      installPlugin,
      uninstallPlugin
    }}>
      {wrappedChildren}
    </PluginRegistryContext.Provider>
  );
}

export const usePluginRegistry = () => {
  return useContext(PluginRegistryContext);
};

// src/core/plugins/pluginLoader.js
import { useState, useEffect } from 'react';
import { usePluginRegistry } from './PluginRegistry';

export function PluginLoader() {
  const { installedPlugins, registerPlugin } = usePluginRegistry();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadedPlugins = [];
    
    const loadPlugins = async () => {
      try {
        // Load each installed plugin
        await Promise.all(installedPlugins.map(async ({ id, version }) => {
          try {
            // Dynamic import based on plugin ID
            const module = await import(`../../plugins/${id}`);
            const plugin = module.default;
            
            // Verify version compatibility
            if (plugin.version !== version) {
              console.warn(`Plugin ${id} version mismatch: ${plugin.version} vs ${version}`);
            }
            
            // Register the plugin
            registerPlugin(plugin);
            
            // Initialize the plugin
            if (plugin.initialize) {
              await plugin.initialize();
            }
            
            loadedPlugins.push(plugin);
          } catch (err) {
            console.error(`Failed to load plugin ${id}:`, err);
          }
        }));
        
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    
    loadPlugins();
    
    // Cleanup function
    return () => {
      loadedPlugins.forEach(plugin => {
        if (plugin.cleanup) {
          plugin.cleanup();
        }
      });
    };
  }, [installedPlugins, registerPlugin]);
  
  if (error) {
    return <div>Error loading plugins: {error.message}</div>;
  }
  
  return loading ? <div>Loading plugins...</div> : null;
}

// src/features/plugin-marketplace/PluginMarketplace.js
import { useState, useEffect } from 'react';
import { usePluginRegistry } from '../../core/plugins/PluginRegistry';

function PluginMarketplace() {
  const { installedPlugins, installPlugin, uninstallPlugin } = usePluginRegistry();
  const [availablePlugins, setAvailablePlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAvailablePlugins = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll use a mock response
        const mockResponse = [
          { id: 'analytics', name: 'Analytics', description: 'Track usage data', version: '1.0.0' },
          { id: 'calendar', name: 'Calendar', description: 'Schedule management', version: '1.2.0' },
          { id: 'canvas-display', name: 'Canvas Display', description: 'Interactive canvas', version: '0.9.0' },
          { id: 'uploads', name: 'File Uploads', description: 'Handle file uploads', version: '2.1.0' }
        ];
        
        setAvailablePlugins(mockResponse);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch available plugins:', error);
        setLoading(false);
      }
    };
    
    fetchAvailablePlugins();
  }, []);
  
  const handleInstall = async (plugin) => {
    const success = await installPlugin(plugin.id, plugin.version);
    if (success) {
      alert(`Successfully installed ${plugin.name}`);
    } else {
      alert(`Failed to install ${plugin.name}`);
    }
  };
  
  const handleUninstall = (pluginId) => {
    const success = uninstallPlugin(pluginId);
    if (success) {
      alert(`Successfully uninstalled plugin`);
    } else {
      alert(`Failed to uninstall plugin`);
    }
  };
  
  if (loading) {
    return <div>Loading plugins...</div>;
  }
  
  return (
    <div className="plugin-marketplace">
      <h1>Plugin Marketplace</h1>
      
      <div className="plugin-list">
        {availablePlugins.map(plugin => {
          const isInstalled = installedPlugins.some(p => p.id === plugin.id);
          
          return (
            <div key={plugin.id} className="plugin-card">
              <h3>{plugin.name}</h3>
              <p>{plugin.description}</p>
              <p>Version: {plugin.version}</p>
              
              {isInstalled ? (
                <button
                  onClick={() => handleUninstall(plugin.id)}
                  className="uninstall-btn"
                >
                  Uninstall
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(plugin)}
                  className="install-btn"
                >
                  Install
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PluginMarketplace;
