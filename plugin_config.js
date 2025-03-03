// src/config/plugins.config.js
export default {
  enabled: [
    'analytics',
    'calendar',
    'canvas-display',
    'uploads'
  ],
  // Optional settings for each plugin
  settings: {
    'analytics': {
      refreshInterval: 60000
    },
    'calendar': {
      defaultView: 'month'
    }
  }
};
