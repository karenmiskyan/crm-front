<template>
  <div class="text-h6 q-pb-md">Activities</div>
  <q-list v-if="activities.length" bordered separator>
    <q-item v-bind:key="activity.id" v-for="activity of activities">
      <q-item-section>
        <q-item-label lines="1">{{ users.find(item => item.id === activity.user_id)?.name || 'N/A' }}</q-item-label>
        <q-item-label caption lines="2">
          {{activity.change_info}}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        {{moment(activity.created_at).format('YYYY-MM-D / h:mm:ss a')}}
      </q-item-section>
    </q-item>
  </q-list>

</template>
<script>
import {ref} from "vue";
import {useCommonStore} from "stores/common";
import moment from 'moment'

export default {
  props: {
    activities: Array
  },
  setup() {
    const commonStore = useCommonStore()
    const users = commonStore.assigneeOptions
    return {
      users,
      moment
    }
  }
}
</script>
