<template>
  <div class="q-px-md">
    <q-table
      flat bordered
      ref="leadsTable"
      row-key="id"
      binary-state-sort
      class="my-sticky-column-table"
      :rows="leadRows"
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
      <template v-slot:loading>
        <q-inner-loading style="z-index: 5" showing color="primary"/>
      </template>
      <template v-slot:body-cell-actions="scope">
        <q-td auto-width>
          <q-btn flat round color="dark" icon="remove_red_eye" @click="editLead(scope.row.id)"/>
        </q-td>
      </template>
      <template v-slot:body-cell-company="scope">
        <q-td auto-width>
          <span class="cursor-pointer" @click="editLead(scope.row.id)">{{ scope.row.company }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-created_by="scope">
        <q-td auto-width>
          {{ assigneeOptions.find(item => item.id === scope.row.created_by).name }}
        </q-td>
      </template>
      <template v-slot:body-cell-phone="scope">
        <q-td auto-width>
          <a v-if="scope.row.phone_number.length > 2" :href="`tel:${scope.row.phone_number}`">{{
              scope.row.phone_number
            }}</a>
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
            <q-chip style="font-weight: bold" :text-color="statusColors[scope.row.status] ? 'white' : 'black'"
                    :color="statusColors[scope.row.status]">{{
                scope.row.status
              }}</q-chip>
          </span>
          <span v-else>N/A</span>
        </q-td>
      </template>
      <template v-slot:body-cell-email="scope">
        <q-td auto-width>
          <a :href="`mailto:${scope.row.email}`">{{ scope.row.email }}</a>
        </q-td>
      </template>
    </q-table>
    <review-form :is-modal-open="isModalOpen" :edit-lead="editLeadObject"
                 @modalClosed="this.isModalOpen = false"></review-form>
  </div>
</template>

<script>
import {computed, onMounted, provide, ref, watch} from 'vue'
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {useCommonStore} from "stores/common";
import {useLeadReviewStore} from "stores/lead_review";
import moment from 'moment'
import ReviewForm from "components/leads/ReviewForm.vue";
import {mapState, storeToRefs} from "pinia";
import {objectToQueryString} from "src/common/utils";
import {useLeadsStore} from "stores/leads";

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
  {
    name: 'email',
    required: true,
    label: 'Email',
    align: 'left',
    field: row => row.email,
    format: val => `${val}`,
    sortable: true
  },
  {name: 'eclipse_customer_id', align: 'left', label: 'Customer ID', field: 'eclipse_customer_id', sortable: true},
  {
    name: 'tags', label: 'Tags', align: 'left', field: row => row.tags,
  },
  {name: 'phone', label: 'Phone', align: 'left', field: 'phone_number'},
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
      this.loading = true
      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      this.leadsStore.request(page, fetchCount)
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
    },
    editLead(leadId) {
      this.leadReviewStore.editLead(leadId)
    },
  },
  props: {
    filter: Object
  },
  setup() {
    const editLeadObject = ref(null);
    const authStore = useAuthStore();
    const commonStore = useCommonStore();
    const leadReviewStore = useLeadReviewStore();
    const leadsStore = useLeadsStore();

    const isModalOpen = computed({
      get: () => leadReviewStore.isModalOpen,
      set: (value) => {
        leadReviewStore.isModalOpen = value
      },
    })

    const leadRows = computed(() => leadsStore.leads)

    const selectedLeads = computed({
      get: () => leadsStore.selectedLeads,
      set: (value) => leadsStore.selectedLeads = value
    })

    const assigneeOptions = ref(computed(() => commonStore.assigneeOptions));

    const leadsTable = ref()

    const loading = computed({
      get: () => leadsStore.isLoading,
      set: (value) => {
        console.log('is loading', value)
        leadsStore.isLoading = value
      }
    })

    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })

    watch(() => (leadsStore.total), (newValue, oldValue) => {
      pagination.value.rowsNumber = newValue
    }, {deep: true});

    function reFetch() {
      leadsTable.value.requestServerInteraction()
    }

    onMounted(() => {
      reFetch()
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
      leadRows,
      selectedLeads,
      columns,
      authStore,
      commonStore,
      leadReviewStore,
      leadsTable,
      loading,
      pagination,
      editLeadObject,
      isModalOpen,
      assigneeOptions,
      statusColors,
      leadsStore,
      getSelectedString() {
        return selectedLeads.value.length === 0 ? '' : `${selectedLeads.value.length} record${selectedLeads.value.length > 1 ? 's' : ''} selected of ${leadRows.value.length}`
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
