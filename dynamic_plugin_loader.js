// src/core/plugins/pluginLoader.js
import { useState, useEffect } from 'react';
import { usePluginRegistry } from './PluginRegistry';

// List of plugin modules to load
const pluginModules = [
  () => import('../../plugins/analytics'),
  () => import('../../plugins/calendar'),
  // This list could be fetched from a server or configuration
];

export function PluginLoader() {
  const { registerPlugin } = usePluginRegistry();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedPlugins = [];
    
    // Load all plugins
    Promise.all(
      pluginModules.map(importFn => 
        importFn().then(module => {
          const plugin = module.default;
          registerPlugin(plugin);
          if (plugin.initialize) {
            plugin.initialize();
          }
          loadedPlugins.push(plugin);
        }).catch(err => {
          console.error('Failed to load plugin:', err);
        })
      )
    ).finally(() => {
      setLoading(false);
    });
    
    // Cleanup function
    return () => {
      loadedPlugins.forEach(plugin => {
        if (plugin.cleanup) {
          plugin.cleanup();
        }
      });
    };
  }, [registerPlugin]);
  
  return loading ? <div>Loading plugins...</div> : null;
}
