<template>
  <q-page>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md my_card" bordered>
          <q-card-section class="flex items-center justify-between text-center q-py-none">
            <q-icon color="dark" size="5rem">
              <svg width="148" height="50" viewBox="0 0 148 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M88.8549 5.24462C91.6765 4.89129 93.8571 5.40331 95.1376 7.16875C96.806 9.46883 96.1811 11.1924 95.2432 13.6084C93.6894 17.6105 92.1444 21.7392 90.6851 25.8015C89.9516 27.8438 86.7653 36.5146 86.0746 37.9406C84.4352 41.3252 81.0493 44.2097 76.2857 44.7521C73.1796 45.1059 71.2071 44.5451 69.9124 42.7508C68.2801 40.4884 68.907 38.774 69.8358 36.4031C72.1379 30.526 74.4731 24.0512 76.6927 18.0684C78.8061 12.3719 80.3042 6.31539 88.8551 5.24462H88.8549ZM109.071 14.7475C110.466 8.08334 105.415 1.10042 98.0779 0.140573C96.2382 -0.100054 93.6054 0.0411867 91.6516 0.0411867C85.4348 0.0411867 81.2284 -0.0953215 75.3087 3.00976C72.4164 4.52673 69.633 6.6446 67.9273 8.53694C62.353 14.7211 57.7751 26.7032 56.0093 35.2514C54.638 41.8898 59.6224 48.8168 66.9123 49.8427C68.2394 50.0295 78.2011 50.0152 79.7534 49.8838C88.2545 49.1649 95.5123 44.5217 100.003 37.7985C103.688 32.2796 107.628 21.6358 109.071 14.7475Z"
                      fill="#323949"/>
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M107.251 49.9799C108.337 49.9775 108.463 49.5873 109.267 48.3453C116.549 37.4964 123.831 26.6475 131.113 15.7985C131.281 17.84 132.325 29.4124 132.197 30.4755C130.805 31.0437 128.75 30.8862 125.332 32.5734C123.237 33.6078 121.548 34.9481 120.156 36.2227C118.815 37.4508 117.446 39.4792 116.265 41.2825C115.541 42.3888 113.164 45.7212 112.745 46.5737C114.142 46.1653 116.147 45.2053 117.552 44.6129C121.026 43.1477 129.479 39.5489 132.951 40.055C133.399 41.4331 133.487 46.1758 133.653 48.1627C133.825 50.2128 133.56 49.9825 134.613 49.9809C139.031 49.9803 143.447 49.9796 147.865 49.979C146.585 33.3408 145.305 16.7026 144.025 0.0644583C141.655 0.0575072 139.285 0.050556 136.915 0.043457C132.404 0.0444923 132.359 1.65804 130.035 4.93024L99.9023 49.9796L107.251 49.9797L107.251 49.9799Z"
                      fill="#323949"/>
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M33.7257 0.0439007L18.7713 0.0718531L0.415039 49.98L15.2804 49.9806L21.6816 32.8019C22.0706 31.758 22.0523 31.1048 23.0086 30.3651L59.0266 2.71003L62.4174 0.043457H52.267C51.5652 0.043457 50.9623 0.247406 50.4046 0.673199L26.92 18.6077L33.7257 0.0437528V0.0439007Z"
                      fill="#323949"/>
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M27.3018 30.0637C27.4192 30.6374 34.5422 44.2628 35.0487 45.2671C36.7778 48.6951 37.1718 49.9414 41.9143 49.9405C45.6231 49.9399 49.6225 50.0837 53.2954 49.9226L45.9623 35.6317C44.235 32.2176 42.1023 28.3218 40.4892 24.9988C40.1794 24.3605 39.8922 23.8455 39.5695 23.2303L38.6546 21.5594C38.6454 21.5142 38.6129 21.5085 38.5899 21.4851L27.3018 30.0635V30.0637Z"
                      fill="#323949"/>
              </svg>
            </q-icon>
            <span class="text-grey-9 text-h5 text-weight-bold">Sign In</span>
          </q-card-section>
          <q-form ref="loginForm">
            <q-card-section>
              <q-input dense outlined v-on:keyup.enter="login" class="q-mt-md" :rules="validation.email" v-model="email"
                       label="Email Address*" lazy-rules="ondemand"></q-input>
              <q-input dense outlined v-on:keyup.enter="login" class="q-mt-md" :rules="validation.password"
                       v-model="password" type="password"
                       label="Password*" lazy-rules="ondemand"></q-input>
            </q-card-section>
            <q-card-section>
              <q-btn unelevated :loading="isLoad" color="dark" label="Sign In" size="md" no-caps class="full-width"
                     @click="login"/>
            </q-card-section>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-page>
</template>

<script>
import {ref} from "vue";
import {api} from 'boot/axios'

import {useAuthStore} from 'stores/auth';
import validation from "src/common/validation";
import {useQuasar} from 'quasar'

export default {
  methods: {
    async login() {
      this.isLoad = true
      this.$refs.loginForm.validate().then((success) => {
        if (success) {
          api.post('/api/login', {
            email: this.email,
            password: this.password
          }).then(response => {
            this.isLoad = false
            this.authStore.setToken(response.data);
            this.$router.push({name: 'leads'})
          }).catch(error => {
            const options = {
              message: 'Wrong credentials. Please try again',
              color: 'negative',
              icon: 'error',
            }
            this.showNotification(options);
            this.isLoad = false
          });
        } else {
          this.isLoad = false
        }
      })
    }
  },
  setup() {
    const authStore = useAuthStore();
    const quasar = useQuasar()

    function showNotification(opts) {
      quasar.notify({
        ...opts,
        position: 'bottom-right',
        timeout: 4000,
        actions: [{icon: 'close', color: 'white'}],
      })
    }

    return {
      email: ref(''),
      password: ref(''),
      validation,
      isLoad: ref(false),
      showNotification,
      authStore,
    }
  }
}

</script>

<style>
.my_card {
  width: 25rem;
  border-radius: 8px;
}
</style>
