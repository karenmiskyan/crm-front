<template>
  <div class="text-h6 q-pb-md">Notes</div>
  <q-list v-if="notes.length" bordered separator>
    <q-item v-bind:key="note.id" v-for="note of notes">
      <q-item-section>
        <div v-html="note.content"/>
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

export default {
  props: {
    lead: Object
  },
  methods: {
    saveNote() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      const data = {
        content: this.note,
        date: this.dateTime
      }
      api.post(`/api/leads/${this.lead.id}/note`, data, {headers}).then(() => {
        this.$q.notify({
          message: 'Note created successfully',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'dark'
        })

        this.notes.push({
          content: this.note,
          date: this.dateTime
        })

        this.note = '';
        this.dateTime = ''
      })
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const $q = useQuasar()

    const notes = ref(props.lead.notes)

    return {
      note: ref(''),
      dateTime: ref(''),
      authStore,
      notes,
      $q,
    }
  }
}
</script>
