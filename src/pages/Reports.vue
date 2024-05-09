<template>
  <div class="page-header flex justify-between items-center">
    <h5 class="q-my-md">Reports</h5>
  </div>
  <div>
    <h6 class="q-mx-md q-my-md">Activity</h6>
    <activity-chart></activity-chart>
    <q-separator></q-separator>
    <h6 class="q-mx-md q-my-md">Leads</h6>
    <lead-chart></lead-chart>
  </div>

</template>
<script>
import ActivityChart from "components/reports/ActivityChart.vue";
import LeadChart from "components/reports/LeadChart.vue";
import {useCommonStore} from "stores/common";

export default {
  components: {
    'activity-chart': ActivityChart,
    'lead-chart': LeadChart,
  },
  setup() {
    const commonStore = useCommonStore();
    commonStore.updateState();

    return {}
  }
}
</script>
