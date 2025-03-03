// src/core/plugins/pluginLoader.js
import { useEffect } from 'react';
import { usePluginRegistry } from './PluginRegistry';

// Hardcoded list of plugin imports for now
// This could be dynamic with code splitting later
import analyticsPlugin from '../../plugins/analytics';
import calendarPlugin from '../../plugins/calendar';
// ... other plugins

const availablePlugins = [
  analyticsPlugin,
  calendarPlugin,
  // ... other plugins
];

export function PluginLoader() {
  const { registerPlugin } = usePluginRegistry();
  
  useEffect(() => {
    // Register all available plugins
    availablePlugins.forEach(plugin => {
      registerPlugin(plugin);
      if (plugin.initialize) {
        plugin.initialize();
      }
    });
    
    // Cleanup function
    return () => {
      availablePlugins.forEach(plugin => {
        if (plugin.cleanup) {
          plugin.cleanup();
        }
      });
    };
  }, [registerPlugin]);
  
  // This component doesn't render anything
  return null;
}
