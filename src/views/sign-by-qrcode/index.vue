<template>
  <div>
    <div class="p-4">
      <title-bar class="mb-4" title="发布二维码签到" />

      <div class="px-5 py-6 bg-white rd-3 shadow">
        <!-- 表单 -->
        <n-form
          class="grid grid-cols-2 gap-x-4"
          :label-width="80"
          :model="formData"
        >
          <n-form-item label="专业">
            <div class="py-2 px-4 w-full h-10 border rounded-md text-3.8">
              {{ formData.major }}
            </div>
          </n-form-item>
          <n-form-item label="年级">
            <div class="py-2 px-4 w-full h-10 border rounded-md text-3.8">
              {{ formData.grade }}
            </div>
          </n-form-item>
          <n-form-item label="班级">
            <div class="py-2 px-4 w-full h-10 border rounded-md text-3.8">
              {{ formData.class }}
            </div>
          </n-form-item>
          <n-form-item label="课程">
            <div class="py-2 px-4 w-full h-10 border rounded-md text-3.8 overflow-hidden">
              {{ formData.course }}
            </div>
          </n-form-item>
          <n-form-item label="二维码时长">
            <n-input-number
              v-model:value="formData.qrcodeDuration"
              placeholder=""
              :min="1"
              :max="10"
              size="large"
              ><template #suffix>
                <div class="text-3">分钟</div>
              </template></n-input-number
            >
          </n-form-item>
          <n-form-item label="二维码刷新频率">
            <n-input-number
              v-model:value="formData.qrcodeRefresh"
              placeholder=""
              :min="5"
              :max="60"
              size="large"
              ><template #suffix>
                <div class="text-3">秒/次</div>
              </template></n-input-number
            >
          </n-form-item>
        </n-form>

        <!-- 签到按钮 -->
        <div class="flex justify-between">
          <n-button
            type="primary"
            :disabled="issueButtonDisabled"
            @click="issueHandler"
            >发布</n-button
          >
          <n-button
            type="warning"
            @click="toQrcodeView"
            >查看当前二维码</n-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import courseRequest from "../../api/mothods/course";
import qrcodeRequest from "../../api/mothods/qrcode";
import timeUtil from "../../utils/time";
import router from "../../router";
import { useUserStore } from "../../store/userStore";
import { useQrcodeStore } from "../../store/qrcodeStore";


const userStore = useUserStore();
const qrcodeStore = useQrcodeStore();

// 表单数据
const formData = ref({
  major: "",
  majorId: "",
  grade: "",
  course: "",
  courseId: "",
  class: "",
  qrcodeDuration: 10,
  qrcodeRefresh: 5,
});

// 二维码id
const qrcodeId = ref(null);
// 二维码过期时间
const qrcodeExpiresAt = ref(null);

// 发布按钮是否禁用
const issueButtonDisabled = computed(() => {
  return (
    formData.value.major === "" ||
    formData.value.grade === "" ||
    formData.value.course === "" ||
    formData.value.class === "" ||
    formData.value.qrcodeDuration === null ||
    formData.value.qrcodeRefresh === null
  );
});

// 发布二维码签到
const issueHandler = async () => {
  const { data } = await qrcodeRequest.init(formData.value);

  if (data.code === 200) {
    console.log(data.data)
    window.$message.success("发布成功", {
      keepAliveOnHover: true,
      duration: 800,
      max: 2,
    });

    qrcodeStore.setQrcode({
      id: data.data.ID, //
      expiresAt: data.data.ClientData.expiresAt, // 过期时间
      duration: data.data.ExpiresAt, // 有效时长
      refresh: data.data.ClientData.qrcodeRefresh, // 刷新频率
    })
  }
};

// 查找当前正在进行的课程
const findCourseHandler = async () => {
  const { data } = await courseRequest.findByTeacherId(userStore.user.id);
  console.log(data);
  if (data.code === 200) {
    // 获取当前时间
    const nowTime = timeUtil.getNowTime();
    const day = new Date().getDay();

    // 遍历课程列表，找到当前时间正在进行的课程
    for (let i = 0; i < data.data.length; i++) {
      if (timeUtil.getDayFromDateTime(data.data[i].startTime) !== day) continue;

      if (
        timeUtil.getTimeFromDateTime(data.data[i].startTime) <= nowTime &&
        nowTime <= timeUtil.getTimeFromDateTime(data.data[i].endTime)
      ) {
        // 设置表单数据
        formData.value = {
          ...formData.value,
          major: data.data[i].major,
          majorId: data.data[i].majorId,
          grade: data.data[i].grade,
          class: data.data[i].class.replace(",", "-"),
          course: data.data[i].course,
          courseId: data.data[i].id,
          classroom: data.data[i].classroom,
          teacherId: data.data[i].teacherId,
          teacherName: data.data[i].teacherName,
        };
        return;
      }
    }

    window.$message.warning("当前没有正在进行的课程", {
      keepAliveOnHover: true,
      duration: 800,
      max: 2,
    });
  }
};

//跳转到二维码页面
const toQrcodeView = () => {
  router.push({
    name: "QrcodeView"
  });
};

onMounted(() => {
  findCourseHandler();
});
</script>

<style>
.n-input {
  border-radius: 0.375rem;
}
</style>
