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
        <q-select option-label="name" option-value="id" style="width: 220px" filled v-model="assignee" :options="assigneeOptions" @update:model-value="updateChart" label="Agent">
        </q-select>
        <q-btn color="dark" icon="close" @click="assignee = null;updateChart()" class="cursor-pointer q-ml-xs" />
      </div>
    </div>
    <div>
      <apexchart ref="activityPieChart" type="donut" width="380" :options="chartOptions" :series="seriesDonut"></apexchart>
      <apexchart ref="activityChart" type="bar" height="350" :options="options" :series="series"></apexchart>
    </div>
  </div>
</template>

<script>
import {computed, defineComponent, ref} from 'vue'
import {useAuthStore} from "stores/auth";
import {api} from "boot/axios";
import {useCommonStore} from "stores/common";

export default defineComponent({
  name: 'ApexBar',
  data() {
    return {
      options: {
        chart: {
          type: 'bar',
          height: 350,
        },
        colors: ['#1976D2', '#9C27B0', '#FF5722', '#4CAF50', '#FFC107', '#4CAF50', '#FF5252', '#2196F3', '#FF9800'],
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        xaxis: {
          categories: ['Test', 'Valod', 'valod', 'valod', 'valod', 'valod', 'Manager', 'Miro'],
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
      seriesDonut: [],
      chartOptions: {
        chart: {
          type: 'donut',
        },
        colors: ['#1976D2', '#9C27B0', '#FF5722', '#4CAF50', '#FFC107', '#4CAF50', '#FF5252', '#2196F3', '#FF9800'],
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
    }
  },
  methods: {
    updateChart() {
      const headers = {
        Authorization: `Bearer ${this.authStore.token}`
      }

      api.get(`/api/activity_charts?startDate=${this.dateFrom.split('/').join('-') || ''}&endDate=${this.dateTo.split('/').join('-') || ''}&user_id=${this.assignee ? this.assignee?.id : ''}`, {headers}).then(response => {

        this.options.xaxis.categories = response.data.lables
        this.series = [{
          name: 'Count',
          data: response.data.count
        }];

        const donutLabels = [];
        const donutValues = [];

        const labelResponse = response.data.lables;

        for (let [index, num] of response.data.count.entries()) {
          if (num > 0) {
            donutLabels.push(labelResponse[index])
            donutValues.push(num)
          }
        }

        this.chartOptions.labels = donutLabels
        this.seriesDonut = donutValues;

        this.$refs.activityChart?.chart?.render();
        this.$refs.activityPieChart?.chart?.render();
        this.$refs.activityChart?.chart?.updateOptions(this.options)
        this.$refs.activityPieChart?.chart?.updateOptions(this.chartOptions)
      });
    }
  },
  created() {
    this.updateChart()
  },
  setup() {
    const authStore = useAuthStore();
    const commonStore = useCommonStore();

    const assigneeOptions = ref(computed(() => commonStore.assigneeOptions))

    const assignee = ref(null);
    const dateFrom = ref('2020/01/01')
    const dateTo = ref('2025/01/01')

    return {
      authStore,
      assigneeOptions,
      assignee,
      dateFrom,
      dateTo,
    }
  }
})
</script>
