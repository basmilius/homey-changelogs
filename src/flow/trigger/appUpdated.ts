import { FlowTriggerEntity, trigger } from '@basmilius/homey-common';
import type { ChangelogsApp } from '../../types';

/**
 * Trigger that fires when an installed Homey app has been updated to a new version.
 */
@trigger('app_updated')
export default class extends FlowTriggerEntity<ChangelogsApp, never, Record<string, never>, Tokens> {
    async onRun(): Promise<boolean> {
        return true;
    }
}

type Tokens = {
    readonly app_name: string;
    readonly app_id: string;
    readonly version: string;
    readonly previous_version: string;
    readonly changelog: string;
    readonly date: string;
};
