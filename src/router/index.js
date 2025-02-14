import { createRouter, createWebHistory } from 'vue-router';
import MainPageView from '@/views/MainPageView.vue';
import AboutView from '@/views/AboutView.vue';
import ShopView from '@/views/ShopView.vue';

const routes = [
  { path: "/", component: MainPageView, name: "MainPageView" },
  { path: "/about", component: AboutView, name: "AboutView" },
  { path: "/shop", component: ShopView, name: "ShopView"}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;