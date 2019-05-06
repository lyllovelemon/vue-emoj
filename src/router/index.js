import Vue from 'vue'
import Router from 'vue-router'
import dialog from '../views/dialog/index';
import next from '../views/tick/index';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'/',
      name:'dialog',
      component:dialog
    },
    {
      path:'/tick',
      component:next
    }
  ]
})
