import {defineStore} from 'pinia'
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {ref} from "vue";

export const useCommonStore = defineStore('common', {
  state: () => ({
    statusOptions: [],
    branchOptions: [],
    assigneeOptions: [],
    createdByOptions: [],
    sourceOptions: [],
    tagOptions: ['Follow Up', 'Tomorrow'],
  }),
  getters: {},
  actions: {
    updateStatusOptions(value) {
      this.statusOptions = value
    },
    updateAssigneeOptions(value) {
      this.assigneeOptions = value.map(item => {
        return {id: item.id, name: item.name}
      })
    },
    updateCreatedBy(value) {
      value.unshift({id: '', name: 'Created By'});
      this.createdByOptions = value
    },
    updateSourceOptions(value) {
      this.sourceOptions = value
    },
    updateTagOptions(value) {
      this.tagOptions = value
    },
    updateLeads(value) {
      this.leads = value
    },
    updateBranchOptions(value) {
      this.branchOptions = value
    },
    async updateState() {
      const authStore = useAuthStore()
      const headers = {
        Authorization: `Bearer ${authStore.token}`
      }
      const leadResponse = await api.get('api/leads', {headers});
      const tagsResponse = await api.get('api/tags', {headers});

      this.updateSourceOptions(leadResponse.data.leadSources)
      this.updateStatusOptions(leadResponse.data.statusOptions)
      this.updateAssigneeOptions(leadResponse.data.users)
      this.updateTagOptions(tagsResponse.data)
      this.updateBranchOptions(leadResponse.data.branches)
    },
    updateLead(leadId, value) {
      const index = this.leads.findIndex(lead => lead.id === leadId)

      this.leads[index] = {...this.leads[index], ...value}
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
  }
})
