<template>
  <div class="p-4">
    <title-bar title="数据导入" />
    <div class="grid gap-6 px-5 py-6 mt-4 bg-white rd-3 shadow">
      <div class="flex justify-between items-center">
        <n-button type="primary" @click="saveStudentHandler"
          >一键导入学生</n-button
        >
        <div>当前导入学生数量: {{ studentCount }}</div>
      </div>
      <div class="flex justify-between items-center">
        <n-button type="primary" @click="saveCourseHandler"
          >一键导入课程</n-button
        >
        <div>当前导入课程数量: {{ courseCount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import TitleBar from "../../components/TitleBar.vue";
import studentRequest from "../../api/mothods/student.js";
import courseRequest from "../../api/mothods/course.js";

import studentData from "../../config/studentData.js";
import courseData from "../../config/courseData.js";

const studentCount = ref(0); // 当前导入学生数量
const courseCount = ref(0); // 当前导入课程数量

/**
 * 保存学生
 */
const saveStudentHandler = async () => {
  studentData.forEach(async (item) => {
    const { data } = await studentRequest.save({
      studentName: item.studentName,
      studentId: item.username.slice(8),
      grade: item.username.slice(0, 2),
      class: item.username[8],
      gender: item.gender === "男" ? "1" : "0",
      username: item.username,
      majorId:
        item.major === "软件技术" ? "114d9b4a-0dae-40f4-9714-89578ae62ee5" : "",
    });

    if (data.code === 200) {
      studentCount.value++;
    }
  });
};

/**
 * 保存课程
 */
const saveCourseHandler = async () => {
  courseData.forEach(async (item) => {
    const { data } = await courseRequest.save({
      ...item,
      startTime: new Date(item.startTime),
      endTime: new Date(item.endTime),
    });

    if (data.code === 200) {
      courseCount.value++;
    }
  });
};

onMounted(() => {
  
});
</script>
