// 1 引入所需方法
// 路由创建：createRouter
// 路由模式(两者任选其一)：createWebHistory - history模式、createWebHashHistory - hash模式
// RouteRecordRaw：意为路由原始信息 （使用vue3+js的不用引入）
import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router';

// 设置路由规则
const routes = [
    {
        path: '/',
        component: () => import('../pages/home.vue')
    }, {
        // 定义404路由
        path: '/404',
        component: () => import('../pages/notfound.vue')
    }, {
        // 匹配为定义路由然后重定向到404页面
        path: '/:pathMath(.*)',
        redirect: '/404'
    }
];

// 设置路由
const router = createRouter({
    routes,
    //路由模式：history
    history: createWebHistory()
    //路由模式：hash
    // history:createWebHashHistory()
});

// 导出路由
export default router;