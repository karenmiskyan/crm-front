import {defineStore} from 'pinia';
import {useRouter} from 'vue-router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || '',
    user: JSON.parse(localStorage.getItem('user')) || null,
    roles: JSON.parse(localStorage.getItem('roles')) || [],
  }),
  actions: {
    setToken(auth) {
      this.token = auth.token;
      this.user = auth.user;
      this.roles = auth.user.roles.map(role => role.name);
      localStorage.setItem('authToken', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
      localStorage.setItem('roles', JSON.stringify(this.roles));
    },
    clearToken() {
      this.token = '';
      this.user = '';
      this.roles = '';
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      this.router.push({name: 'login'})
    },
  },
});
