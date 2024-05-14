<template>
  <q-dialog
    :model-value="isModalOpen"
    @hide="closed"
    full-height
  >
    <q-card class="full-height" style="width: 950px; max-width: 90vw;">
      <q-card-section>
        <div class="flex justify-between text-h6">
          <span>Update Selected</span>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="q-pb-sm" v-if="checkPermission(authStore.roles, 'admin')">
          <q-select filled v-model="updateForm.status" :options="statusOptions" label="Status*"
                    lazy-rules="ondemand" :rules="[val => !!val || 'Please select status',]">
            <template v-slot:after>
              <q-btn flat round color="dark" icon="close" @click="updateForm.status = ''"/>
            </template>
          </q-select>
        </div>
        <div class="q-pb-lg">
          <q-select
            v-model="updateForm.tags"
            filled
            auto-grow
            use-chips
            multiple
            :options="tagOptions"
            label="Tags"
          >
            <template v-slot:after>
              <q-btn flat round color="dark" icon="close" @click="updateForm.tags = []"/>
            </template>
          </q-select>
        </div>
        <div class="q-pb-lg">
          <q-select filled v-model="updateForm.assignee"
                    :options="assigneeOptions" option-value="id" option-label="name" label="Assign To">
            <template v-slot:after>
              <q-btn flat round color="dark" icon="close" @click="updateForm.assignee = ''"/>
            </template>
          </q-select>
        </div>
        <div class="q-pb-lg">
          <q-input filled v-model="updateForm.lastContactDate" mask="date" label="Last contact date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="updateForm.lastContactDate">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:after>
              <q-btn flat round color="dark" icon="close" @click="updateForm.lastContactDate = ''"/>
            </template>
          </q-input>
        </div>
        <div class="q-pb-sm">
          <q-select filled v-model="updateForm.source"
                    :options="sourceOptions"
                    label="Source*" lazy-rules="ondemand" :rules="[val => !!val || 'Please select source',
            ]">
            <template v-slot:after>
              <q-btn flat round color="dark" icon="close" @click="updateForm.source = ''"/>
            </template>
          </q-select>
        </div>

        <div class="q-pb-lg">
          <q-btn label="Update selected leads" :disable="!saveBtnEnabled" @click="bulkUpdate" class="q-ml-auto" no-caps
                 type="button"
                 color="dark"/>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-dark">
        <q-btn flat label="OK" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>
<script setup>
import {api} from "boot/axios";
import {computed, ref, toRef, watch} from "vue";
import {useCommonStore} from "stores/common";
import {useAuthStore} from "stores/auth";
import {useQuasar} from "quasar";
import {checkPermission} from "src/common/utils";
import {useLeadsStore} from "stores/leads";

const emits = defineEmits(['closed', 'updated'])
const props = defineProps(['selectedLeads', 'isOpen'])
const $q = useQuasar()
const isOpen = toRef(props, 'isOpen')
const selectedLeads = toRef(props, 'selectedLeads')

const commonStore = useCommonStore();
const authStore = useAuthStore();
const leadsStore = useLeadsStore();

const statusOptions = computed(() => commonStore.statusOptions);
const assigneeOptions = computed(() => commonStore.assigneeOptions);
const sourceOptions = computed(() => commonStore.sourceOptions);

const saveBtnEnabled = ref(false);

const updateForm = ref({
  source: '',
  status: '',
  assignee: '',
  tags: [],
  lastContactDate: ''
});

const isModalOpen = ref(false);

const tagOptions = computed(() => commonStore.tagOptions);

watch(isOpen, () => {
  isModalOpen.value = isOpen.value
})

watch(updateForm, (value) => {
  saveBtnEnabled.value = false
  for (let key in value) {
    if (value[key] && value[key].length || Object.keys(value[key]).length) {
      saveBtnEnabled.value = true
      break
    }
  }
}, {deep: true})

api.get('api/tags', {
  headers: {
    Authorization: `Bearer ${authStore.token}`
  }
}).then((response) => {
  commonStore.updateTagOptions(response.data)
});

function closed() {
  updateForm.value = {
    source: '',
    status: '',
    assignee: '',
    tags: [],
    lastContactDate: ''
  }
  emits('modalClosed')
}

function bulkUpdate() {
  const headers = {
    Authorization: `Bearer ${authStore.token}`
  }

  const data = removeEmpty({
    ids: selectedLeads.value.map(item => item.id),
    status: updateForm.value.status || undefined,
    source: updateForm.value.source || undefined,
    contact_date: updateForm.value.lastContactDate || undefined,
    assigned_id: updateForm.value.assignee?.id || undefined,
    tags: updateForm.value.tags.length ? updateForm.value.tags : undefined
  })

  api.post('/api/bulk-update', data, {headers}).then(response => {
    leadsStore.updateLeadsBulk(data)
    $q.notify({
      message: 'Updated',
      position: 'bottom-right',
      actions: [{icon: 'close', color: 'white'}],
      color: 'dark'
    })
    emits('updated')
    isModalOpen.value = false
  })
}

function removeEmpty(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      removeEmpty(obj[key]);
    } else if (obj[key] === undefined || obj[key].length === 0) {
      delete obj[key];
    }
  });
  return obj;
}
</script>
