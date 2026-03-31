import { Shortcuts } from '@basmilius/homey-common';
import type { AppVersionRecord, ChangelogApiResponse, ChangelogsApp, InstalledApp } from './types';
import { Triggers } from './flow';

const CHANGELOG_API_URL = 'https://apps-api.athom.com/api/v1/app';
const POLL_INTERVAL_MS = 300_000;
const SETTINGS_KEY = 'knownAppVersions';

/**
 * Service that monitors installed Homey apps for updates and fires triggers
 * with changelog information when an app has been updated.
 */
export default class ChangelogService extends Shortcuts<ChangelogsApp> {
    #knownVersions: Map<string, string> = new Map();
    #pollInterval: NodeJS.Timeout | null = null;

    /**
     * Starts the service by capturing the current app versions and beginning the poll interval.
     */
    async initialize(): Promise<void> {
        const apps = await this.#getInstalledApps();

        this.log(`Found ${apps.length} installed apps:`);
        for (const app of apps) {
            this.log(`  - ${app.name} (${app.id}) v${app.version}`);
        }

        const stored = this.settings.get(SETTINGS_KEY) as AppVersionRecord | null;

        if (stored) {
            for (const [appId, version] of Object.entries(stored)) {
                this.#knownVersions.set(appId, version);
            }
        } else {
            for (const app of apps) {
                this.#knownVersions.set(app.id, app.version);
            }

            this.#persistVersions();
            this.log(`Captured versions of ${apps.length} installed apps.`);
        }

        this.#pollInterval = this.setInterval(() => this.#poll(), POLL_INTERVAL_MS);
        this.log('Changelog service started, polling every 5 minutes.');
    }

    /**
     * Stops the polling interval.
     */
    async destroy(): Promise<void> {
        if (this.#pollInterval !== null) {
            this.clearInterval(this.#pollInterval);
            this.#pollInterval = null;
        }
    }

    /**
     * Polls the installed apps for version changes and fires triggers for updated apps.
     */
    async #poll(): Promise<void> {
        try {
            const apps = await this.#getInstalledApps();
            const updatedApps: { app: InstalledApp; previousVersion: string }[] = [];

            for (const app of apps) {
                const knownVersion = this.#knownVersions.get(app.id);

                if (knownVersion && knownVersion !== app.version) {
                    updatedApps.push({app, previousVersion: knownVersion});
                }

                this.#knownVersions.set(app.id, app.version);
            }

            // Remove apps that are no longer installed.
            const currentIds = new Set(apps.map((app) => app.id));

            for (const appId of this.#knownVersions.keys()) {
                if (!currentIds.has(appId)) {
                    this.#knownVersions.delete(appId);
                }
            }

            this.#persistVersions();

            for (const {app, previousVersion} of updatedApps) {
                await this.#handleAppUpdated(app, previousVersion);
            }
        } catch (err) {
            this.log('Failed to poll for app updates:', err);
        }
    }

    /**
     * Handles a detected app update by fetching the changelog and firing the trigger.
     *
     * @param app The updated app.
     * @param previousVersion The previous version of the app.
     */
    async #handleAppUpdated(app: InstalledApp, previousVersion: string): Promise<void> {
        this.log(`App updated: ${app.name} (${app.id}) to version ${app.version}`);

        const changelogResult = await this.fetchChangelog(app.id, app.version);

        await this.registry
            .findTrigger(Triggers.AppUpdated)
            ?.trigger({}, {
                app_name: app.name,
                app_id: app.id,
                version: app.version,
                previous_version: previousVersion,
                changelog: changelogResult.text,
                date: changelogResult.date
            });
    }

    /**
     * Returns all currently installed Homey apps via the Homey Web API.
     */
    async #getInstalledApps(): Promise<InstalledApp[]> {
        const apps = await this.app.api.apps.getApps();

        return Object.values(apps).map((app) => ({
            id: app.id,
            name: app.name,
            version: app.version
        }));
    }

    /**
     * Fetches the changelog entry for a specific app version from the Athom API.
     *
     * @param appId The app ID.
     * @param version The version to fetch the changelog for.
     */
    async fetchChangelog(appId: string, version: string): Promise<{ text: string; date: string }> {
        try {
            const url = `${CHANGELOG_API_URL}/${appId}/changelog`;
            const response = await fetch(url);

            if (!response.ok) {
                this.log(`Changelog API responded with status ${response.status} for ${appId}.`);
                return {text: '(changelog not available)', date: ''};
            }

            const changelog = await response.json() as ChangelogApiResponse;
            const entry = changelog[version];

            if (!entry) {
                return {text: '(changelog not available for this version)', date: ''};
            }

            const date = new Date(entry.createdAt).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const text = entry.changelog.en ?? entry.changelog.nl ?? '(no changelog text available)';

            return {text, date};
        } catch (err) {
            this.log(`Failed to fetch changelog for ${appId}:`, err);
            return {text: '(failed to fetch changelog)', date: ''};
        }
    }

    /**
     * Persists the known app versions to settings.
     */
    #persistVersions(): void {
        const record: Record<string, string> = {};

        for (const [appId, version] of this.#knownVersions) {
            record[appId] = version;
        }

        this.settings.set(SETTINGS_KEY, record);
    }
}
