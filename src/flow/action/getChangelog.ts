import { action, FlowActionEntity } from '@basmilius/homey-common';
import { AutocompleteProviders } from '../index';
import type { ChangelogsApp } from '../../types';

/**
 * Action that retrieves the latest changelog entry for a selected app.
 */
@action('get_changelog')
export default class extends FlowActionEntity<ChangelogsApp, Args, never, Tokens> {
    async onInit(): Promise<void> {
        this.registerAutocomplete('app', AutocompleteProviders.App);
        await super.onInit();
    }

    async onRun(args: Args): Promise<Tokens> {
        const appInfo = await this.app.api.apps.getApp({id: args.app.id});
        const result = await this.app.changelogs.fetchLatestChangelog(appInfo.id, appInfo.version);

        return {
            app_name: appInfo.name,
            version: appInfo.version,
            changelog: result?.text ?? '(changelog not available)',
            date: result?.date ?? ''
        };
    }
}

type Args = {
    readonly app: {
        readonly id: string;
        readonly name: string;
    };
};

type Tokens = {
    readonly app_name: string;
    readonly version: string;
    readonly changelog: string;
    readonly date: string;
};
