<template>
  <div class="page-header flex justify-between items-center">
    <h5 class="q-mt-md q-mb-md">Create Lead</h5>
  </div>
  <div class="q-pa-md">
    <q-form
      ref="leadForm"
      class="q-gutter-md"
    >
      <div class="q-pb-sm relative-position">
        <q-input
          filled
          full-width
          v-model="company"
          :disable="showForm"
          :loading="suggestionLoading"
          @update:model-value="getSuggestions"
          label="Company*"
          lazy-rules="ondemand" :rules="[ val => val && val.length > 0 || 'Please type something']"
        >
        </q-input>
        <div class="company-suggestion q-pb-lg full-width">
          <q-list bordered separator>
            <q-item v-bind:key="item" v-for="item of suggestedCompanies" class="list-item">
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="q-pb-lg justify-end">
          <q-btn :label="showForm ? 'Update company name' : 'Continue to create company'" :loading="loading"
                 :disable="disableContinueButton" @click="continueToCreate" size="md" no-caps type="button"
                 color="dark"/>
        </div>
      </div>
      <div class="q-my-none q-my-none" v-if="showForm">
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
        <div class="q-pb-lg" v-if="roles.includes('admin') || roles.includes('manager')">
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
            v-model="state"
            label="State"
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
      </div>
    </q-form>

  </div>
</template>

<script>
import {computed, ref} from "vue";
import {useCommonStore} from "stores/common";
import validation from "src/common/validation";
import {api} from "boot/axios";
import {useAuthStore} from "stores/auth";
import {useQuasar} from "quasar";
import {checkPermission} from "src/common/utils";

export default {
  computed: {
    validation() {
      return validation
    }
  },
  methods: {
    checkPermission,
    async onSubmit() {
      if (!await this.$refs.leadForm.validate()) return;
      const lead = {
        company: this.company,
        name: this.name,
        email: this.email,
        phone: this.phone,
        status: this.status || 'New',
        tags: this.tags,
        assignee_id: this.assignee?.id || '',
        contact_date: this.lastContact,
        source: this.source,
        zipCode: this.zipCode,
        country: this.country,
        state: this.state,
        city: this.city,
        address: this.address,
        eclipseId: this.eclipseId,
      }

      const token = this.authStore.token

      const headers = {
        Authorization: `Bearer ${token}`
      }
      await api.post('api/leads', lead, {headers}).then(() => {
        this.$router.push({name: 'leads'})
      }).catch((error) => {
        console.log(error)
        const data = error.response.data;

        this.$q.notify({
          message: data.errors.company.length ? data.errors.company[0] : 'Something went wrong, please contact with support',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'negative'
        })
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
      }, 500)
    },
    continueToCreate() {
      this.loading = true;

      if (this.showForm) {
        this.showForm = false
        this.loading = false
        return
      }

      this.suggestedCompanies = []

      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }

      api.post(`api/leads/validate-company?company=${this.company}`, {}, {headers}).then(() => {
        this.showForm = true;
        this.loading = false;
      }).catch((error) => {
        const data = error.response.data;

        this.$q.notify({
          message: data.errors.company.length ? data.errors.company[0] : 'Something went wrong, please contact with support',
          position: 'bottom-right',
          actions: [{icon: 'close', color: 'white'}],
          color: 'negative'
        })

        this.loading = false;
      })

    }
  },
  data() {
    return {
      loading: false,
      suggestionLoading: false,
      company: '',
      name: '',
      email: '',
      phone: '',
      status: '',
      tags: [],
      assignee: '',
      lastContact: '',
      source: '',
      zipCode: '',
      country: '',
      state: '',
      city: '',
      address: '',
      eclipseId: ''
    }
  },
  setup() {
    const showForm = ref(false)
    const disableContinueButton = ref(true);
    const store = useCommonStore()
    const authStore = useAuthStore()
    const suggestedCompanies = ref();
    const requestDelay = ref();
    const $q = useQuasar()
    store.updateState();

    const statusOptions = computed(() => store.statusOptions);
    const tagOptions = computed(() => store.tagOptions);
    const assigneeOptions = computed(() => store.assigneeOptions);
    const sourceOptions = computed(() => store.sourceOptions);

    const roles = authStore.user?.roles.map(item => item.name)

    return {
      disableContinueButton,
      showForm,
      statusOptions,
      tagOptions,
      assigneeOptions,
      sourceOptions,
      authStore,
      suggestedCompanies,
      requestDelay,
      $q,
      roles
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

//.list-item {
//  background-color: $dark;
//}
</style>
