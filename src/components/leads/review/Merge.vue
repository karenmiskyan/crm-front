<template>
  <q-page>
      <merge-tab :lead="lead" />
  </q-page>
</template>

<script>
import MergeTab from 'components/leads/review/MergeTab.vue';
import {useLeadReviewStore} from "stores/lead_review";
import {computed, ref} from "vue";

export default {
  components: {
    MergeTab
  },
  
  data() {

    const leadReviewStore = useLeadReviewStore()
    const lead = computed(() => leadReviewStore.reviewingLead)
    return {
      tab: 'merge',
      lead: lead
    };
  }
};
</script>
