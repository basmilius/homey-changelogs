<template>
    <Top
        :title="t('settings.title')"
        :subtitle="t('settings.subtitle')"/>

    <Form>
        <AppList
            :is-loading="isLoading"
            :items="items"
            @open="onOpen"/>
    </Form>

    <Transition name="modal">
        <ChangelogModal
            v-if="openedApp"
            :app="openedApp"
            :entries="entries"
            :is-loading="isLoadingChangelog"
            @close="onClose"/>
    </Transition>
</template>

<script
    lang="ts"
    setup>
    import { onMounted, ref } from 'vue';
    import { AppList, ChangelogModal, Form, Top } from './components';
    import { useApps, useChangelog, useTranslate } from './composables';
    import type { InstalledAppView } from './types';

    const t = useTranslate();
    const {items, isLoading, load: loadApps} = useApps();
    const {entries, isLoading: isLoadingChangelog, load: loadChangelog, reset: resetChangelog} = useChangelog();

    const openedApp = ref<InstalledAppView | null>(null);

    onMounted(async () => {
        await loadApps();
        Homey.ready();
    });

    async function onOpen(app: InstalledAppView): Promise<void> {
        openedApp.value = app;
        await loadChangelog(app.id);
    }

    function onClose(): void {
        openedApp.value = null;
        resetChangelog();
    }
</script>

<style
    lang="scss"
    module>
    :global(.modal-enter-active),
    :global(.modal-leave-active) {
        transition: 320ms cubic-bezier(0.55, 0, 0.1, 1);
        transition-property: opacity, translate;
    }

    :global(.modal-enter-from),
    :global(.modal-leave-to) {
        opacity: 0;
        translate: 0 30px;
    }
</style>
