import { defineStore } from "pinia";

export const useQrcodeStore = defineStore("qrcode", {
  persist: true,

  state: () => ({
    qrcode: {
      id: "", //二维码id
      expiresAt: 0, //二维码过期时间
      duration: 0, //二维码有效时长
      refresh: 0, //二维码刷新时间
    }
  }),

  actions: {
    setQrcode(qrcode) {
      this.qrcode = qrcode;
    },

    update(qrcode) {
      //根据qrcode对象的key更新qrcode对应的值
      for (let key in qrcode) {
        this.qrcode[key] = qrcode[key];
      }
    },

    //清空qrcode
    clear() {
      this.qrcode = {
        id: "",
        expiresAt: 0,
        duration: 0,
        refresh: 0,
      }
    }
  },

});
