import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import dialog from '../components/dialog/index';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },{
      path:'/dialog',
      name:'dialog',
      component:dialog
    }
  ]
})
