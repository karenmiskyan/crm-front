<template>
  <q-page>
    <div class="page-header ">
      <h5 class="q-mt-md q-mb-none">Leads</h5>
      <div class="flex justify-between items-center">
        <div class="action-buttons">
          <div class="YL__toolbar-input-container row no-wrap full-width">
            <q-input dense outlined square style="min-width: 250px" v-model="textSearch"
                     @update:model-value="textSearchUpdated" placeholder="Search" class="bg-white full-width col"/>
          </div>
        </div>
        <div class="action-buttons">
          <div class="q-py-md q-gutter-sm">
            <q-btn @click="bulkExportFiltered" :loading="exportLoading" v-if="checkPermission(authStore.roles, 'admin')" label="Export" color="dark" unelevated icon="open_in_new">
              <q-tooltip :delay="1000" :offset="[0, 10]">Export</q-tooltip>
            </q-btn>
            <q-btn-group outline>
              <q-btn color="dark" text-color="white" label="Filter" unelevated icon="tune">
                <q-tooltip :delay="1000" :offset="[0, 10]">Filter</q-tooltip>
                <q-menu>
                  <div class="row no-wrap q-pa-md">
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
                          <q-input v-model="createdAt.from" mask="date" label="Created date from">
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                  <q-date v-model="createdAt.from" @update:model-value="updateFilter()">
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
                          <q-input v-model="createdAt.to" mask="date" label="Created date to">
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                  <q-date v-model="createdAt.to" @update:model-value="updateFilter()">
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
                </q-menu>
              </q-btn>
              <q-btn color="dark" unelevated @click="clearFilter" label="Clear filter" icon="filter_alt_off">
                <q-tooltip :delay="1000" :offset="[0, 10]">Clear Filter</q-tooltip>
              </q-btn>
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
    <BulkUpdateDialog @updated="this.selectedLeads.length = 0" :isOpen="isOpenModal" :selectedLeads="selectedLeads" @modal-closed="isOpenModal = false"></BulkUpdateDialog>
  </q-page>
</template>

<script>
import Table from "components/leads/Table.vue";
import {computed, inject, ref, watchEffect} from "vue";
import {useCommonStore} from "stores/common";
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {useQuasar} from "quasar";
import BulkUpdateDialog from "components/leads/BulkUpdateDialog.vue";
import {checkPermission, objectToQueryString} from "src/common/utils";

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
      clearTimeout(this.requestDelay);

      this.textSearchDelay = setTimeout(async () => {
        this.updateFilter()
      }, 1000)
    },
    clearFilter() {
      this.createdBy = '';
      this.status = [];
      this.lastContact = '';
      this.textSearch = '';
      this.createdAt = {
        from: '',
        to: ''
      };
      this.textSearch = '';
      this.branch = undefined;

      this.updateFilter();
    },
    updateTextSearch(data) {
      this.textSearch = data
      this.updateFilter()
    },
    updateFilter() {
      this.filter = {
        filter_status: this.status || '',
        filter_created_by: this.createdBy?.id || '',
        filter_general: this.textSearch || '',
        filter_branch: this.branch || '',
        filter_contact_date: this.lastContact || '',
        filter_created_at_from: this.createdAt?.from || '',
        filter_created_at_to: this.createdAt?.to || ''
      }
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

        this.exportLoading = false
      } catch (error) {
        console.error('Failed to download CSV:', error);
      }
    },
    bulkDeleteSelected() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      api.delete(`/api/bulk-delete?${objectToQueryString({ids: this.selectedLeads.map(item => item.id)})}`, {headers})
        .then(() => {
          this.updateFilter()
          this.selectedLeads.length = 0;
        })
    },
    clearCreatedAt() {
      this.createdAt = {
        from: '',
        to: ''
      };
      this.updateFilter()
    },
    confirmDeletion() {
      this.$q.dialog({
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
    }
  },
  setup() {
    const store = useCommonStore();
    const authStore = useAuthStore();
    const $q = useQuasar()

    const createdBy = ref('');
    const status = ref([]);
    const lastContact = ref('');
    const createdAt = ref({
      from: '',
      to: ''
    });

    const textSearch = ref('');
    const branch = ref();
    const disableBulkUpdate = ref(true)
    const selectedLeads = ref([]);

    const textSearchDelay = ref()

    const statusOptions = computed(() => store.statusOptions);
    const assigneeOptions = computed(() => store.assigneeOptions);
    const sourceOptions = computed(() => store.sourceOptions);
    const branchOptions = computed(() => store.branchOptions);

    const isOpenModal = ref(false)

    let filter = ref({
      filter_status: [],
      filter_created_by: '',
      filter_general: '',
      filter_contact_date: ''
    });

    const createdByOptions = computed(() => store.createdByOptions)

    const roles = authStore.user?.roles.map(item => item.name)

    return {
      authStore,
      store,
      $q,

      createdByOptions,
      branchOptions,
      statusOptions,
      lastContact,
      createdBy,
      createdAt,
      status,
      branch,
      textSearch,

      roles,

      filter,
      disableBulkUpdate,
      selectedLeads,
      assigneeOptions,
      sourceOptions,
      textSearchDelay,

      exportLoading: ref(false),
      isOpenModal
    }
  }
};
</script>
