import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import MovieView from "../views/MovieView.vue";
import BookingView from "../views/BookingView.vue";
import BookingMovieOptions from "@/components/booking/BookingMovieOptions.vue";
import BookingSeat from "@/components/booking/BookingSeat.vue";
import BookingSuccess from "@/views/BookingSuccess.vue";
import MyPage from "@/views/MyPage.vue";
import BookingHistory from "@/components/mypage/BookingHistory.vue";
import store from "@/store/index.js";
import PaymentView from "@/views/PaymentView";
import AdminView from "@/views/AdminView";
import CreateMovie from "@/components/admin/movie/CreateMovie.vue";
import CreateTheater from "@/components/admin/theater/CreateTheater.vue";
import CreateHall from "@/components/admin/hall/CreateHall.vue";
import CreateScreening from "@/components/admin/screening/CreateScreening.vue";

Vue.use(VueRouter);

const checkAuthenticate = (to, from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    store.commit("SHOW_LOGIN_MODAL");
    next(false);
  } else {
    next();
  }
};

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/movie",
    name: "movie",
    component: MovieView,
  },
  {
    path: "/booking",
    name: "booking",
    component: BookingView,
    redirect: "/booking/movieOptions",
    children: [
      {
        path: "/booking/movieOptions",
        name: "bookingMovieOptions",
        component: BookingMovieOptions,
      },
      {
        path: "/booking/seat",
        name: "bookingSeat",
        beforeEnter: checkAuthenticate,
        component: BookingSeat,
      },
    ],
  },
  {
    path: "/booking/payment",
    name: "paymentView",
    beforeEnter: checkAuthenticate,
    component: PaymentView,
  },
  {
    path: "/booking/success/:bookingId",
    name: "bookingSuccess",
    beforeEnter: checkAuthenticate,
    component: BookingSuccess,
  },
  {
    path: "/mypage",
    name: "myPage",
    component: MyPage,
    redirect: "/mypage/bookingHistory",
    children: [
      {
        path: "/mypage/bookingHistory",
        name: "bookingHistory",
        beforeEnter: checkAuthenticate,
        component: BookingHistory,
      },
    ],
  },
  {
    path: "/admin",
    name: "admin",
    beforeEnter: checkAuthenticate,
    component: AdminView,
  },
  {
    path: "/admin/movie/create",
    name: "createMovie",
    beforeEnter: checkAuthenticate,
    component: CreateMovie,
  },
  {
    path: "/admin/theater/create",
    name: "createTheater",
    beforeEnter: checkAuthenticate,
    component: CreateTheater,
  },
  {
    path: "/admin/hall/create",
    name: "createHall",
    beforeEnter: checkAuthenticate,
    component: CreateHall,
  },
  {
    path: "/admin/screening/create",
    name: "createScreening",
    beforeEnter: checkAuthenticate,
    component: CreateScreening,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
