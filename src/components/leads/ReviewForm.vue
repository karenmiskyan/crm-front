<template>
  <q-dialog
    :model-value="isModalOpen"
    @hide="closed"
    full-height
  >
    <q-card class="full-height" style="width: 950px; max-width: 90vw;">
      <q-card-section>
        <div class="flex justify-between text-h6">
          <span>Review</span>
          <span>{{ lead.name }}</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-px-none">
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-dark text-white shadow-2"
        >
          <q-tab name="profile" icon="manage_accounts" label="Profile"/>
          <q-tab name="notes" icon="sticky_note_2" label="Notes"/>
          <q-tab name="activity" icon="history" label="Activity" @click="updateActivityList"/>
          <q-tab name="attachments" icon="attach_file" label="Attachments"/>
          <q-tab name="transactions" icon="assignment_add" label="Transactions"/>
          <q-tab name="email" icon="email" label="Send Email"/>
          <q-tab name="edit" icon="edit" label="Edit"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="profile">
            <profile-tab :lead="lead"></profile-tab>
          </q-tab-panel>

          <q-tab-panel name="notes">
            <notes-tab :lead="lead"></notes-tab>
          </q-tab-panel>

          <q-tab-panel name="activity">
            <activities-tab :activities="activities"></activities-tab>
          </q-tab-panel>

          <q-tab-panel name="attachments">
            <attachments-tab :lead="lead"></attachments-tab>
          </q-tab-panel>

          <q-tab-panel name="transactions">
            <transactions-tab :lead="lead"></transactions-tab>
          </q-tab-panel>

          <q-tab-panel name="email">
            <email-tab :lead="lead"></email-tab>
          </q-tab-panel>

          <q-tab-panel name="edit">
            <edit-tab @leadUpdated="leadInfoUpdated" :lead="lead"></edit-tab>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-dark">
        <q-btn flat label="OK" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import Profile from "components/leads/review/Profile.vue";
import Notes from "components/leads/review/Notes.vue";
import Attachments from "components/leads/review/Attachments.vue";
import Email from "components/leads/review/Email.vue";
import Edit from "components/leads/review/Edit.vue";
import Activities from "components/leads/review/Activities.vue";
import Transactions from "components/leads/review/Transactions.vue";
import {computed, ref} from "vue";
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";

export default {
  components: {
    'profile-tab': Profile,
    'notes-tab': Notes,
    'attachments-tab': Attachments,
    'email-tab': Email,
    'edit-tab': Edit,
    'activities-tab': Activities,
    'transactions-tab': Transactions,
  },
  props: {
    isModalOpen: Boolean,
    editLead: Object
  },
  data() {
    return {
      tab: 'profile',
    }
  },
  methods: {
    closed() {
      this.$emit('modal-closed')
    },
    leadInfoUpdated(data) {
      this.lead.value = data
    },
    updateActivityList() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }

      api.get(`api/leads/${this.lead.id}`, {headers}).then((response) => {
        this.activities = response.data.activity_logs ? response.data.activity_logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : []
      })
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const lead = ref(computed(() => props.editLead))
    const activities = ref([])
    return {
      lead,
      activities,
      authStore
    }
  }
}
</script>
