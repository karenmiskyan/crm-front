import {route} from 'quasar/wrappers'
import {createRouter, createWebHistory} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = createWebHistory;

  const Router = createRouter({
    scrollBehavior: () => ({left: 0, top: 0}),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const isAuthenticated = localStorage.getItem('authToken');
    const roles = JSON.parse(localStorage.getItem('roles'));
    if (!isAuthenticated && to.name !== 'login') {
      if (to.name === 'register') {
        next(true);
      } else {
        await Router.push({name: 'login'})
        next(false);
      }
    } else if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      await Router.push({path: from.path});
      next(false);
    } else {
      let checkPermission;

      if (to.meta.guard) {
        checkPermission = to.meta.guard.find(guard => roles.includes(guard));
      } else {
        checkPermission = true
      }

      if (checkPermission) {
        next(true)
      } else {
        next(false)
      }
    }
  })

  return Router
})
