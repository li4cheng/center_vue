import router from './router'
import store from './store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth';

// 顶部进度条插件
NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/authredirect'];
router.beforeEach((to, from, next) => {
  NProgress.start();
  if (getToken()) {
    if (to.path === '/login') {
      next();
      NProgress.done()
    } else {
      if (!store.getters.userInfo) {
        // 获取用户信息
        store.dispatch('getUserInfo').then(() => {
          store.dispatch('GenerateRoutes').then(() => { // 生成可访问的路由表
            router.addRoutes(store.getters.addRouters); // 动态添加可访问路由表
            router.addRoutes([{ path: '*', redirect: "/404" }]); // 404
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          }).catch(() => {
            next('/login')
            NProgress.done();
          });
        }).catch((err) => {
          console.dir(err);
          // 遇到错误重定向到登录页面
          next('/login')
          NProgress.done();
        });
        // store.dispatch('getCenterInfo');
        store.dispatch('getSystemInfo');
      } else {
        next();
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login'); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done() // finish progress bar
});