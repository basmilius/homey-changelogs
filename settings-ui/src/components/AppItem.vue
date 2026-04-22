<template>
    <button
        type="button"
        class="hy-nostyle"
        :class="$style.appItem"
        @click="onClick">
        <span
            :class="$style.appItemIcon"
            :style="iconStyle">
            <img
                v-if="app.iconUrl && !iconFailed"
                :class="$style.appItemIconImage"
                :src="app.iconUrl"
                alt=""
                loading="lazy"
                @error="onIconError"/>
            <span
                v-else
                :class="$style.appItemIconFallback">
                {{ fallbackLetter }}
            </span>
        </span>

        <span :class="$style.appItemBody">
            <span :class="$style.appItemName">
                {{ app.name }}
                <span :class="$style.appItemVersion">v{{ app.version }}</span>
            </span>
            <span :class="$style.appItemPreview">
                {{ previewText }}
            </span>
        </span>

        <span :class="$style.appItemChevron" aria-hidden="true"/>
    </button>
</template>

<script
    lang="ts"
    setup>
    import { computed, ref } from 'vue';
    import { useTranslate } from '../composables';
    import type { InstalledAppView } from '../types';

    const emit = defineEmits<{
        open: [InstalledAppView];
    }>();

    const {
        app
    } = defineProps<{
        readonly app: InstalledAppView;
    }>();

    const t = useTranslate();
    const iconFailed = ref(false);

    const iconStyle = computed(() => ({
        '--accent': app.brandColor ?? app.color ?? 'var(--homey-color-mono-30)'
    }));

    const fallbackLetter = computed(() => {
        const firstChar = app.name.trim().charAt(0);

        return firstChar.length > 0 ? firstChar.toUpperCase() : '?';
    });

    const previewText = computed(() => {
        if (!app.latestChangelog || app.latestChangelog.text.trim().length === 0) {
            return t('settings.apps.no_changelog');
        }

        return app.latestChangelog.text;
    });

    function onClick(): void {
        emit('open', app);
    }

    function onIconError(): void {
        iconFailed.value = true;
    }
</script>

<style
    lang="scss"
    module>
    .appItem {
        display: flex;
        padding: 12px var(--homey-su-2);
        margin-left: calc(var(--homey-su-2) * -1);
        margin-right: calc(var(--homey-su-2) * -1);
        align-items: center;
        gap: 15px;
        width: calc(100% + (var(--homey-su-2) * 2));
        background: var(--homey-color-mono-0);
        border: none;
        border-bottom: 1px solid var(--homey-color-mono-05);
        cursor: pointer;
        text-align: left;
        font: inherit;
        color: inherit;
    }

    .appItem:first-child {
        border-top: 1px solid var(--homey-color-mono-05);
    }

    .appItem:hover {
        background: var(--homey-color-mono-01);
    }

    .appItemIcon {
        display: flex;
        width: 48px;
        height: 48px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        background: var(--accent);
        border-radius: 50%;
        overflow: hidden;
    }

    .appItemIconImage {
        width: 50%;
        height: 50%;
        object-fit: contain;
        filter: brightness(0) invert(1);
    }

    .appItemIconFallback {
        color: #ffffff;
        font-size: 20px;
        font-weight: var(--homey-font-weight-bold);
    }

    .appItemBody {
        display: flex;
        min-width: 0;
        flex: 1 1 auto;
        flex-flow: column;
        gap: 2px;
    }

    .appItemName {
        display: flex;
        align-items: baseline;
        gap: 9px;
        flex-wrap: wrap;
        font-weight: var(--homey-font-weight-bold);
    }

    .appItemVersion {
        color: var(--homey-color-mono-50);
        font-size: var(--homey-font-size-small);
        font-weight: var(--homey-font-weight-regular);
    }

    .appItemPreview {
        display: -webkit-box;
        overflow: hidden;
        color: var(--homey-color-mono-60);
        font-size: var(--homey-font-size-small);
        line-height: 1.4;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .appItemChevron {
        flex: 0 0 auto;
        width: 8px;
        height: 14px;
        background: var(--homey-color-mono-30);
        clip-path: polygon(0 0, 100% 50%, 0 100%);
    }
</style>
