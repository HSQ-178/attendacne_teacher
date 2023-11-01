import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

import Index from "../views/index/index.vue";
import Home from "../views/home/index.vue";
import SignByManual from "../views/sign-by-manual/index.vue";
import SignByQrcode from "../views/sign-by-qrcode/index.vue";
import QrcodeView from "../views/qrcode-view/index.vue";
import Record from "../views/record/index.vue";
import RecordDetail from "../views/record-detail/index.vue";
import User from "../views/user/index.vue";
import Login from "../views/login/index.vue";
import Test from "../views/test/index.vue";
const routes = [
  {
    path: "/",
    name: "Index",
    component: Index,
    children: [
      {
        path: "/",
        name: "Home",
        component: Home,
      },
      {
        path: "/record",
        name: "Record",
        component: Record,
      },
      {
        path: "/user",
        name: "User",
        component: User,
      },
    ],
  },
  {
    path: "/sign-by-manual",
    name: "SignByManual",
    component: SignByManual,
  },
  {
    path: "/sign-by-qrcode",
    name: "SignByQrcode",
    component: SignByQrcode,
  },
  {
    path: "/qrcode-view",
    name: "QrcodeView",
    component: QrcodeView,
  },
  {
    path: "/record-detail/:date/:majorId/:grade/:class/:courseId",
    name: "RecordDetail",
    component: RecordDetail,
    props: true,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
  }
];

const router = createRouter({
  history: createWebHashHistory("/attendance_teacher/"),
  routes,
});

export default router;
