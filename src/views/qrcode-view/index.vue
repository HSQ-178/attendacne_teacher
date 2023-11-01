<template>
  <div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="" v-if="qrcodeStore.qrcode.id !== ''">
        <img :src="imageUrl" alt="" />
        <div class="flex items-center mt-4">
          <div class="mr-2 block">二维码到期时间:</div>
          <div class="font-bold">
            {{ timeUtil.getTimeFromDateTime(qrcodeStore.qrcode.duration) }}
          </div>
        </div>
      </div>

      <div v-else>
        <n-result
          status="404"
          title="二维码过期"
          description="可重新发布二维码签到"
          @click="router.back()"
        >
          <template #footer>
            <n-button>点击返回</n-button>
          </template>
        </n-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { baseURL } from "../../api/index";
import router from "../../router";
import timeUtil from "../../utils/time.js";
import { useQrcodeStore } from "../../store/qrcodeStore";

const qrcodeStore = useQrcodeStore();

const imageUrl = ref(`${baseURL}/qrcode/findById?id=${qrcodeStore.qrcode.id}`);

onMounted(() => {
  const timer = setInterval(() => {
    // 二维码过期
    if (
      new Date().getTime() > new Date(qrcodeStore.qrcode.duration).getTime()
    ) {
      qrcodeStore.clear();

      clearInterval(timer);

      return;
    }

    // 二维码即将过期
    if (new Date().getTime() > qrcodeStore.qrcode.expiresAt) {
      qrcodeStore.update({
        expiresAt:
          qrcodeStore.qrcode.expiresAt + qrcodeStore.qrcode.refresh * 1000,
      });
      router.go(0);
    }
  }, 100);
});
</script>
