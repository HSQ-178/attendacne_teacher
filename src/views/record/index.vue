<template>
  <div class="p-4">
    <title-bar class="mb-4" title="签到记录" />

    <div class="grid gap-4">
      <div class="flex justify-between items-center">
        <n-date-picker
          v-model:value="formData.timestamp"
          class="w-48%"
          size="large"
          type="date"
          placeholder="日期"
        />
        <n-cascader
          v-model:value="formData.value1"
          class="w-48%"
          :options="cascaderOptions"
          size="large"
          placeholder="详细课程"
          placement="bottom-end"
        />
      </div>
      <div>
        <n-data-table
          :bordered="false"
          :columns="dataTableColumns"
          :data="dataTableList"
          :pagination="false"
          :row-props="rowProps"
          :loading="dataTableLoading"
          striped
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import TitleBar from "../../components/TitleBar.vue";
import recordRequest from "../../api/mothods/record.js";
import timeUtil from "../../utils/time.js";
import router from "../../router";
import { useUserStore } from "../../store/userStore.js";

const userStore = useUserStore();

// 表单数据
const formData = ref({
  timestamp: null,
  courseId: null,
  value1: null,
});

// 级联选择器数据
const cascaderOptions = ref([]);

// 表格列数据
const dataTableColumns = [
  {
    title: "日期",
    key: "date",
  },
  {
    title: "班级",
    key: "majorAndGradeAndClass",
  },
  {
    title: "课程",
    key: "course",
    ellipsis: true
  },
];

// 表格加载状态
const dataTableLoading = ref(false);
// 表格数据
const dataTableList = ref([]);

/**
 * 通过教师ID查询记录组
 */
const findRecordGroupByTeacherId = async () => {

  dataTableLoading.value = true;

  const { data } = await recordRequest.findGroupByTeacherId(userStore.user.id);
  console.log(data);
  if (data.code === 200) {
    dataTableList.value = data.data.length > 0 ? data.data : [];

    dataTableList.value.forEach((item) => {
      item.date = timeUtil.getDateFromDateTime(item.date);
      item.majorAndGradeAndClass = `${item.grade}${item.major.slice(0,2)}${item.class.replace(",", "-")}班`;
    });
  }

  dataTableLoading.value = false;
};

// 监听表单数据变化
const rowProps = (row) => {
  return {
    onClick: () => {
      router.push({
        name: "RecordDetail",
        params: {
          date: new Date(row.date + " " + timeUtil.getTimeFromDateTime(row.startTime)).toISOString(),
          majorId: row.majorId,
          grade: row.grade,
          class: row.class,
          courseId: row.courseId,
        },
      })
    },
  }
};

onMounted(() => {
  findRecordGroupByTeacherId();
});
</script>

<style>
.n-data-table-th__title {
  text-align: center;
}

td.n-data-table-td.n-data-table-td {
  text-align: center;
}
</style>
