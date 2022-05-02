import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
Vue.use(VueRouter)

const routes: RouteConfig[] = [
	{
		path: '/',
		name: 'MerchantGoods',
		component: () => import('../views/MerchantGoods.vue'),
	},
	{
		path: '/goods/:id',
		name: 'GoodsDetail',
		component: () => import('../views/GoodsDetail.vue'),
	}
]

const router = new VueRouter({
	base: process.env.BASE_URL,
	routes,
})

export default router
