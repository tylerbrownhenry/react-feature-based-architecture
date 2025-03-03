// src/core/plugins/remotePluginLoader.js
import { useState, useEffect } from 'react';
import { usePluginRegistry } from './PluginRegistry';

// Function to dynamically load a script
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    
    document.body.appendChild(script);
  });
}

export function RemotePluginLoader() {
  const { registerPlugin } = usePluginRegistry();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadedPlugins = [];
    
    const loadRemotePlugins = async () => {
      try {
        // Fetch plugin configuration from server
        const response = await fetch('/api/plugins/remote-config');
        if (!response.ok) {
          throw new Error('Failed to fetch remote plugin configuration');
        }
        
        const config = await response.json();
        
        // Load each remote plugin
        await Promise.all(config.plugins.map(async (pluginInfo) => {
          try {
            // Load the plugin script from CDN or server
            await loadScript(pluginInfo.scriptUrl);
            
            // Plugin scripts should register themselves to the window object
            const plugin = window[`plugin_${pluginInfo.id}`];
            
            if (!plugin) {
              throw new Error(`Plugin ${pluginInfo.id} did not register properly`);
            }
            
            // Register the plugin
            registerPlugin(plugin);
            
            // Initialize the plugin
            if (plugin.initialize) {
              await plugin.initialize(pluginInfo.settings);
            }
            
            loadedPlugins.push(plugin);
          } catch (err) {
            console.error(`Failed to load remote plugin ${pluginInfo.id}:`, err);
          }
        }));
        
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    
    loadRemotePlugins();
    
    // Cleanup function
    return () => {
      loadedPlugins.forEach(plugin => {
        if (plugin.cleanup) {
          plugin.cleanup();
        }
      });
    };
  }, [registerPlugin]);
  
  if (error) {
    return <div>Error loading remote plugins: {error.message}</div>;
  }
  
  return loading ? <div>Loading remote plugins...</div> : null;
}
