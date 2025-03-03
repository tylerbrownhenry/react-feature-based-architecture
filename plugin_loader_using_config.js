// src/core/plugins/pluginLoader.js
import { useState, useEffect } from 'react';
import { usePluginRegistry } from './PluginRegistry';
import pluginsConfig from '../../config/plugins.config';

export function PluginLoader() {
  const { registerPlugin } = usePluginRegistry();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadedPlugins = [];
    
    const loadPlugins = async () => {
      try {
        // Get enabled plugins from config
        const { enabled, settings } = pluginsConfig;
        
        // Load each enabled plugin
        await Promise.all(enabled.map(async (pluginId) => {
          try {
            // Dynamic import based on plugin ID
            const module = await import(`../../plugins/${pluginId}`);
            const plugin = module.default;
            
            // Apply plugin settings if available
            if (settings && settings[pluginId]) {
              plugin.settings = settings[pluginId];
            }
            
            // Register the plugin
            registerPlugin(plugin);
            
            // Initialize the plugin
            if (plugin.initialize) {
              await plugin.initialize(plugin.settings);
            }
            
            loadedPlugins.push(plugin);
          } catch (err) {
            console.error(`Failed to load plugin ${pluginId}:`, err);
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
  }, [registerPlugin]);
  
  if (error) {
    return <div>Error loading plugins: {error.message}</div>;
  }
  
  return loading ? <div>Loading plugins...</div> : null;
}
