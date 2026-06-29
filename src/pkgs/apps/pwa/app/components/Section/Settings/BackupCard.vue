<script setup lang="ts">
const { busy, downloadBackup, importFile } = useBackup();
const { toast } = useToast();

const fileInput = ref<HTMLInputElement | null>(null);

function pickFile() {
  fileInput.value?.click();
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  try {
    const backup = await importFile(file);
    const total =
      backup.contexts.length +
      backup.subjects.length +
      backup.activities.length;
    toast({
      title: "Backup importado",
      description: `${total} itens restaurados`,
    });
  } catch {
    toast({
      title: "Arquivo inválido",
      description: "Não foi possível ler o backup",
    });
  }
}
</script>

<template>
  <UICard pad="18px" class="backup-card">
    <div class="backup-card__head">
      <h2 class="pt-hand backup-card__title">Backup</h2>
      <p class="backup-card__sub">
        Exporte tudo para um arquivo .json ou restaure de um backup anterior.
      </p>
    </div>
    <div class="backup-card__actions">
      <UIButton
        variant="primal"
        icon="download"
        :disabled="busy"
        label="Exportar .json"
        @click="downloadBackup"
      />
      <UIButton
        variant="fantasma"
        icon="arrow-up"
        :disabled="busy"
        label="Importar .json"
        @click="pickFile"
      />
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      class="backup-card__file"
      @change="onFileChange"
    />
  </UICard>
</template>

<style scoped>
.backup-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.backup-card__title {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
}
.backup-card__sub {
  font-size: 13px;
  color: var(--pt-ink-muted);
  margin: 4px 0 0;
}
.backup-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.backup-card__file {
  display: none;
}
</style>
