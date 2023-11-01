<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <title-bar class="" title="签到记录详情" />
      <n-dropdown
        trigger="click"
        size="large"
        :options="radioButtonData"
        @select="(key) => (curTableValue = key)"
      >
        <n-button strong secondary type="primary"
          ><div class="i-ic:baseline-menu"
        /></n-button>
      </n-dropdown>
    </div>

      <n-data-table
        :bordered="false"
        :columns="dataTableColumns"
        :data="dataTableList"
        :pagination="false"
        :loading="dataTableLoading"
        border
      />
  </div>
</template>

<script setup>
import TitleBar from "../../components/TitleBar.vue";
import recordRequest from "../../api/mothods/record.js";
import timeUtil from "../../utils/time.js";
import { h, onMounted, render } from "vue";
import { NButton } from "naive-ui";
import student from "../../api/mothods/student";

const props = defineProps({
  date: String, // 日期
  majorId: String, // 专业ID
  grade: String, // 年级
  class: String, // 班级
  courseId: String, // 课程ID
});

// 当前表格值
const curTableValue = ref("notSigned");

// 组合按钮数据
const radioButtonData = [
  {
    label: "未签到",
    key: "notSigned",
    icon: () =>
      h(
        NButton,
        {
          strong: true,
          secondary: true,
          type: "warning",
          size: "tiny",
        },
        {
          default: () =>
            h("div", {
              class:
                "i-ic:baseline-access-time text-4 text-center items-center",
            }),
        }
      ),
  },
  {
    label: "已签到",
    key: "signed",
    icon: () =>
      h(
        NButton,
        {
          strong: true,
          secondary: true,
          type: "primary",
          size: "tiny",
        },
        {
          default: () =>
            h("div", {
              class: "i-ic:baseline-check text-4 text-center items-center",
            }),
        }
      ),
  },
  {
    label: "旷课",
    key: "absence",
    icon: () =>
      h(
        NButton,
        {
          strong: true,
          secondary: true,
          type: "error",
          size: "tiny",
        },
        {
          default: () =>
            h("div", {
              class: "i-ic:baseline-clear text-4 text-center items-center",
            }),
        }
      ),
  },
];

// 表格列数据
const dataTableColumns = [
  {
    title: "学号",
    key: "studentId",
    defaultSortOrder: "ascend",
    sorter: "default",
  },
  {
    title: "姓名",
    key: "studentName",
  },
  {
    title: "选项",
    key: "option",
    render(row) {
      return h(
        "div",
        {
          class: "flex justify-around",
        },
        [
          curTableValue.value == "notSigned"
            ? [
                // 未签到
                // 未签到 -> 已签到
                h(
                  NButton,
                  {
                    strong: true,
                    secondary: true,
                    type: "primary",
                    size: "tiny",
                    onClick: () => {
                      markAsSigned(row);
                    },
                  },
                  {
                    default: () =>
                      h("div", {
                        class:
                          "i-ic:baseline-check text-4 text-center items-center",
                      }),
                  }
                ),
                // 未签到 -> 旷课
                h(
                  NButton,
                  {
                    strong: true,
                    secondary: true,
                    type: "error",
                    size: "tiny",
                    onClick: () => {
                      markAsAbsent(row);
                    },
                  },
                  {
                    default: () =>
                      h("div", {
                        class:
                          "i-ic:baseline-clear text-4 text-center items-center",
                      }),
                  }
                ),
              ]
            : [
                curTableValue.value == "signed"
                  ? // 已签到
                    [
                      // 已签到 -> 未签到
                      h(
                        NButton,
                        {
                          strong: true,
                          secondary: true,
                          type: "warning",
                          size: "tiny",
                          onClick: () => {
                            markAsNotSigned(row);
                          },
                        },
                        {
                          default: () =>
                            h("div", {
                              class:
                                "i-ic:baseline-access-time text-4 text-center items-center",
                            }),
                        }
                      ),
                      // 已签到 -> 旷课
                      h(
                        NButton,
                        {
                          strong: true,
                          secondary: true,
                          type: "error",
                          size: "tiny",
                          onClick: () => {
                            markAsAbsent(row);
                          },
                        },
                        {
                          default: () =>
                            h("div", {
                              class:
                                "i-ic:baseline-clear text-4 text-center items-center",
                            }),
                        }
                      ),
                    ]
                  : [
                      // 旷课
                      // 旷课 -> 未签到
                      h(
                        NButton,
                        {
                          strong: true,
                          secondary: true,
                          type: "warning",
                          size: "tiny",
                          onClick: () => {
                            markAsNotSigned(row);
                          },
                        },
                        {
                          default: () =>
                            h("div", {
                              class:
                                "i-ic:baseline-access-time text-4 text-center items-center",
                            }),
                        }
                      ),
                      // 旷课 -> 已签到
                      h(
                        NButton,
                        {
                          strong: true,
                          secondary: true,
                          type: "primary",
                          size: "tiny",
                          onClick: () => {
                            markAsSigned(row);
                          },
                        },
                        {
                          default: () =>
                            h("div", {
                              class:
                                "i-ic:baseline-check text-4 text-center items-center",
                            }),
                        }
                      ),
                    ],
              ],
        ]
      );
    },
  },
];

// 表格显示数据
const dataTableList = computed(() => {
  switch (curTableValue.value) {
    case "notSigned":
      return notSignedData.value;
    case "signed":
      return signedData.value;
    case "absence":
      return absenceData.value;
    default:
      return [];
  }
});

const dataTableLoading = ref(true); // 表格加载状态

const notSignedData = ref([]); // 未签到
const signedData = ref([]); // 已签到
const absenceData = ref([]); // 旷课

/**
 * 根据专业ID、年级、班级、课程ID和日期查询未签到的学生
 */
const findNotSignedByCourseIdAndDate = async () => {
  dataTableLoading.value = true;

  const { data } =
    await recordRequest.findNotSignedByMajorIdAndGradeAndClassAndCourseIdAndDate(
      {
        majorId: props.majorId,
        grade: props.grade,
        class: props.class,
        courseId: props.courseId,
        date: timeUtil.getDateFromDateTime(props.date),
      }
    );

  if (data.code === 200) {
    notSignedData.value = data.data?.length > 0 ? data.data : [];

    dataTableLoading.value = false;
  }
};

/**
 * 根据课程ID和日期查询已签到的学生
 */
const findSignedByCourseIdAndDate = async () => {
  const { data } = await recordRequest.findSignedByCourseIdAndDate({
    courseId: props.courseId,
    date: timeUtil.getDateFromDateTime(props.date),
  });

  if (data.code === 200) {
    signedData.value = data.data?.length > 0 ? data.data : [];
  }
};

/**
 * 根据课程ID和日期查询旷课的学生
 */
const findAbsenceByCourseIdAndDate = async () => {
  const { data } = await recordRequest.findAbsenceByCourseIdAndDate({
    courseId: props.courseId,
    date: timeUtil.getDateFromDateTime(props.date),
  });

  if (data.code === 200) {
    absenceData.value = data.data?.length > 0 ? data.data : [];
  }
};

/**
 * 标记为已签到
 */
const markAsSigned = async (studentData) => {
  // 未签到 -> 已签到
  if (curTableValue.value === "notSigned") {
    const { data } = await recordRequest.save({
      majorId: props.majorId,
      grade: props.grade,
      studentId: studentData.studentId,
      courseId: props.courseId,
      status: "1",
      createTime: props.date,
    });

    if (data.code === 200) {
      window.$message.success(
        props.grade +
          "级" +
          studentData.studentId +
          studentData.studentName +
          "记录签到成功",
        {
          keepAliveOnHover: true,
          duration: 800,
          max: 2,
        }
      );

      // 从未签到列表中删除
      notSignedData.value = notSignedData.value.filter(
        (item) => item.studentId !== studentData.studentId
      );

      // 添加到已签到列表中
      signedData.value.push(studentData);
    }
  }

  // 旷课 -> 已签到
  if (curTableValue.value === "absence") {
    const { data } = await recordRequest.updateStatus({
      id: row.id, // 记录ID
      status: "1", // 状态
    });

    if (data.code === 200) {
      window.$message.success(
        props.grade +
          "级" +
          studentData.studentId +
          studentData.studentName +
          "记录签到成功",
        {
          keepAliveOnHover: true,
          duration: 800,
          max: 2,
        }
      );

      // 从旷课列表中删除
      absenceData.value = absenceData.value.filter(
        (item) => item.studentId !== studentData.studentId
      );

      // 添加到已签到列表中
      signedData.value.push(studentData);
    }
  }
};

/**
 * 标记为旷课
 */
const markAsAbsent = async (studentData) => {
  // 未签到 -> 旷课
  if (curTableValue.value === "notSigned") {
    const { data } = await recordRequest.save({
      majorId: props.majorId,
      grade: props.grade,
      studentId: studentData.studentId,
      courseId: props.courseId,
      status: "0",
      createTime: props.date,
    });

    if (data.code === 200) {
      window.$message.success(
        props.grade +
          "级" +
          studentData.studentId +
          studentData.studentName +
          "记录旷课成功",
        {
          keepAliveOnHover: true,
          duration: 800,
          max: 2,
        }
      );

      // 从未签到列表中删除
      notSignedData.value = notSignedData.value.filter(
        (item) => item.studentId !== studentData.studentId
      );

      // 添加到旷课列表中
      absenceData.value.push(studentData);
    }
  }

  // 已签到 -> 旷课
  if (curTableValue.value === "signed") {
    const { data } = await recordRequest.updateStatus({
      id: studentData.id, // 记录ID
      status: "0", // 状态
    });

    if (data.code === 200) {
      window.$message.success(
        props.grade +
          "级" +
          studentData.studentId +
          studentData.studentName +
          "记录旷课成功",
        {
          keepAliveOnHover: true,
          duration: 800,
          max: 2,
        }
      );

      // 从已签到列表中删除
      signedData.value = signedData.value.filter(
        (item) => item.studentId !== studentData.studentId
      );

      // 添加到旷课列表中
      absenceData.value.push(studentData);
    }
  }
};

/**
 * 标记为未签到
 */
const markAsNotSigned = async (studentData) => {
  // 已签到 -> 未签到
  if (curTableValue.value === "signed") {
    const { data } = await recordRequest.deleteByRecordId({
      recordId: studentData.id, // 记录ID
    });

    if (data.code === 200) {
      window.$message.success(
        props.grade +
          "级" +
          studentData.studentId +
          studentData.studentName +
          "记录未签到成功",
        {
          keepAliveOnHover: true,
          duration: 800,
          max: 2,
        }
      );

      // 从已签到列表中删除
      signedData.value = signedData.value.filter(
        (item) => item.studentId !== studentData.studentId
      );

      // 添加到未签到列表中
      notSignedData.value.push(studentData);
    }
  }

  // 旷课 -> 未签到
  if (curTableValue.value === "absence") {
    const { data } = await recordRequest.deleteByRecordId({
      id: studentData.id, // 记录ID
    });

    if (data.code === 200) {
      window.$message.success(
        props.grade +
          "级" +
          studentData.studentId +
          studentData.studentName +
          "记录未签到成功",
        {
          keepAliveOnHover: true,
          duration: 800,
          max: 2,
        }
      );

      // 从旷课列表中删除
      absenceData.value = absenceData.value.filter(
        (item) => item.studentId !== studentData.studentId
      );

      // 添加到未签到列表中
      notSignedData.value.push(studentData);
    }
  }
};

onMounted(() => {
  findNotSignedByCourseIdAndDate(); // 查询未签到的学生
  findSignedByCourseIdAndDate(); // 查询已签到的学生
  findAbsenceByCourseIdAndDate(); // 查询旷课的学生
});
</script>
