<template>
    <FormFieldset
        :title="t('settings.apps.title')"
        :description="t('settings.apps.description')">
        <div
            v-if="isLoading"
            :class="$style.message">
            {{ t('settings.apps.loading') }}
        </div>

        <div
            v-else-if="items.length === 0"
            :class="$style.message">
            {{ t('settings.apps.empty') }}
        </div>

        <div
            v-else
            :class="$style.list">
            <AppItem
                v-for="app in items"
                :key="app.id"
                :app="app"
                @open="onOpen"/>
        </div>
    </FormFieldset>
</template>

<script
    lang="ts"
    setup>
    import { useTranslate } from '../composables';
    import type { InstalledAppView } from '../types';
    import AppItem from './AppItem.vue';
    import FormFieldset from './FormFieldset.vue';

    const emit = defineEmits<{
        open: [InstalledAppView];
    }>();

    defineProps<{
        readonly isLoading: boolean;
        readonly items: InstalledAppView[];
    }>();

    const t = useTranslate();

    function onOpen(app: InstalledAppView): void {
        emit('open', app);
    }
</script>

<style
    lang="scss"
    module>
    .list {
        display: flex;
        flex-flow: column;
    }

    .message {
        padding: var(--homey-su-2) 0;
        color: var(--homey-color-mono-60);
        font-style: italic;
    }
</style>
