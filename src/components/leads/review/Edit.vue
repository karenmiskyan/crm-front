<template>
  <div class="text-h6 q-pb-md">Edit</div>
  <div class="q-my-none q-my-none">
    <q-form ref="leadForm">
      <div class="q-pb-sm q-my-none">
        <q-input
          filled
          full-width
          v-model="company"
          id="companyField"
          :loading="suggestionLoading"
          @update:model-value="getSuggestions"
          label="Company*"
          lazy-rules="ondemand" :rules="[ val => val && val.length > 0 || 'Please type something']"
        />
        <div class="company-suggestion q-pb-lg full-width" v-if="suggestedCompanies.length">
          <q-list bordered separator>
            <q-item v-bind:key="item" v-for="item of suggestedCompanies" class="list-item">
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="q-pb-sm q-my-none">
        <q-input
          filled
          class="q-my-none"
          type="text"
          v-model="name"
          lazy-rules="ondemand"
          :rules="validation.name"
          label="Full Name"
        />
      </div>
      <div class="q-pb-sm">
        <q-input
          filled
          type="text"
          v-model="email"
          label="Email"
          lazy-rules="ondemand" :rules="validation.email"
        />
      </div>
      <div class="q-pb-lg">
        <q-input
          filled
          type="text"
          v-model="phone"
          label="Phone number"
        />
      </div>
      <div class="q-pb-sm" v-if="checkPermission(authStore.roles, 'admin')">
        <q-select filled v-model="status" :options="statusOptions" label="Status*"
                  lazy-rules="ondemand" :rules="[val => !!val || 'Please select status',
        ]"/>
      </div>
      <div class="q-pb-lg">
        <q-select
          v-model="tags"
          filled
          auto-grow
          use-chips
          multiple
          :options="tagOptions"
          label="Tags"
        />
      </div>
      <div class="q-pb-lg">
        <q-select filled v-model="assignee"
                  :options="assigneeOptions" option-value="id" option-label="name" label="Assign To"/>
      </div>
      <div class="q-pb-lg">
        <q-input filled v-model="lastContact" mask="date" label="Last contact date">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="lastContact">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="q-pb-sm">
        <q-select filled v-model="source"
                  :options="sourceOptions"
                  label="Source*" lazy-rules="ondemand" :rules="[val => !!val || 'Please select source',
        ]"/>
      </div>
      <div class="q-pb-lg">
        <q-input
          filled
          type="text"
          v-model="zipCode"
          label="Zip Code"
        />
      </div>
      <div class="q-pb-lg">
        <q-input
          filled
          type="text"
          v-model="country"
          label="Country"
        />
      </div>
      <div class="q-pb-lg">
        <q-input
          filled
          type="text"
          v-model="city"
          label="City"
        />
      </div>
      <div class="q-pb-lg">
        <q-input
          filled
          type="text"
          v-model="address"
          label="Address"
        />
      </div>
      <div class="q-pb-lg">
        <q-btn label="Save Lead" @click="onSubmit" class="q-ml-auto" no-caps type="button" color="dark"/>
      </div>
    </q-form>
  </div>
</template>
<script>
import validation from "src/common/validation";
import {useCommonStore} from "stores/common";
import {useAuthStore} from "stores/auth";
import {computed, ref, watchEffect} from "vue";
import {useQuasar} from "quasar";
import {api} from "boot/axios";
import {checkPermission} from "src/common/utils";

export default {
  props: {
    lead: Object
  },
  computed: {
    validation() {
      return validation
    }
  },
  data() {
    return {}
  },
  methods: {
    checkPermission,
    onSubmit() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }

      const data = {
        company: this.company,
        name: this.name,
        email: this.email,
        phone: this.phone,
        status: this.status,
        tags: this.tags,
        assigned_id: this.assignee?.id || '',
        contact_date: this.lastContact,
        source: this.source,
        zipCode: this.zipCode,
        country: this.country,
        state: this.state,
        city: this.city,
        address: this.address,
      }

      api.patch(`/api/leads/${this.lead.id}`, data, {headers}).then((response) => {
        this.$q.notify({
          message: 'Lead updated successfully',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'dark'
        })

        this.store.updateReviewingLead(data)

        this.store.updateLead(this.lead.id, data)
      }).catch(() => {

      })
    },
    async getSuggestions(text) {
      this.suggestionLoading = true;
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      clearTimeout(this.requestDelay);
      this.requestDelay = setTimeout(async () => {
        const response = await api.get(`api/autocomplete-company?company_name=${text}`, {headers})
        this.suggestedCompanies = response.data
        if (text.length) {
          this.disableContinueButton = false;
        }
        this.suggestionLoading = false

        if (text.length === 0) {
          this.suggestedCompanies = []
        }
      }, 500)
    },
  },
  setup(props) {
    const store = useCommonStore()
    const authStore = useAuthStore()
    const $q = useQuasar();

    const statusOptions = computed(() => store.statusOptions);
    const tagOptions = computed(() => store.tagOptions);
    const assigneeOptions = computed(() => store.assigneeOptions);
    const sourceOptions = computed(() => store.sourceOptions);

    const company = ref(props.lead.company)
    const name = ref(props.lead.name)
    const email = ref(props.lead.email)
    const phone = ref(props.lead.phone)
    const status = ref(props.lead.status)
    const tags = ref(props.lead.tags)
    const assignee = ref(assigneeOptions.value.find((item) => item.id === props.lead.assigned_id))
    const lastContact = ref(props.lead.contact_date)
    const source = ref(props.lead.source)
    const zipCode = ref(props.lead.zip_code)
    const country = ref(props.lead.country)
    const state = ref(props.lead.state)
    const city = ref(props.lead.city)
    const address = ref(props.lead.address)
    const eclipseId = ref(props.lead.eclipseId)
    const reviewingLead = ref(computed(() => store.reviewingLead))

    watchEffect(() => {
      console.log(document.querySelector('#companyField'));
    })

    return {
      store,
      authStore,
      $q,
      statusOptions,
      tagOptions,
      assigneeOptions,
      sourceOptions,

      suggestedCompanies: ref([]),
      suggestionLoading: ref(false),
      suggestedCompaniesShow: false,

      // Form
      company,
      name,
      email,
      phone,
      status,
      tags,
      assignee,
      lastContact,
      source,
      zipCode,
      country,
      state,
      city,
      address,
      eclipseId,
      reviewingLead,
      test: false,
    }
  }
}
</script>

<style lang="scss">
.company-suggestion {
  top: 55px;
  left: 0;
  z-index: 1;
}
</style>
