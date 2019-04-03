import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import emotion from '../components/emotion/index';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },{
      path:'/emotion',
      name:'emotion',
      component:emotion
    }
  ]
})
