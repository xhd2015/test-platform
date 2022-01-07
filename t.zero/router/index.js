import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../view/Home.vue'
// import Home from '../view/main-frame/Home.vue'
import NotFound from "../view/NotFound.vue"
import nav from "../nav"
import { Time } from "../view"

const Home = {}

Vue.use(VueRouter);

const routes = [
  { path: "*", name: "NotFound", component: NotFound },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/index.html', // the initial page's route is set to /index.html
    name: 'Home',
    component: Home,
  },
  {
    path: '/time', // the initial page's route is set to /index.html
    name: 'Time',
    component: Time,
  },
  ...nav.map(e => ({
    path: e.path,
    name: e.text,
    component: e.component,
  }))
  //   {
  //     path: '/about',
  //     name: 'About',
  //     nav: true,
  //     // route level code-splitting
  //     // this generates a separate chunk (about.[hash].js) for this route
  //     // which is lazy-loaded when the route is visited.
  //     component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  //   },
  //   {
  //     path: '/buttons',
  //     name: 'Buttons',
  //     component: () => import('../views/Buttons.vue'), // the import is literally required, because the tree-shaking...
  //   },
  //   {
  //     path: '/grid',
  //     name: 'Grid',
  //     component: () => import('../views/Grid.vue'),
  //   },
  //   {
  //     path: '/jsx', name: 'JSX', component: () => import('../views/JSX.vue'),
  //   },
  //   {
  //     path: '/hover', name: 'Hover', component: () => import('../views/Hover.vue'),
  //   },
  //   {
  //     path: '/timeline', name: 'Timeline', component: () => import('../views/Timeline.vue'),
  //   },
  //   {
  //     path: '/marklist', name: 'MarkList', component: () => import('../views/MarkList.vue'),
  //     nav: true,
  //   },
  //   {
  //     path: '/chip', name: 'Chip', component: () => import('../views/Chip.vue'),
  //   },
  //   {
  //     path: '/menu', name: 'Menu', component: () => import('../views/Menu.vue'),
  //   },
  //   {
  //     path: '/dates', name: 'Dates', component: () => import('../views/Dates.vue'),
  //   },
  //   {
  //     path: '/ripple', name: 'Ripple', component: () => import('../views/Ripple.vue'),
  //   },
  //   {
  //     path: '/virtual_scroll', name: 'VirtualScroll', component: () => import('../views/VirtualScroll.vue'),
  //   },
  //   {
  //     path: '/inputs', name: 'Inputs', component: () => import('../views/Inputs.vue'),
  //   },
  //   {
  //     path: '/date_picker', name: 'DatePicker', component: () => import('../views/DatePicker.vue'),
  //   },
  //   {
  //     path: '/not_found', name: 'NotFound', component: NotFound,
  //   },
  //   {
  //     path: '/tags', name: 'Tags', component: () => import("../views/Tags.vue"),
  //     nav: true,
  //   },
  //   {
  //     // sub routes
  //     path: '/happening', name: 'Happening', component: () => import("../views/Happening.vue"), props: ({ query }) => ({ ...query }),
  //     nav: true,
  //   },
  //   {
  //     path: "/happening/new", name: "HappeningNew", component: () => import("../views/HappeningNew.vue"), props: ({ query }) => ({ ...query }),
  //     nav: true,
  //   },
  //   { path: "/happening/detail", name: "HappeningDetail", component: () => import("../views/HappeningDetail.vue"), props: route => ({ id: route.query.id }) },
  //   {
  //     path: '/tests', name: 'Tests', component: () => import("../views/Tests.vue"),
  //     nav: true,
  //   },
  //   {
  //     path: '/on_her', name: 'OnHer', component: () => import("../views/OnHer.vue"),
  //     nav: false,
  //   },
  //   {
  //     path: '/downloads', name: 'Downloads', component: () => import("../views/Downloads.vue"),
  //     nav: false,
  //   },
  //   {
  //     path: '/three/demo', name: 'ThreeDemo', component: () => import("../views/three/ThreeDemo.vue"),
  //     nav: true,
  //   },
  //   {
  //     path: '/three/ball_on_plane', name: 'BallOnPlane', component: () => import("../views/three/BallOnPlane"),
  //     nav: true,
  //   },
  //   {
  //     path: '/three/ball_on_plane_track_ball', name: 'BallOnPlaneTrackball', component: () => import("../views/three/BallOnPlaneTrackball.vue"),
  //     nav: true,
  //   },
  //   {
  //     path: '/three/ball_on_plane', name: 'BallOnPlaneWithDatGUI', component: () => import("../views/three/BallOnPlaneWithDatGUI.vue"),
  //     nav: true,
  //   },
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  // enable saved scroll position
  scrollBehavior(to, from, savedPosition) {
    // console.log("to from:", to,from)
    // console.log("scrollBehavor:", savedPosition)
    // the component may be refreshed, so we wait for a while
    // to scroll the desired location
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
          return
        }
        resolve({ x: 0, y: 0 })
      }, 500)
    })

    // // return desired position
    // if(savedPosition){
    //   return savedPosition
    // }
    // // can also return 
    // // if (to.hash) {
    // //   return {
    // //     selector: to.hash
    // //     // , offset: { x: 0, y: 10 }
    // //   }
    // // }
    // return { x: 0, y: 0 }
  }
})

export default router

export { routes }