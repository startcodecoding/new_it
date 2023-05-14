import { defineStore } from 'pinia'
import { asyncRouterHandle } from '@/utils/asyncRouter'
import { ref } from 'vue'


const routerListArr = []
const keepAliveRoutersArr = []

const formatRouter = (routes, routeMap) => {
    routes && routes.forEach(item => {
        if ((!item.children || item.children.every(ch => ch.Hidden)) && item.name !== '404' && !item.Hidden && item.name !== 'home') {
            routerListArr.push({ label: item.meta.title, value: item.name })
        }
        item.meta.hidden = item.Hidden
        routeMap[item.name] = item
        if (item.children && item.children.length > 0) {
            formatRouter(item.children, routeMap)
        }
    })
}

const KeepAliveFilter = (routes) => {
    routes && routes.forEach(item => {
        // 子菜单中有 keep-alive 的，父菜单也必须 keep-alive，否则无效。这里将子菜单中有 keep-alive 的父菜单也加入。
        if ((item.children && item.children.some(ch => ch.meta.keepAlive) || item.meta.keepAlive)) {
            item.component().then(val => { keepAliveRoutersArr.push(val.default.name) })
        }
        if (item.children && item.children.length > 0) {
            KeepAliveFilter(item.children)
        }
    })
}



export const useRouterStore = defineStore("router", {
    state: () => {
        const routeMap = ({})
        const asyncRouters = ref([])
        const routerList = ref(routerListArr)
        const keepAliveRouters = ref(keepAliveRoutersArr)
        // 从后台获取动态路由
        const SetAsyncRouter = (val) => {
            const baseRouter = [{
                path: '/layout',
                name: 'layout',
                component: 'views/layout/index.vue',
                meta: {
                    title: '底层layout'
                },
                children: []
            }]
            const asyncRouterRes = val
            console.log("------SetAsyncRouter---------")

            console.log(val)
            console.log(asyncRouterRes)
            console.log("------SetAsyncRouter---11------")
            console.log(baseRouter)

            const asyncRouter = asyncRouterRes.data.menus
            formatRouter(asyncRouter, routeMap)
            console.log("------SetAsyncRouter---22------")
            console.log(baseRouter)

            baseRouter[0].children = asyncRouter

            console.log("------SetAsyncRouter---33------")
            console.log(baseRouter)

            asyncRouterHandle(asyncRouter)
            console.log("------SetAsyncRouter--44-------")
            console.log(baseRouter)

            KeepAliveFilter(asyncRouter)
            console.log("------SetAsyncRouter----55-----")

            //asyncRouters.value = baseRouter
            asyncRouters.value = asyncRouter
            routerList.value = routerListArr
            keepAliveRouters.value = keepAliveRoutersArr
            return true
        }

        return {
            asyncRouters,
            routerList,
            SetAsyncRouter,
        }
    },
}

)

