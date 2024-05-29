<template>
  <div class="text-h6 q-pb-md">Notes</div>
  <q-list v-if="notes.length" bordered separator>
    <q-item v-bind:key="note.id" v-for="note of notes">
      <q-item-section>
        <div v-html="note.content"/>
        <q-item-label caption>{{ note.user.name }}</q-item-label>
      </q-item-section>
      <q-item-section side>{{ note.date }}</q-item-section>
    </q-item>
  </q-list>
  <div class="q-py-md q-gutter-sm">
    <q-editor placeholder="Content" v-model="note" min-height="5rem"/>
  </div>
  <div class="q-py-md">
    <q-input filled v-model="dateTime" label="Date Time">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="dateTime" mask="YYYY-MM-DD HH:mm" label="Date Time">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat/>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time v-model="dateTime" mask="YYYY-MM-DD HH:mm" format24h>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat/>
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
  <div class="q-py-sm">
    <q-btn color="dark" :disable="!note.length" label="Leave Note" @click="saveNote"/>
  </div>
</template>
<script>
import {ref} from "vue";
import {useAuthStore} from "stores/auth";
import {api} from "boot/axios";
import {useQuasar} from "quasar";
import {useLeadReviewStore} from "stores/lead_review";

export default {
  methods: {
    saveNote() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      const data = {
        content: this.note,
        date: this.dateTime
      }
      api.post(`/api/leads/${this.lead.id}/note`, data, {headers}).then((response) => {
        this.quasar.notify({
          message: 'Note created successfully',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'dark'
        })

        if (response.data.note) {
          this.notes.push(response.data.note)
        }

        this.note = '';
        this.dateTime = ''
      })
    }
  },
  setup() {
    const authStore = useAuthStore()
    const leadReviewStore = useLeadReviewStore()
    const quasar = useQuasar()
    const lead = leadReviewStore.reviewingLead;

    const notes = leadReviewStore.reviewingLead.notes

    return {
      note: ref(''),
      dateTime: ref(''),
      authStore,
      lead,
      notes,
      quasar,
    }
  }
}
</script>
