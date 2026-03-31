import type App from './index';

export type ChangelogsApp = App;

/**
 * Represents the stored version info for an installed app.
 */
export type AppVersionRecord = {
    readonly [appId: string]: string;
};

/**
 * Represents an installed app from the Homey API.
 */
export type InstalledApp = {
    readonly id: string;
    readonly name: string;
    readonly version: string;
};

/**
 * Represents a single changelog entry from the Athom API.
 */
export type ChangelogEntry = {
    readonly createdAt: string;
    readonly changelog: {
        readonly [locale: string]: string;
    };
};

/**
 * Represents the changelog API response from Athom.
 */
export type ChangelogApiResponse = {
    readonly [version: string]: ChangelogEntry;
};
