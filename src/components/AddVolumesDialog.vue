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
        <span v-if="detectedVolumeCount"
          >Volumi disponibili in Italia: <strong>{{ detectedVolumeCount }}</strong></span
        >
        <span v-else-if="publisherInfo.jpVolumes"
          >Volumi JP: <strong>{{ publisherInfo.jpVolumes }}</strong></span
        >
      </div>
      <p v-else-if="!isEditing" class="text-muted small mb-0">
        Nessun dato trovato su AnimeClick per questa serie: aggiungi i volumi a mano.
      </p>

      <p class="text-muted small mb-1">
        Segna quali volumi possiedi davvero: nessuno è selezionato di default, anche se magari hai il
        13 ma non l'11. Usa l'intervallo qui sotto per segnarne tanti insieme, poi correggi i singoli
        se serve.
      </p>

      <div class="default-status-bar">
        <span class="default-status-label">Stato per i volumi che segno ora:</span>
        <SelectButton
          v-model="defaultStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="status-select"
        />
      </div>

      <div class="range-add-bar">
        <span class="range-label">Segna un intervallo come posseduto</span>
        <div class="range-controls">
          <div class="range-inputs">
            <InputNumber v-model="rangeFrom" :min="1" placeholder="Da" />
            <span class="range-sep">–</span>
            <InputNumber v-model="rangeTo" :min="1" placeholder="A" />
          </div>
          <Button label="Segna" size="small" severity="contrast" @click="addRange" />
        </div>
      </div>

      <div v-if="!volumeRows.length" class="empty-state-inline">
        <p class="text-muted mb-2">Nessun volume in elenco.</p>
      </div>

      <div v-else class="volume-list">
        <div
          v-for="(row, index) in volumeRows"
          :key="row.key"
          class="volume-row"
          :class="{ 'volume-row-unowned': !row.owned }"
        >
          <div class="volume-row-top">
            <Checkbox
              :modelValue="row.owned"
              :binary="true"
              v-tooltip.top="'Lo possiedo'"
              @update:modelValue="toggleOwned(row, $event)"
            />
            <div class="volume-row-main">
              <InputNumber
                v-if="row.editableNumber"
                v-model="row.number"
                class="volume-number-input"
                :min="1"
                placeholder="N."
              />
              <span v-else class="volume-number">{{
                row.specialLabel || `Vol. ${row.number}`
              }}</span>
              <InputText
                v-model="row.copyLabel"
                placeholder="Nota copia (es. variant)"
                class="copy-label-input"
              />
            </div>
          </div>
          <div class="volume-row-bottom">
            <SelectButton
              v-model="row.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :disabled="!row.owned"
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
        :disabled="!isEditing && !ownedRows.length"
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
import Checkbox from 'primevue/checkbox'
import ProgressSpinner from 'primevue/progressspinner'
import { getItalianEditions } from '@/DataRetriever'

let rowKeySeq = 0

export default {
  name: 'AddVolumesDialog',
  components: { Dialog, Button, SelectButton, InputNumber, InputText, Checkbox, ProgressSpinner },
  inject: ['showToast'],
  props: {
    visible: { type: Boolean, default: false },
    manga: { type: Object, default: null },
    // Presente solo quando si modifica una serie già in collezione:
    // { userSeriesId, volumes: [righe grezze dalla tabella volumes] }.
    editEntry: { type: Object, default: null },
  },
  emits: ['update:visible', 'saved'],
  data() {
    return {
      loadingEditions: false,
      saving: false,
      candidates: null,
      publisherInfo: null,
      detectedVolumeCount: 0,
      volumeRows: [],
      specialEditions: [],
      rangeFrom: null,
      rangeTo: null,
      // Id delle righe volumes già salvate rimosse col cestino durante questa
      // sessione di modifica: vanno cancellate dal DB anche se, sparendo
      // dall'elenco, non compaiono più tra volumeRows al momento del salvataggio.
      deletedDbIds: [],
      // Stato applicato ai volumi nel momento in cui vengono segnati come
      // posseduti (checkbox, intervallo, copia, extra...): impostabile in
      // anticipo così non serve poi ritoccare ogni riga una per una.
      defaultStatus: 'posseduto',
      statusOptions: [
        { label: 'Posseduto', value: 'posseduto' },
        { label: 'In arrivo', value: 'in_arrivo' },
        { label: 'Letto', value: 'letto' },
      ],
    }
  },
  computed: {
    ownedRows() {
      return this.volumeRows.filter((row) => row.owned)
    },
    isEditing() {
      return !!this.editEntry
    },
  },
  watch: {
    visible(isVisible) {
      if (isVisible) this.open()
    },
  },
  methods: {
    makeRow({ number = null, specialLabel = null, editableNumber = false, owned = false } = {}) {
      return {
        key: `row-${rowKeySeq++}`,
        number,
        specialLabel,
        editableNumber,
        copyLabel: '',
        // Usa lo stato di default scelto in alto: se la riga nasce già
        // "posseduta" (es. volume extra) riflette subito quella scelta.
        status: this.defaultStatus,
        // Nessuno selezionato di default: una collezione è quasi sempre parziale
        // (es. hai il 13 ma non l'11), quindi va segnato esplicitamente cosa hai
        // davvero invece di partire dal presupposto di possedere tutto.
        owned,
      }
    },
    // Riga costruita da una riga GIA' salvata in tabella volumes (modalità
    // modifica): a differenza di makeRow tiene traccia del suo dbId, così al
    // salvataggio si può fare un update mirato invece di un insert duplicato.
    makeExistingRow(v) {
      return {
        key: `row-${rowKeySeq++}`,
        dbId: v.id,
        number: v.volume_number,
        specialLabel: v.special_label,
        editableNumber: false,
        copyLabel: v.copy_label || '',
        status: v.status,
        owned: true,
      }
    },
    // Applica lo stato di default nel momento esatto in cui una riga viene
    // spuntata, non solo alla creazione: se l'utente cambia lo stato di
    // default DOPO che i volumi erano già stati rilevati, la scelta si
    // riflette comunque su ciò che spunta da quel momento in poi.
    toggleOwned(row, owned) {
      row.owned = owned
      if (owned) row.status = this.defaultStatus
    },
    async open() {
      this.candidates = null
      this.rangeFrom = null
      this.rangeTo = null
      this.defaultStatus = 'posseduto'
      this.deletedDbIds = []

      if (this.editEntry) {
        // Modifica di una serie già in collezione: i volumi salvati sono la
        // fonte di verità, non serve rifare la ricerca su AnimeClick (i dati
        // editore/stato sono già quelli salvati la prima volta sulla serie).
        this.publisherInfo =
          this.manga.italianPublisher || this.manga.italianStatus
            ? { publisher: this.manga.italianPublisher, italianStatus: this.manga.italianStatus }
            : null
        this.detectedVolumeCount = 0
        this.specialEditions = []
        this.volumeRows = (this.editEntry.volumes || [])
          .slice()
          .sort((a, b) => (a.volume_number ?? Infinity) - (b.volume_number ?? Infinity))
          .map((v) => this.makeExistingRow(v))
        this.loadingEditions = false
        return
      }

      this.publisherInfo = null
      this.detectedVolumeCount = 0
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
      this.detectedVolumeCount = result.italianVolumes?.length || 0
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
      // Cliccare "aggiungi copia" è già di per sé la dichiarazione di possederla.
      this.volumeRows.splice(
        index + 1,
        0,
        this.makeRow({ number: row.number, specialLabel: row.specialLabel, owned: true }),
      )
    },
    removeRow(index) {
      const row = this.volumeRows[index]
      // Se la riga era già salvata, sparire dall'elenco non basta: va
      // ricordata per essere cancellata davvero dal DB al salvataggio.
      if (row?.dbId) this.deletedDbIds.push(row.dbId)
      this.volumeRows.splice(index, 1)
    },
    addExtraVolume() {
      const maxNumber = this.volumeRows.reduce((max, r) => Math.max(max, r.number || 0), 0)
      this.volumeRows.push(
        this.makeRow({ number: maxNumber + 1, editableNumber: true, owned: true }),
      )
    },
    addSpecialEdition(special) {
      this.volumeRows.push(this.makeRow({ specialLabel: special.label, owned: true }))
    },
    // Segna in blocco un intervallo (es. dal 1 al 13): riusa le righe già
    // rilevate se esistono (le spunta soltanto), altrimenti le crea. Senza
    // questo, spuntare una collana lunga volume per volume sarebbe troppo
    // lento per essere usabile.
    addRange() {
      const from = this.rangeFrom
      const to = this.rangeTo
      if (!from || !to || to < from) {
        this.showToast({
          severity: 'warn',
          summary: 'Intervallo non valido',
          detail: "Inserisci un numero di partenza e uno d'arrivo validi",
          life: 3000,
        })
        return
      }
      if (to - from > 300) {
        this.showToast({
          severity: 'warn',
          summary: 'Intervallo troppo ampio',
          detail: 'Prova con un intervallo più piccolo',
          life: 3000,
        })
        return
      }
      for (let number = from; number <= to; number++) {
        const existing = this.volumeRows.find((row) => row.number === number && !row.specialLabel)
        if (existing) {
          existing.owned = true
          existing.status = this.defaultStatus
        } else {
          this.volumeRows.push(this.makeRow({ number, editableNumber: true, owned: true }))
        }
      }
      this.volumeRows.sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity))
      this.showToast({
        severity: 'success',
        summary: 'Volumi segnati',
        detail: `Vol. ${from}${to > from ? ` - ${to}` : ''} segnati come posseduti`,
        life: 3000,
      })
      this.rangeFrom = null
      this.rangeTo = null
    },
    close() {
      this.$emit('update:visible', false)
    },
    async handleSave() {
      // In modifica si può salvare anche azzerando tutto (rimuovendo tutti i
      // volumi): solo per una serie NUOVA non ha senso salvare senza aver
      // segnato nulla.
      if (!this.isEditing && !this.ownedRows.length) {
        this.showToast({
          severity: 'warn',
          summary: 'Nessun volume selezionato',
          detail: 'Segna quali volumi possiedi (checkbox) prima di salvare',
          life: 4000,
        })
        return
      }
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

        // Righe già presenti in DB (hanno un dbId) rimaste nell'elenco: se
        // ancora spuntate vanno aggiornate (stato/nota possono essere
        // cambiati), se sono state deselezionate vanno cancellate. Le righe
        // rimosse col cestino sono già in deletedDbIds. Le righe nuove (senza
        // dbId) spuntate vanno inserite.
        const existingRows = this.volumeRows.filter((row) => row.dbId)
        const uncheckedExistingIds = existingRows
          .filter((row) => !row.owned)
          .map((row) => row.dbId)
        const toDeleteIds = [...new Set([...this.deletedDbIds, ...uncheckedExistingIds])]
        const toUpdate = existingRows.filter((row) => row.owned)
        const toInsert = this.ownedRows.filter((row) => !row.dbId)

        if (toDeleteIds.length) {
          const { error } = await this.$supabase.from('volumes').delete().in('id', toDeleteIds)
          if (error) throw error
        }

        if (toUpdate.length) {
          const { error } = await this.$supabase.from('volumes').upsert(
            toUpdate.map((row) => ({
              id: row.dbId,
              user_series_id: userSeries.id,
              volume_number: row.number,
              special_label: row.specialLabel,
              copy_label: row.copyLabel || null,
              status: row.status,
            })),
          )
          if (error) throw error
        }

        if (toInsert.length) {
          const { error } = await this.$supabase.from('volumes').insert(
            toInsert.map((row) => ({
              user_series_id: userSeries.id,
              volume_number: row.number,
              special_label: row.specialLabel,
              copy_label: row.copyLabel || null,
              status: row.status,
            })),
          )
          if (error) throw error
        }

        this.showToast({
          severity: 'success',
          summary: this.isEditing ? 'Collezione aggiornata' : 'Volumi aggiunti',
          detail: this.isEditing
            ? `Modifiche salvate per ${this.manga.title}`
            : `${toInsert.length} volumi aggiunti a ${this.manga.title}`,
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

.default-status-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.default-status-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

/* Barra dell'intervallo su due righe (etichetta sopra, controlli sotto):
   tutto su una riga sola andava troppo stretto e il testo si accavallava. */
.range-add-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: rgba(255, 204, 0, 0.06);
  border: 1px solid rgba(255, 204, 0, 0.2);
}

.range-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

.range-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.range-controls .p-button {
  margin-left: auto;
}

@media (max-width: 380px) {
  .range-controls .p-button {
    width: 100%;
    margin-left: 0;
  }
}

.range-sep {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.range-inputs :deep(.p-inputnumber) {
  width: 4rem;
}

.range-inputs :deep(.p-inputnumber-input) {
  width: 100%;
  text-align: center;
}

/* Riga divisa in due gruppi (top = checkbox+numero+nota, bottom =
   stato+azioni) che vanno a capo INTERI come blocco su schermi stretti,
   invece di lasciare che ogni singolo elemento si strizzi per conto suo:
   prima causava input e bottoni accavallati tra loro su mobile. */
.volume-row {
  display: flex;
  align-items: center;
  gap: 0.5rem 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: opacity 0.15s ease;
}

/* Righe non selezionate (non possedute) restano più spente, per distinguerle
   a colpo d'occhio da quelle che verranno davvero salvate. */
.volume-row-unowned {
  opacity: 0.55;
}

.volume-row-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1 1 220px;
  min-width: 0;
}

.volume-row-bottom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  margin-left: auto;
}

@media (max-width: 560px) {
  .volume-row-top,
  .volume-row-bottom {
    flex-basis: 100%;
  }
  .volume-row-bottom {
    margin-left: 0;
    justify-content: space-between;
  }
  .status-select {
    flex: 1 1 auto;
  }
}

.volume-row-main {
  display: flex;
  align-items: center;
  /* wrap (invece di min-width:0 sull'input) evita che la nota si strizzi a
     pochi pixel quando c'è anche l'InputNumber editabile (volumi extra): in
     quel caso scende sotto una riga propria invece di accavallarsi. */
  flex-wrap: wrap;
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
  flex: 0 0 4.5rem;
}

/* Senza questa riga l'input interno di InputNumber resta alla sua larghezza
   nativa del browser (~170px) e sborda fuori dal contenitore da 4.5rem,
   accavallandosi visivamente sul campo "Nota copia" accanto. */
.volume-number-input :deep(.p-inputnumber-input) {
  width: 100%;
  min-width: 0;
}

.copy-label-input {
  /* 140px minimo: sotto quella soglia il campo va a capo (vedi wrap sopra)
     invece di restare visibile ma illeggibile. */
  flex: 1 1 140px;
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
