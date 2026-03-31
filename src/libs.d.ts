import type { HomeyAPIV3Local } from 'homey-api';

declare module 'homey-api' {
    interface HomeyAPIV3Local {
        readonly apps: HomeyAPIV3Local.ManagerApps;
    }
}
