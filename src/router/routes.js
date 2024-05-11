const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'leads',
        path: 'leads',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          guard: ['agent', 'manager', 'admin']
        }
      },
      {
        name: 'leads-create',
        path: 'leads/create',
        component: () => import('pages/leads/Create.vue'),
        meta: {
          guard: ['agent', 'manager', 'admin']
        }
      },
      {
        name: 'reports',
        path: 'reports',
        component: () => import('pages/Reports.vue'),
        meta: {
          guard: ['admin']
        }
      },
      { path: '/', redirect: { name: 'leads' }}
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('pages/Login.vue')},
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/Register.vue')},
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  },
]

export default routes
