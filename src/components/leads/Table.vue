<template>
  <div class="q-px-md">
    <q-table
      flat bordered
      ref="leadsTable"
      row-key="id"
      binary-state-sort
      class="my-sticky-column-table"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :filter="filter"
      :selected-rows-label="getSelectedString"
      v-model:pagination="pagination"
      selection="multiple"
      @request="onRequest"
      v-model:selected="selectedLeads"
      @update:selected="$emit('table-selected', selectedLeads)"
    >
      <template v-slot:body-cell-actions="scope">
        <q-td auto-width>
          <q-btn flat round color="dark" icon="remove_red_eye" @click="editLead(scope.row)"/>
        </q-td>
      </template>
      <template v-slot:body-cell-created_by="scope">
        <q-td auto-width>
          {{ assigneeOptions.find(item => item.id === scope.row.created_by).name }}
        </q-td>
      </template>
      <template v-slot:body-cell-phone="scope">
        <q-td auto-width>
          <a v-if="scope.row.phone" :href="'tel:'+scope.row.phone">{{ scope.row.phone }}</a>
          <span v-else>N/A</span>
        </q-td>
      </template>
      <template v-slot:body-cell-tags="scope">
        <q-td auto-width>
          <span v-if="scope.row.tags && scope.row.tags.length">
            <q-chip v-bind:key="tag" v-for="tag of scope.row.tags" clickable @click="$emit('tag-filtered', tag)">{{
                tag
              }}</q-chip>
          </span>
          <span v-else>N/A</span>
        </q-td>
      </template>
      <template v-slot:body-cell-status="scope">
        <q-td auto-width>
          <span v-if="scope.row.status && scope.row.status.length">
            <q-chip style="font-weight: bold" :text-color="statusColors[scope.row.status] ? 'white' : 'black'" :color="statusColors[scope.row.status]">{{
                scope.row.status
              }}</q-chip>
          </span>
          <span v-else>N/A</span>
        </q-td>
      </template>
    </q-table>
    <review-form :is-modal-open="isModalOpen" :edit-lead="editLeadObject"
                 @modalClosed="this.isModalOpen = false"></review-form>
  </div>
</template>

<script>
import {computed, onMounted, ref, watch} from 'vue'
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {useCommonStore} from "stores/common";
import moment from 'moment'
import ReviewForm from "components/leads/ReviewForm.vue";
import {mapState, storeToRefs} from "pinia";
import {objectToQueryString} from "src/common/utils";

const columns = [
  {name: 'company', align: 'left', label: 'Company', field: 'company', sortable: true},
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  {name: 'eclipse_customer_id', align: 'left', label: 'Customer ID', field: 'eclipse_customer_id', sortable: true},
  {
    name: 'tags', label: 'Tags', align: 'left', field: row => row.tags,
  },
  {name: 'phone', label: 'Phone', align: 'left', field: 'phone'},
  {name: 'created_by', label: 'Created By', align: 'left', field: 'created_by'},
  {
    name: 'contact_date',
    align: 'left',
    label: 'Last Contact',
    field: 'contact_date',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  },
  {
    name: 'created_at',
    label: 'Created At',
    align: 'left',
    field: 'created_at',
    sortable: true,
    format: value => moment(value).format('ll'),
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  },
  {
    name: 'source',
    label: 'Source',
    align: 'left',
    field: 'source',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  },
  {
    name: 'status',
    label: 'Status',
    align: 'left',
    field: 'status',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  },
  {name: 'actions', label: '#', align: 'left', field: 'actions'}
]

export default {
  components: {
    'review-form': ReviewForm,
  },
  methods: {
    async onRequest(props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.loading = true

      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage

      const startRow = (page - 1) * rowsPerPage

      const data = await this.receiveLeads(startRow, page, fetchCount, filter, sortBy, descending)

      this.commonStore.updateLeads(data.leads);

      this.pagination.rowsNumber = data.total

      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.loading = false
    },
    async receiveLeads(startRow, page, count, filter) {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authStore.token}`
      }
      const queryString = objectToQueryString(filter);

      const response = await api.get(`/api/leads?page=${page}&per_page=${count}&${queryString}`, {headers})

      const data = response.data;

      this.commonStore.updateStatusOptions(response.data.statusOptions);
      this.commonStore.updateAssigneeOptions(response.data.users);
      this.commonStore.updateCreatedBy(response.data.users);
      this.commonStore.updateSourceOptions(response.data.leadSources);
      this.commonStore.updateBranchOptions(response.data.branches);
      const total = data?.leads.total;

      let leads = data.leads.data || [];

      return {leads, total}
    },
    editLead(lead) {

      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }

      api.get(`api/leads/${lead.id}`, {headers}).then((response) => {
        this.isModalOpen = true;
        this.editLeadObject = response.data

        this.commonStore.updateReviewingLead(response.data);
      })
    },
  },
  props: {
    filter: Object
  },
  computed: {
    ...mapState(useCommonStore, ['leads'])
  },
  setup() {
    const editLeadObject = ref(null);
    const isModalOpen = ref(false)
    const authStore = useAuthStore();
    const commonStore = useCommonStore();
    const selectedLeads = ref([])

    const assigneeOptions = ref(computed(() => commonStore.assigneeOptions));

    const rows = computed(() => commonStore.leads)

    const leadsTable = ref()
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })

    onMounted(() => {
      leadsTable.value.requestServerInteraction()
    })

    const statusColors = {
      'New': 'positive',
      'Contacted': 'info',
      'Lost': 'negative',
      'Invalid': 'negative',
      'Existing Customer': 'primary',
      'New Customer': 'secondary'
    }

    return {
      rows,
      selectedLeads,
      columns,
      authStore,
      commonStore,
      leadsTable,
      loading,
      pagination,
      editLeadObject,
      isModalOpen,
      assigneeOptions,
      statusColors,
      getSelectedString() {
        return selectedLeads.value.length === 0 ? '' : `${selectedLeads.value.length} record${selectedLeads.value.length > 1 ? 's' : ''} selected of ${rows.value.length}`
      }
    }
  }
}
</script>

<style lang="sass">
.my-sticky-column-table
  tr:nth-child(1) th:nth-child(2)
    background-color: #fafafa
    border-right: 1px solid rgba(0, 0, 0, 0.12)
    border-left: 1px solid rgba(0, 0, 0, 0.12)

  td:nth-child(2)
    background-color: #fafafa
    border-right: 1px solid rgba(0, 0, 0, 0.12)
    border-left: 1px solid rgba(0, 0, 0, 0.12)

  th:nth-child(2),
  td:nth-child(2)
    position: sticky
    left: 0
    z-index: 1

</style>
