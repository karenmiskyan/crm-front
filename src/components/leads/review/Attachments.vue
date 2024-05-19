<template>
  <div class="text-h6 q-pb-md">Attachments</div>
  <div class="q-pb-md">
    <q-list v-if="attachments.length" bordered separator>
      <q-item v-bind:key="attachment.id" v-for="attachment of attachments">
        <q-item-section>
          <a :href="API_URL + attachment.file_path" target="_blank">{{ attachment.file_name }}</a>
        </q-item-section>
        <q-item-section side>{{ moment(attachment.created_at).format('YYYY-MM-D / h:mm:ss a') }}</q-item-section>
      </q-item>
    </q-list>
  </div>
  <div>
    <q-file clearable outlined v-model="attachedFile">
      <template v-slot:prepend>
        <q-icon name="attach_file"/>
      </template>
    </q-file>
  </div>
  <div class="q-pt-lg">
    <q-btn color="dark" :disable="!attachedFile" label="Upload" @click="uploadFile"/>
  </div>

</template>
<script>
import {computed, ref} from "vue";
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {useQuasar} from "quasar";
import moment from "moment";
import {useLeadReviewStore} from "stores/lead_review";

export default {
  methods: {
    uploadFile() {
      const formData = new FormData();

      const headers = {
        Authorization: `Bearer ${this.authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }

      formData.append('attachment', this.attachedFile);

      api.post(`/api/leads/${this.reviewingLead.id}/attachments`, formData, {headers}).then((response) => {
        this.quasar.notify({
          message: 'Attachment created successfully',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'dark'
        })
        this.attachedFile = null
        this.attachments.push(response.data)
      })
    },
  },
  setup() {
    const authStore = useAuthStore();
    const leadReviewStore = useLeadReviewStore();
    const reviewingLead = leadReviewStore.reviewingLead;
    const attachedFile = ref(null)
    const quasar = useQuasar();
    const attachments = computed(() => leadReviewStore.reviewingLead.attachments)
    const API_URL = process.env.API_URL
    return {
      authStore,
      attachedFile,
      attachments,
      moment,
      API_URL,
      quasar,
      reviewingLead
    }
  }
}
</script>
