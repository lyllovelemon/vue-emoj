import Vue from 'vue'
import Router from 'vue-router'
import dialog from '../components/dialog/index';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'/',
      name:'dialog',
      component:dialog
    }
  ]
})
