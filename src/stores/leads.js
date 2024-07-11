import {defineStore} from 'pinia'
import {useCommonStore} from "stores/common";
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {objectToQueryString} from "src/common/utils";

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    openFilterSidebar: false,
    openInactiveFilterSidebar: false,
    filter: {
      filter_contact_date: '',
      filter_created_by: '',
      filter_inactive: '',
      filter_created_at_from: '',
      filter_created_at_to: '',
      filter_general: '',
      filter_branch: '',
      filter_source: [],
      filter_status: [],
    },
    count: 0,
    leads: [],
    selectedLeads: [],
    total: 0,
    isLoading: false
  }),
  getters: {},
  actions: {
    request(page, count, sortBy, descending) {
      console.log(sortBy);
      console.log(descending);
      const authStore = useAuthStore()
      const commonStore = useCommonStore()
      const queryString = objectToQueryString(this.filter);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
      api.get(`/api/leads?page=${page}&per_page=${count}&${queryString}&sort_by=${sortBy}&sort_order=${descending ? 'asc' : 'desc'}`, {headers}).then((response) => {
        const data = response.data;
        commonStore.updateStatusOptions(data.statusOptions);
        commonStore.updateAssigneeOptions(data.users);
        commonStore.updateCreatedBy(data.users);
        commonStore.updateSourceOptions(data.leadSources);
        commonStore.updateBranchOptions(data.branches);
        this.leads = data.leads.data
        this.total = data.leads.total
        this.isLoading = false;
        this.selectedLeads = [];
      })
    },
    updateLeadsBulk(data) {
      this.leads.forEach(item => {
        if (data.ids.includes(item.id)) {
          item.source = data.source
          item.status = data.status
          item.assigned_id = data.assignee
          item.tags = data.tags
          item.last_contact = data.last_contact
        }
      })
    },
    updateLead(leadId, value) {
      const index = this.leads.findIndex(lead => lead.id === leadId)

      this.leads[index] = {...this.leads[index], ...value}
    },
  }
})
