<template>
  <div>
    <div class="q-pa-md flex row q-col-gutter-md">
      <div>
        <q-input filled v-model="dateFrom" @update:model-value="updateChart" label="Date From" mask="date">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateFrom" @update:model-value="updateChart">
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
        <q-input filled v-model="dateTo" @update:model-value="updateChart" label="Date To" mask="date">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateTo" @update:model-value="updateChart">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="flex">
        <q-select option-label="name" option-value="id" style="width: 220px" filled v-model="assignee" :options="assigneeOptions" @update:model-value="updateChart" label="Agent"/>
        <q-btn color="dark" icon="close" @click="assignee = null;updateChart()" class="cursor-pointer q-ml-xs" />
      </div>
      <div>
        <q-btn label="export" @click="bulkExportFiltered" color="dark" style="height: 100%" />
      </div>
    </div>
    <div>
      <apexchart ref="activityChart" type="bar" height="350" :options="options" :series="series"></apexchart>
    </div>
  </div>
</template>

<script>
import {computed, defineComponent, ref} from 'vue'
import {useAuthStore} from "stores/auth";
import {api} from "boot/axios";
import {useCommonStore} from "stores/common";
import {objectToQueryString} from "src/common/utils";

export default defineComponent({
  name: 'ApexBar',
  data() {
    return {
      options: {
        chart: {
          type: 'bar',
          height: 350
        },
        xaxis: {
          categories: []
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
      },
      series: [],
    }
  },
  methods: {
    updateChart() {
      console.log('sadasdasd')
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }
      api.get(`/api/lead_charts?startDate=${this.dateFrom || ''}&endDate=${this.dateTo || ''}&user_id=${this.assignee ? this.assignee?.id : ''}`, {headers}).then(response => {
        this.options['xaxis']['categories'] = response.data.labels

        if (!this.assignee) {
          this.series = response.data.groups.map((item) => {
            return {
              name: item.label,
              data: item.count
            }
          }) || []
        } else {
          this.series = [
            {
              name: 'Count',
              data: response.data.groups.map(item => item)
            }
          ]

          this.$refs.activityChart.chart.updateSeries(this.series)
        }

        this.$refs.activityChart.chart.render();
        this.$refs.activityChart.chart.updateOptions(this.options)
      });
    },
    async bulkExportFiltered() {
      const headers = {
        'Content-Type': 'text/csv',
        Authorization: `Bearer ${this.authStore.token}`
      }

      try {
        const response = await api.get(`/api/lead_charts?export=true&startDate=${this.dateFrom || ''}&endDate=${this.dateTo || ''}`, {
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
      } catch (error) {
        console.error('Failed to download CSV:', error);
      }
    },
  },
  created() {
    this.updateChart()
  },
  setup() {
    const authStore = useAuthStore();
    const dateFrom = ref('2020/01/01')
    const dateTo = ref('2025/01/01')
    const commonStore = useCommonStore();
    const assigneeOptions = ref(computed(() => commonStore.assigneeOptions))

    const assignee = ref();
    return {
      authStore,
      dateFrom,
      assigneeOptions,
      assignee,
      dateTo,
    }
  }
})
</script>
