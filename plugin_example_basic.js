// src/plugins/analytics/index.js
import { createContext, useContext, useState, useEffect } from 'react';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AnalyticsSettings from './components/AnalyticsSettings';

// Create context
const AnalyticsContext = createContext();

// Create provider
function AnalyticsProvider({ children }) {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Fetch logic
      const data = await fetchData();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnalyticsContext.Provider value={{ metrics, isLoading, refreshMetrics: fetchMetrics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook
const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Plugin definition
const analyticsPlugin = {
  id: 'analytics',
  name: 'Analytics',
  ContextProvider: AnalyticsProvider,
  components: {
    Dashboard: AnalyticsDashboard,
    Settings: AnalyticsSettings
  },
  routes: [
    {
      path: '/analytics',
      component: AnalyticsDashboard,
      exact: true,
      permissions: ['analytics.view']
    },
    {
      path: '/settings/analytics',
      component: AnalyticsSettings,
      exact: true,
      permissions: ['analytics.settings']
    }
  ],
  initialize: () => {
    console.log('Analytics plugin initialized');
    // Could register menu items, etc.
  },
  cleanup: () => {
    console.log('Analytics plugin cleanup');
  }
};

// Export the hook for components to use
export { useAnalytics };

// Export the plugin
export default analyticsPlugin;
