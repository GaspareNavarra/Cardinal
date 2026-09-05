<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :header="manga?.title"
    :style="{ width: '90vw', maxWidth: '600px' }"
    class="add-volumes-dialog"
  >
    <div v-if="loadingEditions" class="d-flex justify-content-center py-4">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <div v-else-if="candidates" class="d-flex flex-column gap-2">
      <p class="text-muted mb-2">
        Non sono riuscito a capire con certezza quale sia la serie su AnimeClick. Scegli quella
        giusta, oppure salta e inserisci i volumi a mano.
      </p>
      <Button
        v-for="c in candidates"
        :key="c.id"
        :label="c.title"
        severity="secondary"
        outlined
        class="text-start"
        @click="pickCandidate(c)"
      />
      <Button label="Salta, inserisco a mano" text @click="skipToManual" />
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div v-if="publisherInfo" class="publisher-info">
        <span v-if="publisherInfo.publisher"
          >Editore: <strong>{{ publisherInfo.publisher }}</strong></span
        >
        <span v-if="publisherInfo.italianStatus"
          >Stato IT: <strong>{{ publisherInfo.italianStatus }}</strong></span
        >
        <span v-if="publisherInfo.jpVolumes"
          >Volumi JP: <strong>{{ publisherInfo.jpVolumes }}</strong></span
        >
      </div>
      <p v-else class="text-muted small mb-0">
        Nessun dato trovato su AnimeClick per questa serie: aggiungi i volumi a mano.
      </p>

      <div v-if="!volumeRows.length" class="empty-state-inline">
        <p class="text-muted mb-2">Nessun volume in elenco.</p>
      </div>

      <div v-else class="volume-list">
        <div v-for="(row, index) in volumeRows" :key="row.key" class="volume-row">
          <div class="volume-row-main">
            <InputNumber
              v-if="row.editableNumber"
              v-model="row.number"
              class="volume-number-input"
              :min="1"
              placeholder="N."
            />
            <span v-else class="volume-number">{{ row.specialLabel || `Vol. ${row.number}` }}</span>
            <InputText
              v-model="row.copyLabel"
              placeholder="Nota copia (es. variant)"
              class="copy-label-input"
            />
          </div>
          <SelectButton
            v-model="row.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="status-select"
          />
          <div class="volume-row-actions">
            <Button
              icon="pi pi-copy"
              text
              rounded
              v-tooltip.top="'Aggiungi un\'altra copia di questo volume'"
              @click="addCopy(row)"
            />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="removeRow(index)" />
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <Button label="+ Volume extra" size="small" text @click="addExtraVolume" />
        <Button
          v-for="special in specialEditions"
          :key="special.label"
          :label="`+ ${special.label}`"
          size="small"
          text
          @click="addSpecialEdition(special)"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Annulla" severity="secondary" text @click="close" />
      <Button
        v-if="!candidates"
        label="Salva"
        :loading="saving"
        :disabled="!volumeRows.length"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import { getItalianEditions } from '@/DataRetriever'

let rowKeySeq = 0

export default {
  name: 'AddVolumesDialog',
  components: { Dialog, Button, SelectButton, InputNumber, InputText, ProgressSpinner },
  inject: ['showToast'],
  props: {
    visible: { type: Boolean, default: false },
    manga: { type: Object, default: null },
  },
  emits: ['update:visible', 'saved'],
  data() {
    return {
      loadingEditions: false,
      saving: false,
      candidates: null,
      publisherInfo: null,
      volumeRows: [],
      specialEditions: [],
      statusOptions: [
        { label: 'Posseduto', value: 'posseduto' },
        { label: 'In arrivo', value: 'in_arrivo' },
        { label: 'Letto', value: 'letto' },
      ],
    }
  },
  watch: {
    visible(isVisible) {
      if (isVisible) this.open()
    },
  },
  methods: {
    makeRow({ number = null, specialLabel = null, editableNumber = false } = {}) {
      return {
        key: `row-${rowKeySeq++}`,
        number,
        specialLabel,
        editableNumber,
        copyLabel: '',
        status: 'posseduto',
      }
    },
    async open() {
      this.candidates = null
      this.publisherInfo = null
      this.volumeRows = []
      this.specialEditions = []
      this.loadingEditions = true
      try {
        const result = await getItalianEditions(this.manga.title)
        this.applyResult(result)
      } finally {
        this.loadingEditions = false
      }
    },
    applyResult(result) {
      if (result.candidates?.length) {
        this.candidates = result.candidates
        return
      }
      this.candidates = null
      this.publisherInfo =
        result.publisher || result.italianStatus || result.jpVolumes
          ? {
              publisher: result.publisher,
              italianStatus: result.italianStatus,
              jpVolumes: result.jpVolumes,
            }
          : null
      this.volumeRows = (result.italianVolumes || []).map((v) => this.makeRow({ number: v.number }))
      this.specialEditions = result.specialEditions || []
    },
    async pickCandidate(candidate) {
      this.loadingEditions = true
      try {
        const result = await getItalianEditions(this.manga.title, candidate)
        this.applyResult(result)
      } finally {
        this.loadingEditions = false
      }
    },
    skipToManual() {
      this.candidates = null
      this.publisherInfo = null
      this.volumeRows = []
      this.specialEditions = []
    },
    addCopy(row) {
      const index = this.volumeRows.indexOf(row)
      this.volumeRows.splice(
        index + 1,
        0,
        this.makeRow({ number: row.number, specialLabel: row.specialLabel }),
      )
    },
    removeRow(index) {
      this.volumeRows.splice(index, 1)
    },
    addExtraVolume() {
      const maxNumber = this.volumeRows.reduce((max, r) => Math.max(max, r.number || 0), 0)
      this.volumeRows.push(this.makeRow({ number: maxNumber + 1, editableNumber: true }))
    },
    addSpecialEdition(special) {
      this.volumeRows.push(this.makeRow({ specialLabel: special.label }))
    },
    close() {
      this.$emit('update:visible', false)
    },
    async handleSave() {
      this.saving = true
      try {
        const {
          data: { user },
        } = await this.$supabase.auth.getUser()
        if (!user) throw new Error('Utente non autenticato')

        const { data: series, error: seriesError } = await this.$supabase
          .from('series')
          .upsert(
            {
              anilist_id: this.manga.anilist_id,
              title: this.manga.title,
              image_url: this.manga.images?.jpg?.image_url,
              jp_volumes: this.publisherInfo?.jpVolumes ?? this.manga.jpVolumes ?? null,
              italian_status: this.publisherInfo?.italianStatus ?? null,
              italian_publisher: this.publisherInfo?.publisher ?? null,
            },
            { onConflict: 'anilist_id' },
          )
          .select()
          .single()
        if (seriesError) throw seriesError

        const { data: userSeries, error: userSeriesError } = await this.$supabase
          .from('user_series')
          .upsert({ user_id: user.id, series_id: series.id }, { onConflict: 'user_id,series_id' })
          .select()
          .single()
        if (userSeriesError) throw userSeriesError

        const volumeRows = this.volumeRows.map((row) => ({
          user_series_id: userSeries.id,
          volume_number: row.number,
          special_label: row.specialLabel,
          copy_label: row.copyLabel || null,
          status: row.status,
        }))

        const { error: volumesError } = await this.$supabase.from('volumes').insert(volumeRows)
        if (volumesError) throw volumesError

        this.showToast({
          severity: 'success',
          summary: 'Volumi aggiunti',
          detail: `${volumeRows.length} volumi aggiunti a ${this.manga.title}`,
          life: 4000,
        })
        this.$emit('saved')
        this.close()
      } catch (error) {
        console.log(error)
        this.showToast({
          severity: 'error',
          summary: 'Errore salvataggio',
          detail: 'Non sono riuscito a salvare i volumi, riprova',
          life: 4000,
        })
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.publisher-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.volume-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 45vh;
  overflow-y: auto;
}

.volume-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.volume-row-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  min-width: 0;
}

.volume-number {
  font-weight: 600;
  white-space: nowrap;
  min-width: 4.5rem;
}

.volume-number-input {
  width: 4.5rem;
}

.copy-label-input {
  flex: 1 1 auto;
  min-width: 0;
}

.status-select {
  flex-shrink: 0;
}

.volume-row-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}
</style>
