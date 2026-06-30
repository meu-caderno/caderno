<script setup lang="ts">
const emit = defineEmits<{ "create-context": [] }>();

const { context } = useActiveContext();
const { moodKey } = useTheme();
const { hasConsent, toggleConsent } = useConsent();
const { read, patch } = usePreferences();

const dismissed = useState<string[]>("caderno:banners:dismissed", () => []);
const hydrated = useState<boolean>(
  "caderno:banners:dismissed:hydrated",
  () => false,
);

onMounted(async () => {
  if (hydrated.value) return;
  hydrated.value = true;
  const prefs = await read();
  dismissed.value = prefs?.dismissedBanners ?? [];
});

async function dismiss(key: string) {
  if (dismissed.value.includes(key)) return;
  const next = [...dismissed.value, key];
  dismissed.value = next;
  await patch({ dismissedBanners: next });
}

const isDemo = computed(() =>
  (context.value?.name ?? "").toLowerCase().includes("(exemplo)"),
);
const isPersonalized = computed(() => moodKey.value !== "calmo");

const showDemo = computed(
  () => isDemo.value && !dismissed.value.includes("demo"),
);
const showMood = computed(
  () => !isPersonalized.value && !dismissed.value.includes("mood"),
);
const showGamification = computed(
  () =>
    !hasConsent("gamification") && !dismissed.value.includes("gamification"),
);
const anyVisible = computed(
  () => showDemo.value || showMood.value || showGamification.value,
);

function createMine() {
  void dismiss("demo");
  emit("create-context");
}
function personalize() {
  void dismiss("mood");
  void navigateTo("/ajustes");
}
function enableGamification() {
  void toggleConsent("gamification");
}
</script>

<template>
  <div v-if="anyVisible" class="banners">
    <section v-if="showDemo" class="banner">
      <p class="banner__text">
        <b class="pt-hand">🌱 Você está explorando um exemplo</b>
        <span class="banner__sub">
          Os dados são de demonstração. Crie o seu para começar de verdade.
        </span>
      </p>
      <div class="banner__actions">
        <UIButton label="Criar o meu" variant="primal" @click="createMine" />
        <UIButton
          label="Dispensar"
          variant="fantasma"
          @click="dismiss('demo')"
        />
      </div>
    </section>

    <section v-if="showMood" class="banner">
      <p class="banner__text">
        <b class="pt-hand">🎨 Quer deixar com a sua cara?</b>
        <span class="banner__sub">
          Escolha cores, fonte e densidade nos Ajustes.
        </span>
      </p>
      <div class="banner__actions">
        <UIButton label="Personalizar" variant="primal" @click="personalize" />
        <UIButton
          label="Agora não"
          variant="fantasma"
          @click="dismiss('mood')"
        />
      </div>
    </section>

    <section v-if="showGamification" class="banner">
      <p class="banner__text">
        <b class="pt-hand">⚡ Ativar ofensiva &amp; XP?</b>
        <span class="banner__sub">
          Streak, níveis e conquistas. Fica desligado se preferir.
        </span>
      </p>
      <div class="banner__actions">
        <UIButton label="Ativar" variant="primal" @click="enableGamification" />
        <UIButton
          label="Manter discreto"
          variant="fantasma"
          @click="dismiss('gamification')"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.banners {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--pt-radius);
  border: 1.5px dashed var(--pt-accent);
  background: var(--pt-card);
}
.banner__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  margin: 0;
}
.banner__text b {
  font-size: calc(16px * var(--pt-text-scale));
  font-weight: 700;
}
.banner__sub {
  font-size: calc(13px * var(--pt-text-scale));
  color: var(--pt-ink-muted);
}
.banner__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
