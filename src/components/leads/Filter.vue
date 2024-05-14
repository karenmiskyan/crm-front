<template>
  <div class="q-pa-md">
    <div>
      <span class="closing-button">
        <q-icon color="blue-grey-3" @click="openFilterSidebar = !openFilterSidebar" size="md" name="trending_flat"/>
      </span>
    </div>
    <div class="q-pa-md">
      <div class="q-gutter-md row flex column">
        <div v-if="roles.includes('admin') || roles.includes('manager')">
          <q-select
            v-model="createdBy"
            :options="createdByOptions"
            option-value="id"
            option-label="name"
            stack-label
            label="Created By"
            @update:model-value="updateFilter()"
          />
        </div>

        <div>
          <q-select
            v-model="status"
            multiple
            auto-grow
            full-width
            :options="statusOptions"
            @update:model-value="updateFilter()"
            use-chips
            stack-label
            label="Status"
          />
        </div>

        <div>
          <q-select
            v-model="source"
            multiple
            auto-grow
            full-width
            :options="sourceOptions"
            @update:model-value="updateFilter()"
            use-chips
            stack-label
            label="Source"
          />
        </div>

        <div>
          <q-select
            v-model="branch"
            auto-grow
            full-width
            :options="branchOptions"
            @update:model-value="updateFilter()"
            use-chips
            stack-label
            label="Branch"
          />
        </div>

        <div>
          <q-input v-model="lastContact" mask="date" label="Last contact date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="lastContact" @update:model-value="updateFilter()">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div>
          <q-input v-model="createdAtFrom" mask="date" label="Created date from">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="createdAtFrom" @update:model-value="updateFilter()">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div>
          <q-input v-model="createdAtTo" mask="date" label="Created date to">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="createdAtTo" @update:model-value="updateFilter()">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import {computed} from "vue";
import {useLeadsStore} from "stores/leads";
import {useCommonStore} from "stores/common";
import {useAuthStore} from "stores/auth";

const commonStore = useCommonStore();
const leadsStore = useLeadsStore();
const authStore = useAuthStore();

const roles = authStore.user?.roles.map(item => item.name)
const openFilterSidebar = computed({
  get: () => leadsStore.openFilterSidebar,
  set: (value) => leadsStore.openFilterSidebar = value,
})

const statusOptions = computed(() => commonStore.statusOptions);
const sourceOptions = computed(() => commonStore.sourceOptions);
const branchOptions = computed(() => commonStore.branchOptions);
const createdByOptions = computed(() => commonStore.createdByOptions)

const lastContact = computed({
  get: () => leadsStore.filter.filter_contact_date,
  set: (value) => leadsStore.filter.filter_contact_date = value || ''
})
const createdBy = computed({
  get: () => commonStore.assigneeOptions.find(item => item.id === leadsStore.filter.filter_created_by) || null,
  set: (value) => leadsStore.filter.filter_created_by = value.id || ''
})
const createdAtFrom = computed({
  get: () => leadsStore.filter.filter_created_at_from,
  set: (value) => leadsStore.filter.filter_created_at_from = value || ''
})
const createdAtTo = computed({
  get: () => leadsStore.filter.filter_created_at_to,
  set: (value) => leadsStore.filter.filter_created_at_to = value || ''
})
const status = computed({
  get: () => leadsStore.filter.filter_status || null,
  set: (value) => leadsStore.filter.filter_status = value || ''
})
const source = computed({
  get: () => leadsStore.filter.filter_source || null,
  set: (value) => leadsStore.filter.filter_source = value || ''
})
const branch = computed({
  get: () => leadsStore.filter.filter_branch || null,
  set: (value) => leadsStore.filter.filter_branch = value || ''
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
