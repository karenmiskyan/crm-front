<template>
  <div class="text-h6">Email</div>
  <div class="q-py-md">
    <q-input
      filled
      type="text"
      v-model="subject"
      label="Subject"
    />
  </div>
  <div class="q-py-md q-gutter-sm">
    <q-editor placeholder="Content" v-model="content" min-height="5rem" />
  </div>
  <div class="q-py-sm">
    <q-btn color="dark" :disable="!content.length" label="Send Email" @click="sendEmail" />
  </div>
</template>
<script>
import {computed, ref} from "vue";
import {useAuthStore} from "stores/auth";
import {api} from "boot/axios";
import {useQuasar} from "quasar";
import {useLeadReviewStore} from "stores/lead_review";

export default {
  methods: {
    sendEmail() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      api.post(`/api/send-lead-email/${this.lead.id}`, {
        subject: this.subject,
        email_content: this.content
      },{headers}).then(() => {
        this.quasar.notify({
          message: 'Email sent successfully',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'dark'
        })
        this.subject = ''
        this.content = ''
      })
    }
  },
  setup () {
    const authStore = useAuthStore()
    const leadReviewStore = useLeadReviewStore()
    const lead = computed(() => leadReviewStore.reviewingLead)
    const quasar = useQuasar()

    return {
      subject: ref(''),
      content: ref(''),
      authStore,
      quasar,
      lead,
    }
  }
}
</script>
