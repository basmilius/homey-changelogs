import type {ApiRequest} from '@basmilius/homey-common';
import type {ChangelogFull, ChangelogsApp, InstalledAppView} from './src/types';

type ChangelogParams = {
    readonly appId: string;
};

/**
 * Returns every installed Homey app with its icon, brand color, and the
 * latest changelog entry.
 */
export async function getApps({homey: {app}}: ApiRequest<ChangelogsApp>): Promise<InstalledAppView[]> {
    return await app.changelogs.getInstalledAppsWithChangelog();
}

/**
 * Returns the full changelog (all versions, newest first) for the given app.
 */
export async function getChangelog({homey: {app}, params}: ApiRequest<ChangelogsApp, never, ChangelogParams>): Promise<ChangelogFull> {
    return await app.changelogs.getFullChangelog(params.appId);
}
