<template lang="ko">
  <div :class="['container', homeClass]">
		<div class="top-nav">
      <button v-if="isAuthenticated" @click="logout">로그아웃</button>
      <button v-else @click="SHOW_LOGIN_MODAL">로그인</button>
      <LoginModal @checkAuthStatus="checkAuthStatus" />
			<button v-if="!isAuthenticated" @click="SHOW_JOIN_MODAL">회원가입</button>
      <JoinModal />
      <button v-if="isAdmin" @click="redirectAdminPage">관리자 대시보드</button>
		</div>
		<div class="main-nav">
      <div class="left-side">
        <router-link :to="{name: 'movie'}">영화</router-link>
        <router-link :to="{name: 'booking'}">예매</router-link>
      </div>
			<router-link :to="{name: 'home'}">
        <img v-if="this.$route.path=='/'" src="@/assets/img/logo-sample2.png" class="logo-img">
        <img v-else src="@/assets/img/logo-sample.png" class="logo-img">
			</router-link>
      <router-link :to="{name: 'myPage'}" class="user-link">
        <i class="fa-solid fa-user"></i>
			</router-link>
		</div>
	</div>
</template>

<script>
import { mapMutations } from "vuex";
import { logout } from "@/api/user";
import LoginModal from "@/views/LoginModal.vue";
import JoinModal from "@/views/JoinModal.vue";

export default {
  data() {
    return {
      showLoginModal: false,
      isAuthenticated: false,
      isAdmin: false,
    };
  },
  components: { LoginModal, JoinModal },
  computed: {
    homeClass() {
      return this.$route.path == "/" ? "home" : "default";
    },
  },
  mounted() {
    this.checkAuthStatus();
    window.addEventListener("storage", this.checkAuthStatus);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.checkAuthStatus);
  },
  methods: {
    ...mapMutations(["SHOW_LOGIN_MODAL", "SHOW_JOIN_MODAL"]),
    checkAuthStatus() {
      const authStatus = localStorage.getItem("isAuthenticated");
      const admin = localStorage.getItem("admin");

      this.isAuthenticated = authStatus === "true";
      this.isAdmin = admin === "true";
    },
    async logout() {
      const response = await logout();
      if (response.code == 200 || response.code == 401) {
        localStorage.removeItem("isAuthenticated");
        if (this.isAdmin) {
          localStorage.removeItem("admin");
        }
        this.checkAuthStatus();
      }
    },
    redirectAdminPage() {
      this.$router.push({ name: "admin" });
    },
  },
};
</script>

<style scoped>
.container {
  margin-bottom: 10px;
}
.home a,
.home button {
  color: white;
}
/* top nav  */
.top-nav {
  font-family: IBM Plex Sans KR;
  font-size: 13px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  padding-top: 15px;
}
.top-nav button {
  margin-left: 20px;
  border: none;
  cursor: pointer;
  background: none;
}

/* main nav */
.main-nav {
  font-family: SUIT-SemiBold;
  font-size: 19px;
  display: flex;
  position: relative;
}
.main-nav .left-side a {
  margin-right: 20px;
  line-height: 2;
}
.logo-img {
  width: 180px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.user-link {
  margin-left: auto;
  margin-top: 10px;
  margin-right: 5px;
}
.user-img {
  width: 20px;
  padding-top: 0.7rem;
}
</style>
