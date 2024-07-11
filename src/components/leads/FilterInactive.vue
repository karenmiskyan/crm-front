<template>
  <div class="q-pa-md">
    <div>
      <span class="closing-button">
        <q-icon color="blue-grey-3" @click="openInactiveFilterSidebar = !openInactiveFilterSidebar" size="md" name="trending_flat"/>
      </span>
    </div>
    <div class="q-pa-md">
      <div class="q-gutter-md row flex column">
        <div v-if="roles.includes('admin') || roles.includes('manager')">
          <q-select
            v-model="inactiveDate"
            :options="inactiveDateOptions"
            option-value="id"
            option-label="name"
            stack-label
            label="Range"
            @update:model-value="updateFilter()"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>

import {computed} from "vue";
import {useLeadsStore} from "stores/leads";
import {useAuthStore} from "stores/auth";

const leadsStore = useLeadsStore();
const authStore = useAuthStore();

const roles = authStore.user?.roles.map(item => item.name)
const openInactiveFilterSidebar = computed({
  get: () => leadsStore.openInactiveFilterSidebar,
  set: (value) => leadsStore.openInactiveFilterSidebar = value,
})

const inactiveDateOptions = computed(() => ['', '30 days', '3 months', '6 months', '1 year', 'no order'])

const inactiveDate = computed({
  get: () =>  leadsStore.filter.filter_inactive || null ,
  set: (value) => leadsStore.filter.filter_inactive = value || ''
})

function updateFilter() {

}

</script>

<style lang="scss">
.closing-button {
  cursor: pointer;
  & > * {
    position: relative;
    left: 0;
    transition: left 0.3s ease;
  }
  &:hover > * {
    left: 2px;
  }
}
</style>
