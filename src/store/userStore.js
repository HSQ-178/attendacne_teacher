import { defineStore } from "pinia";

export const useUserStore = defineStore("teacher", {
  persist: true,

  state: () => ({
    user: {
      id: "", //用户id
      username: "", //用户名
      teacherName: "", //教师姓名
      token: "", //token
    },
  }),

  actions: {
    setUser(user) {
      this.user = user;
    },

    update(user) {
      //根据user对象的key更新user对应的值
      for (let key in user) {
        this.user[key] = user[key];
      }
    },

    //清空user
    clear() {
      this.user = {
        id: "",
        username: "",
        password: "",
        name: "",
      };
    },
  },
});
