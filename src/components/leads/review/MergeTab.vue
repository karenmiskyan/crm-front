<template>
  <q-tab-panel name="merge">
    <div class="text-h6">Merge</div>
    <div class="q-py-md">
      <q-input
        dense
        outlined
        square
        style="min-width: 250px"
        v-model="generalSearch"
        label="Search Lead"
        debounce="300"
        @focus="showDropdown = true"
        @blur="hideDropdown"
        @input="onInputValue"
        class="bg-white full-width col"
      />
      <div v-if="showDropdown && filteredLeads.length > 0" class="dropdown">
        <ul>
          <li v-for="lead in filteredLeads" :key="lead.id" @mousedown="leadSelected(lead)">
            {{ lead.company }}
          </li>
        </ul>
      </div>
    </div>
    <div class="q-py-md">
      <q-btn color="primary" :disable="!selectedLead" label="Merge" @click="mergeLead" />
    </div>
    <div class="text-h6">Merged leads</div>
    <div class="q-py-md q-gutter-sm">
      <ul>
        <li v-for="child in localChildren" :key="child.id">Company: {{ child.company }}</li>
      </ul>
    </div>
  </q-tab-panel>
</template>

<script>
import { computed, ref, watch, watchEffect } from "vue";
import { useAuthStore } from "stores/auth";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useLeadsStore } from "stores/leads";

export default {
  name: 'MergeTab',
  props: {
    lead: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const authStore = useAuthStore();
    const leadsStore = useLeadsStore();
    const $q = useQuasar();

    // State variables
    const generalSearch = ref('');
    const selectedLead = ref(null);
    const leads = ref([]);
    const localChildren = ref([...props.lead.children]);
    const showDropdown = ref(false);


    const getLeads = async () => {
      try {
        const response = await api.get(`api/leads/${props.lead.id}/merge-leads`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          params: {
            filter_general: generalSearch.value
          }
        });
        console.log(response.data);
        leads.value = response.data;
      } catch (error) {
        console.error("Error fetching leads:", error);
        leads.value = [];
      } finally {
      }
    };

    // Computed properties
    const filteredLeads = computed(() => {
      return leads.value;
    });

    // Methods
    const onInputValue = (val) => {
      generalSearch.value = val;
      showDropdown.value = true;
    };

    const leadSelected = (lead) => {
      selectedLead.value = lead;
      generalSearch.value = lead.name;
      showDropdown.value = false; // Hide dropdown after selecting
    };

    const hideDropdown = () => {
      // Delay hiding the dropdown to allow selection event to register
      setTimeout(() => {
        showDropdown.value = false;
      }, 200);
    };

    const mergeLead = () => {
      if (selectedLead.value) {
        api.post(`/api/leads/${selectedLead.value.id}/merge`, {
          parent_id: props.lead.id,
        }, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }).then(() => {
          localChildren.value.push(selectedLead.value);
          selectedLead.value = null;
          generalSearch.value = ''; // Clear the search input after merging
          $q.notify({
            message: 'Lead merged successfully',
            position: 'bottom-right',
            actions: [{ icon: 'close', color: 'white' }],
            color: 'dark'
          });
        }).catch(() => {
          $q.notify({
            message: 'Failed to merge lead',
            position: 'bottom-right',
            actions: [{ icon: 'close', color: 'white' }],
            color: 'negative'
          });
        });
      }
    };

    // Watchers
    watch(() => props.lead.children, (newChildren) => {
      localChildren.value = [...newChildren];
    });
    watchEffect(() => {
      getLeads();
    });

    return {
      generalSearch,
      selectedLead,
      localChildren,
      filteredLeads,
      showDropdown,
      onInputValue,
      leadSelected,
      mergeLead,
      hideDropdown,
      authStore,
      leadsStore,
      $q
    };
  }
};
</script>

<style scoped>
.dropdown {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  z-index: 1000;
  width: 100%;
}

.dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown li {
  padding: 8px 16px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: #f0f0f0;
}
</style>
