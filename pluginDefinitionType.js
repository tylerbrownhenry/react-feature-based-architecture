// src/core/plugins/pluginTypes.js
/**
 * @typedef {Object} Plugin
 * @property {string} id - Unique identifier for the plugin
 * @property {string} name - Display name of the plugin
 * @property {React.ComponentType} [ContextProvider] - Optional context provider component
 * @property {Object} components - Map of component names to component functions
 * @property {Object} routes - Route definitions for this plugin
 * @property {Function} initialize - Function called when plugin is loaded
 * @property {Function} [cleanup] - Function called when plugin is unloaded
 */
