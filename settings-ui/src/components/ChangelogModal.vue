<template>
    <div
        :class="$style.overlay"
        @click.self="onClose">
        <div :class="$style.modal">
            <header :class="$style.modalHeader">
                <span
                    :class="$style.modalIcon"
                    :style="iconStyle">
                    <img
                        v-if="app.iconUrl && !iconFailed"
                        :class="$style.modalIconImage"
                        :src="app.iconUrl"
                        alt=""
                        @error="onIconError"/>
                    <span
                        v-else
                        :class="$style.modalIconFallback">
                        {{ fallbackLetter }}
                    </span>
                </span>

                <div :class="$style.modalHeaderText">
                    <div :class="$style.modalName">{{ app.name }}</div>
                    <div :class="$style.modalMeta">
                        {{ t('settings.changelog.current_version') }}: v{{ app.version }}
                    </div>
                </div>

                <button
                    type="button"
                    class="hy-nostyle"
                    :class="$style.modalClose"
                    :aria-label="t('settings.changelog.close')"
                    @click="onClose">
                    &times;
                </button>
            </header>

            <div :class="$style.modalBody">
                <div
                    v-if="isLoading"
                    :class="$style.modalMessage">
                    {{ t('settings.changelog.loading') }}
                </div>

                <div
                    v-else-if="entries.length === 0"
                    :class="$style.modalMessage">
                    {{ t('settings.changelog.empty') }}
                </div>

                <article
                    v-for="entry in entries"
                    v-else
                    :key="entry.version"
                    :class="$style.entry">
                    <header :class="$style.entryHeader">
                        <span :class="$style.entryVersion">v{{ entry.version }}</span>
                        <span
                            v-if="entry.date"
                            :class="$style.entryDate">{{ entry.date }}</span>
                    </header>
                    <pre :class="$style.entryBody">{{ entry.text || t('settings.apps.no_changelog') }}</pre>
                </article>
            </div>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup>
    import { computed, ref } from 'vue';
    import { useTranslate } from '../composables';
    import type { ChangelogFull, InstalledAppView } from '../types';

    const emit = defineEmits<{
        close: [];
    }>();

    const {
        app
    } = defineProps<{
        readonly app: InstalledAppView;
        readonly entries: ChangelogFull;
        readonly isLoading: boolean;
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

    function onClose(): void {
        emit('close');
    }

    function onIconError(): void {
        iconFailed.value = true;
    }
</script>

<style
    lang="scss"
    module>
    .overlay {
        position: fixed;
        display: flex;
        inset: 0;
        padding: 15px;
        overflow: auto;
        overscroll-behavior: contain;
        z-index: 1000;

        &::before {
            position: fixed;
            display: block;
            inset: 0;
            content: '';
            background: rgb(from var(--homey-color-mono-90) r g b / .75);
            z-index: 0;
        }
    }

    .modal {
        position: relative;
        display: flex;
        margin: auto;
        width: calc(100% - 30px);
        max-width: 640px;
        max-height: calc(100vh - 30px);
        flex-flow: column;
        background: var(--homey-color-mono-0);
        border-radius: var(--homey-border-radius);
        box-shadow: var(--homey-box-shadow);
        z-index: 1;
        overflow: hidden;
    }

    .modalHeader {
        display: flex;
        padding: 15px;
        align-items: center;
        gap: 15px;
        border-bottom: 1px solid var(--homey-color-mono-05);
    }

    .modalIcon {
        position: relative;
        display: flex;
        width: 56px;
        height: 56px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        background: var(--accent);
        border-radius: 50%;
        overflow: hidden;
    }

    .modalIconImage {
        width: 50%;
        height: 50%;
        object-fit: contain;
        filter: brightness(0) invert(1);
    }

    .modalIconFallback {
        color: #ffffff;
        font-size: 22px;
        font-weight: var(--homey-font-weight-bold);
    }

    .modalHeaderText {
        display: flex;
        min-width: 0;
        flex: 1 1 auto;
        flex-flow: column;
        gap: 3px;
    }

    .modalName {
        font-size: 18px;
        font-weight: var(--homey-font-weight-bold);
    }

    .modalMeta {
        color: var(--homey-color-mono-60);
        font-size: var(--homey-font-size-small);
    }

    .modalClose {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--homey-color-mono-05);
        border: none;
        color: var(--homey-color-mono-60);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        border-radius: 50%;

        &:hover {
            background: var(--homey-color-mono-10);
        }
    }

    .modalBody {
        display: flex;
        padding: 15px;
        flex-flow: column;
        gap: 21px;
        overflow-y: auto;
    }

    .modalMessage {
        color: var(--homey-color-mono-60);
        font-style: italic;
    }

    .entry {
        display: flex;
        flex-flow: column;
        gap: 6px;
    }

    .entryHeader {
        display: flex;
        align-items: baseline;
        gap: 9px;
    }

    .entryVersion {
        font-weight: var(--homey-font-weight-bold);
    }

    .entryDate {
        color: var(--homey-color-mono-50);
        font-size: var(--homey-font-size-small);
    }

    .entryBody {
        margin: 0;
        padding: 0;
        background: transparent;
        color: var(--homey-color-mono-80);
        font-family: inherit;
        font-size: var(--homey-font-size-small);
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>
