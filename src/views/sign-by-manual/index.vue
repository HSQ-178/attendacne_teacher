<template>
  <div>
    <div class="p-4">
      <title-bar class="mb-4" title="手动签到" />

      <div class="px-5 py-6 bg-white rd-3 shadow">
        <!-- 表单 -->
        <n-form :label-width="80" :model="formData">
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
          <n-form-item label="课程">
            <div class="py-2 px-4 w-full h-10 border rounded-md text-3.8">
              {{ formData.course }}
            </div>
          </n-form-item>
          <n-form-item label="学号">
            <n-input
              v-model:value="formData.studentId"
              placeholder="输入学号"
              size="large"
              clearable
              maxlength="3"
              :allow-input="() => !value || /^\d+$/.test(value)"
              style="
                --n-border-hover: none;
                --n-border-focus: none;
                border-radius: 6px;
              "
            />
          </n-form-item>
          <n-form-item label="姓名">
            <div class="py-2 px-4 w-full h-10 border rounded-md text-3.8">
              {{ formData.studentName }}
            </div>
          </n-form-item>
        </n-form>

        <!-- 签到按钮 -->
        <div class="">
          <n-button
            type="primary"
            :disabled="signButtonDisabled"
            @click="signHandler"
            >签到</n-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import TitleBar from "../../components/TitleBar.vue";
import courseRequest from "../../api/mothods/course.js";
import studentRequest from "../../api/mothods/student.js";
import recordRequest from "../../api/mothods/record.js";

import timeUtil from "../../utils/time.js";
import { useUserStore } from "../../store/userStore.js";

const userStore = useUserStore();

// 表单数据
const formData = ref({
  major: "",
  majorId: "",
  grade: "",
  class: "",
  course: "",
  courseId: "",
  studentId: "",
  studentName: "",
  classroom: "",
  teacherId: "",
  teacherName: "",
  startTime: "",
  endTime: "",
});

// 签到按钮是否禁用
const signButtonDisabled = ref(true);

/**
 * 学生学号输入框值变化处理函数
 */
const studentIdChangeHandler = () => {
  if (
    formData.value.studentId?.length === 3 &&
    formData.value.majorId !== "" &&
    formData.value.grade !== ""
  ) {
    // 根据学号获取学生姓名
    findStudentHandler();
  } else {
    signButtonDisabled.value = true;
    formData.value.studentName = "";
  }
};

// 监听学号输入框值变化
watch(
  () => formData.value.studentId,
  (newValue) => {
    studentIdChangeHandler();
  }
);

/**
 * 根据年级和教师id查找课程
 */
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
          major: data.data[i].major,
          majorId: data.data[i].majorId,
          grade: data.data[i].grade,
          class: data.data[i].class,
          course: data.data[i].course,
          courseId: data.data[i].id,
          classroom: data.data[i].classroom,
          teacherId: data.data[i].teacherId,
          teacherName: data.data[i].teacherName,
          startTime: data.data[i].startTime,
          endTime: data.data[i].endTime,
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

/**
 * 根据专业id、年级和学号查找学生
 */
const findStudentHandler = async () => {
  const { data } =
    await studentRequest.findStudentByMajorIdAndGradeAndStudentId(
      formData.value.majorId,
      formData.value.grade,
      formData.value.studentId
    );

  if (data.code === 200) {
    if (data.data === null) {
      window.$message.error("没有找到该学生", {
        keepAliveOnHover: true,
        duration: 800,
        max: 2,
      });
      return;
    }
    signButtonDisabled.value = false;

    formData.value.studentName = data.data.studentName;
  }
};

/**
 * 签到
 */
const signHandler = async () => {
  const { data } = await recordRequest.save({
    grade: formData.value.grade,
    majorId: formData.value.majorId,
    courseId: formData.value.courseId,
    studentId: formData.value.studentId,
    status: "1",
  });

  if (data.code === 200) {
    window.$message.success(
      formData.value.studentId + " " + formData.value.studentName + "签到成功"
    ),
      {
        keepAliveOnHover: true,
        duration: 800,
        max: 2,
      };
    formData.value.studentId = "";
    return;
  }

  window.$message.error("签到失败", {
    keepAliveOnHover: true,
    duration: 800,
    max: 2,
  });
};

onMounted(() => {
  findCourseHandler();
});
</script>
