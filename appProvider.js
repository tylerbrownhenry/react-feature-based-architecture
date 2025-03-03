// src/AppProviders.js
import { GlobalSettingsProvider } from './core/settings/GlobalSettingsContext';
import { PermissionsProvider } from './core/permissions/PermissionsContext';
import { PluginRegistryProvider } from './core/plugins/PluginRegistry';

function AppProviders({ children }) {
  return (
    <PluginRegistryProvider>
      <GlobalSettingsProvider>
        <PermissionsProvider>
          {children}
        </PermissionsProvider>
      </GlobalSettingsProvider>
    </PluginRegistryProvider>
  );
}

export default AppProviders;
