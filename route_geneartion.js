// src/routes.js
import { usePluginRegistry } from './core/plugins/PluginRegistry';
import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './core/auth/PrivateRoute';
import NotFound from './shared/components/NotFound';

function Routes() {
  const { plugins } = usePluginRegistry();
  
  // Collect all routes from plugins
  const pluginRoutes = plugins.flatMap(plugin => plugin.routes || []);
  
  return (
    <Switch>
      {/* Core routes */}
      <Route path="/" exact component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Plugin routes */}
      {pluginRoutes.map(route => {
        const { path, component, permissions, exact } = route;
        
        // If route requires permissions, use PrivateRoute
        if (permissions && permissions.length > 0) {
          return (
            <PrivateRoute
              key={path}
              path={path}
              component={component}
              exact={exact}
              requiredPermissions={permissions}
            />
          );
        }
        
        // Otherwise use standard Route
        return (
          <Route
            key={path}
            path={path}
            component={component}
            exact={exact}
          />
        );
      })}
      
      {/* Not found route */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default Routes;
