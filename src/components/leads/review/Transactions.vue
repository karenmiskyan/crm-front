<template>
  <div class="text-h6 q-pb-md">Transactions</div>
  <div>
    <q-list v-if="transactions.length" bordered separator>
      <q-item v-bind:key="transaction.id" v-for="transaction of transactions">
        <q-item-section class="q-pa-lg">
          <div class="flex justify-between ">
            <span class="text-bold">Invoice</span>
            <span>{{ transaction.invoice }}</span>
          </div>
          <q-separator spaced></q-separator>
          <div class="flex justify-between">
            <span class="text-bold">Amount</span>
            <span>{{ transaction.amount }}</span>
          </div>
          <q-separator spaced></q-separator>

          <div class="flex justify-between">
            <span class="text-bold">Balance</span>
            <span>{{ transaction.balance }}</span>
          </div>
          <q-separator spaced></q-separator>

          <div class="flex justify-between">
            <span class="text-bold">Order Date</span>
            <span>{{ moment(transaction.orderDate).format('YYYY-MM-D  h:mm:ss a') }}</span>
          </div>
          <q-separator spaced></q-separator>

          <div class="flex justify-between">
            <span class="text-bold">Ship Date</span>
            <span>{{ moment(transaction.shipDate).format('YYYY-MM-D  h:mm:ss a') }}</span>
          </div>

        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script>
import {ref} from "vue";
import {api} from "boot/axios";
import moment from "moment";
import {useLeadReviewStore} from "stores/lead_review";

export default {
  computed: {
    moment() {
      return moment
    }
  },
  setup(props) {
    const leadReviewStore = useLeadReviewStore()
    const transactions = ref([]);
    if (leadReviewStore.reviewingLead.eclipse_customer_id) {
      api.get(`https://api.koaedi.com/api/account-histories-api/${props.lead.eclipse_customer_id}`).then((response) => {
        transactions.value = response.data
      })
    }

    return {
      transactions
    };
  }
}
</script>
