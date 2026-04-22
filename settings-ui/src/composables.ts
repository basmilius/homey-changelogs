import { ref } from 'vue';
import type { ChangelogFull, InstalledAppView } from './types';

export function useTranslate() {
    return (key: string) => Homey.__(key) ?? key;
}

export function useApps() {
    const items = ref<InstalledAppView[]>([]);
    const isLoading = ref(true);

    const load = async () => {
        isLoading.value = true;
        items.value = await Homey.api<InstalledAppView[]>('GET', '/apps');
        isLoading.value = false;
    };

    return {
        isLoading,
        items,
        load
    };
}

export function useChangelog() {
    const entries = ref<ChangelogFull>([]);
    const isLoading = ref(false);

    const load = async (appId: string) => {
        isLoading.value = true;
        entries.value = [];

        try {
            entries.value = await Homey.api<ChangelogFull>('GET', `/apps/${encodeURIComponent(appId)}/changelog`);
        } finally {
            isLoading.value = false;
        }
    };

    const reset = () => {
        entries.value = [];
    };

    return {
        entries,
        isLoading,
        load,
        reset
    };
}
