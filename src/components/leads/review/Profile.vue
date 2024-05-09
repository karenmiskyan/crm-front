<template>
  <div class="text-h6">Profile</div>
  <q-list>
    <q-separator spaced/>

    <q-item>
      <q-item-section>
        <q-item-label>Company</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.company || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Name</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.name || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Email</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>
          <a v-if="reviewingLead.email" :href="'mailto:'+reviewingLead.email">{{ reviewingLead.email }}</a>
          <span v-else>N/A</span>
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Phone</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>
          <a v-if="reviewingLead.phone" :href="'tel:'+reviewingLead.phone">{{ reviewingLead.phone }}</a>
          <span v-else>N/A</span>
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Assigned</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ assigneeOptions.find(item => item.id === reviewingLead.assigned_id)?.name || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Last Contact Date</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.contact_date ? moment(reviewingLead.contact_date).format('ll') : 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Source</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.source || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Status</q-item-label>
      </q-item-section>


      <q-item-section side>
        <q-item-label>
          <q-chip style="font-weight: bold" :text-color="statusColors[reviewingLead.status] ? 'white' : 'black'" :color="statusColors[reviewingLead.status]">{{
              reviewingLead.status || 'N/A'
            }}</q-chip>
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Zip Code</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.zip_code || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Country</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.country || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>State</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.state || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>City</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.city || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Address</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.address || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset/>

    <q-item>
      <q-item-section>
        <q-item-label>Eclipse Customer ID</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>{{ reviewingLead.eclipse_customer_id || 'N/A' }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator spaced/>
  </q-list>
</template>
<script>
import {useCommonStore} from "stores/common";
import {computed, ref} from "vue";
import moment from "moment/moment";

export default {
  computed: {
    moment() {
      return moment
    }
  },
  props: {
    lead: Object
  },
  setup() {
    const commonStore = useCommonStore()
    const assigneeOptions = computed(() => commonStore.assigneeOptions)
    const reviewingLead = ref(computed(() => commonStore.reviewingLead))

    const statusColors = {
      'New': 'positive',
      'Contacted': 'info',
      'Lost': 'negative',
      'Invalid': 'negative',
      'Existing Customer': 'primary',
      'New Customer': 'secondary'
    }

    return {
      commonStore,
      assigneeOptions,
      reviewingLead,
      statusColors
    }
  }
}
</script>
