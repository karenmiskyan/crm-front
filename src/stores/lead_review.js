import {defineStore} from 'pinia'
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";

export const useLeadReviewStore = defineStore('leadReview', {
  state: () => ({
    reviewingLead: null,
    isModalOpen: false,
  }),
  getters: {},
  actions: {
    updateReviewingLead(value) {
      this.reviewingLead = value
    },
    editLead(leadId) {
      const authStore = useAuthStore();

      const headers = {
        Authorization: `Bearer ${authStore.token}`
      }

      api.get(`api/leads/${leadId}`, {headers}).then((response) => {
        this.isModalOpen = true;
        this.editLeadObject = response.data

        this.updateReviewingLead(response.data);
      })
    },
  }
})
