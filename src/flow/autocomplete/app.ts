import { autocomplete, FlowAutocompleteProvider } from '@basmilius/homey-common';
import type { FlowCard } from 'homey';
import type { ChangelogsApp } from '../../types';

/**
 * Autocomplete provider that lists all installed Homey apps.
 */
@autocomplete('app')
export default class extends FlowAutocompleteProvider<ChangelogsApp> {
    async find(query: string): Promise<FlowCard.ArgumentAutocompleteResults> {
        const normalizedQuery = query.trim().toLowerCase();
        const hasQuery = normalizedQuery.length > 0;

        const apps = await this.app.api.apps.getApps();

        return Object.values(apps)
            .filter((app) => !hasQuery || app.name?.toLowerCase().includes(normalizedQuery))
            .map((app) => ({
                id: app.id,
                name: app.name,
                description: `v${app.version}`
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
}
