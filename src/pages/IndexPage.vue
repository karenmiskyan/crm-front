<template>
  <q-page>
    <div class="page-header ">
      <h5 class="q-mt-md q-mb-none">Leads</h5>
      <div class="flex justify-between items-center">
        <div class="action-buttons">
          <div class="YL__toolbar-input-container row no-wrap full-width">
            <q-input dense outlined square style="min-width: 250px" v-model="generalSearch"
                     @update:model-value="textSearchUpdated" placeholder="Search" class="bg-white full-width col"/>
          </div>
        </div>
        <div class="action-buttons">
          <div class="q-py-md q-gutter-sm">
            <!-- <q-btn @click="bulkExportFiltered" :loading="exportLoading" v-if="checkPermission(authStore.roles, 'admin')"
                   label="Export" color="dark" unelevated icon="open_in_new">
              <q-tooltip :delay="1000" :offset="[0, 10]">Export</q-tooltip>
            </q-btn> -->
            <!-- <q-btn @click="filterInactiveLeads" :loading="exportLoading" v-if="checkPermission(authStore.roles, 'admin')"
                   label="Export" color="dark" unelevated icon="open_in_new">
              <q-tooltip :delay="1000" :offset="[0, 10]">Export</q-tooltip>
            </q-btn> -->

            <q-btn-group outline>
              <q-btn color="dark" @click="openInactiveFilterSidebar = !openInactiveFilterSidebar" v-if="checkPermission(authStore.roles, 'admin')"  text-color="white" label="Inactive Filter"
                     unelevated icon="tune"></q-btn>
            </q-btn-group>

            <q-btn-group outline>
              <q-btn color="dark" @click="openFilterSidebar = !openFilterSidebar" text-color="white" label="Filter"
                     unelevated icon="tune"></q-btn>
            </q-btn-group>
            <q-btn :disable="disableBulkUpdate" v-if="checkPermission(authStore.roles, 'admin')"
                   @click="confirmDeletion" label="Delete selected" color="dark"
                   icon="clear" unelevated>
              <q-tooltip :delay="1000" :offset="[0, 10]">Delete Selected</q-tooltip>
            </q-btn>
            <q-btn :disable="disableBulkUpdate" label="Update Selected" @click="isOpenModal = true" color="dark"
                   icon="edit" unelevated>
              <q-tooltip :delay="1000" :offset="[0, 10]">Edit Selected</q-tooltip>
            </q-btn>
            <q-btn color="dark" label="Create lead" text-color="white" @click="$router.push({name: 'leads-create'})"
                   unelevated
                   icon="add">
              <q-tooltip :delay="1000" :offset="[0, 10]">Create Lead</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <LeadsTable :filter="filter" @tagFiltered="updateTextSearch" @tableSelected="tableSelected"></LeadsTable>
    <BulkUpdateDialog @updated="this.selectedLeads = []; this.disableBulkUpdate = true" :isOpen="isOpenModal"
                      :selectedLeads="selectedLeads"
                      @modal-closed="isOpenModal = false"></BulkUpdateDialog>
  </q-page>
</template>

<script>
import Table from "components/leads/Table.vue";
import {computed, ref} from "vue";
import {useCommonStore} from "stores/common";
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {useQuasar} from "quasar";
import BulkUpdateDialog from "components/leads/BulkUpdateDialog.vue";
import {checkPermission, objectToQueryString} from "src/common/utils";
import {useLeadsStore} from "stores/leads";

export default {
  name: 'IndexPage',
  components: {LeadsTable: Table, BulkUpdateDialog: BulkUpdateDialog},
  methods: {
    checkPermission,
    tableSelected(selected) {
      this.disableBulkUpdate = !selected.length
      this.selectedLeads = selected
    },
    textSearchUpdated() {
      clearTimeout(this.textSearchDelay);
      this.textSearchDelay = setTimeout(async () => {
        this.filter_general = this.generalSearch
      }, 500)
    },
    updateTextSearch(data) {
      this.generalSearch = data
      this.filter_general = data
    },
    async bulkExportFiltered() {
      this.exportLoading = true;
      const headers = {
        'Content-Type': 'text/csv',
        Authorization: `Bearer ${this.authStore.token}`
      }

      try {
        const response = await api.get(`/api/bulk-export?${objectToQueryString({...this.filter, ...{ids: this.selectedLeads.map(item => item.id)}})}`, {
          headers,
          responseType: 'arraybuffer',
        });

        const blob = new Blob([response.data], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        this.selectedLeads = []
        this.exportLoading = false
      } catch (error) {
        console.error('Failed to download CSV:', error);
      }
    },
    bulkDeleteSelected() {
      this.leadsStore.isLoading = true
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      api.delete(`/api/bulk-delete?${objectToQueryString({ids: this.selectedLeads.map(item => item.id)})}`, {headers})
        .then(() => {
          this.selectedLeads = [];
          this.disableBulkUpdate = true
          this.filter_general = 'Hello'
          this.filter_general = this.generalSearch
        })
    },
    confirmDeletion() {
      this.quasar.dialog({
        title: `Delete`,
        message: `Are you sure you want to delete the selected leads (${this.selectedLeads.length})?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.bulkDeleteSelected()
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
    filterInactiveLeads() {
      this.leadsStore.filter.filter_inactive = !this.leadsStore.filter.filter_inactive
    }
  },
  setup() {
    const store = useCommonStore();
    const authStore = useAuthStore();
    const leadsStore = useLeadsStore();
    const quasar = useQuasar()

    const selectedLeads = computed({
      get: () => leadsStore.selectedLeads,
      set: (value) => leadsStore.selectedLeads = value
    });

    const disableBulkUpdate = ref(true)

    const textSearchDelay = ref()
    const generalSearch = ref('')

    const filter = computed(() => leadsStore.filter)
    const openFilterSidebar = computed({
      get: () => leadsStore.openFilterSidebar,
      set: (value) => leadsStore.openFilterSidebar = value,
    })
    const openInactiveFilterSidebar = computed({

      get: () => leadsStore.openInactiveFilterSidebar,
      set: (value) => leadsStore.openInactiveFilterSidebar = value,
    })

    const filter_general = computed({
      get: () => leadsStore.filter.filter_general,
      set: (value) => {
        leadsStore.filter.filter_general = value
      }
    });

    const roles = authStore.user?.roles.map(item => item.name)

    const isOpenModal = ref(false)

    return {
      authStore,
      store,
      quasar,
      filter,
      roles,
      selectedLeads,
      exportLoading: ref(false),
      isOpenModal,
      textSearchDelay,
      disableBulkUpdate,

      generalSearch,
      filter_general,
      leadsStore,
      openFilterSidebar,
      openInactiveFilterSidebar,
    }
  }
};
</script>
