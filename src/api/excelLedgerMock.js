export const originalExcelColumns = [
  { key: 'sequenceNo', label: '序号', width: 70, scope: 'group', merged: true },
  { key: 'trainingTopic', label: '培训主题', width: 220, scope: 'group', merged: true },
  { key: 'trainingContent', label: '培训内容', width: 280, scope: 'mixed', merged: true },
  { key: 'trainer', label: '培训师傅', width: 110, scope: 'group', merged: true },
  { key: 'trainee', label: '培训人员', width: 130, scope: 'person', merged: false },
  { key: 'trainingDate', label: '培训日期', width: 100, scope: 'person', merged: false },
  { key: 'startTime', label: '培训开始时间', width: 120, scope: 'person', merged: false },
  { key: 'endTime', label: '培训结束时间', width: 120, scope: 'person', merged: false },
  { key: 'durationHours', label: '培训时长（H）', width: 120, scope: 'person', merged: false },
  { key: 'completedText', label: '是否完成', width: 100, scope: 'person', merged: false },
  { key: 'purpose', label: '达成目的', width: 220, scope: 'group', merged: true },
  { key: 'resultCheck', label: '成果检验', width: 140, scope: 'group', merged: true },
  { key: 'remark', label: '备注', width: 180, scope: 'person', merged: false }
]

export const excelMergeSummary = {
  sheetName: '内容页',
  headerRow: 3,
  dataRows: '4:60',
  groupCount: 19,
  personRowCount: 57,
  mergeCount: 89,
  mergeShape: '3 行 x 1 列',
  alwaysMergedColumns: ['序号', '培训主题', '培训师傅'],
  mostlyMergedColumns: ['培训内容'],
  partialMergedColumns: ['达成目的', '成果检验'],
  personColumns: ['培训人员', '培训日期', '培训开始时间', '培训结束时间', '培训时长（H）', '是否完成', '备注']
}

export const closureFieldDefinitions = [
  { key: 'closureStatus', label: '闭环状态', scope: 'group', type: 'status', merged: true, enabled: true },
  { key: 'gapSummary', label: '缺口说明', scope: 'group', type: 'text', merged: true, enabled: true },
  { key: 'assessmentScore', label: '考核分数', scope: 'person', type: 'number', merged: false, enabled: true },
  { key: 'assessmentResult', label: '考核结果', scope: 'person', type: 'status', merged: false, enabled: true },
  { key: 'assessmentRemark', label: '考核备注', scope: 'person', type: 'text', merged: false, enabled: true },
  { key: 'studentToTutorEvaluation', label: '学员评导师', scope: 'person', type: 'status', merged: false, enabled: true },
  { key: 'tutorToStudentEvaluation', label: '导师评学员', scope: 'person', type: 'status', merged: false, enabled: true },
  { key: 'evaluationSummary', label: '评价摘要', scope: 'person', type: 'text', merged: false, enabled: true },
  { key: 'coursewareStatus', label: '课件状态', scope: 'group', type: 'status', merged: true, enabled: true },
  { key: 'coursewareList', label: '课件清单', scope: 'group', type: 'text', merged: true, enabled: true }
]

const trainees = ['张三（鑫泰）', '李四（鑫悦）', '王五（盛泰）']

const makeRows = (dates, completedTexts = ['√', '√', '√'], contentRows = []) => trainees.map((trainee, index) => ({
  id: `${dates.join('-')}-${index + 1}`,
  trainee,
  trainingDate: dates[index],
  startTime: index === 1 && dates[0] === '1.5' ? '09:30:00' : '13:30:00',
  endTime: index === 1 && dates[0] === '1.5' ? '11:30:00' : '15:30:00',
  durationHours: 2,
  completedText: Array.isArray(completedTexts) ? completedTexts[index] : completedTexts,
  remark: '',
  trainingContent: contentRows[index] ?? null,
  closureValues: {}
}))

const makeSystem = (sequenceNo, trainer) => ({
  photos: sequenceNo <= 6 ? [`ledger-${sequenceNo}-site-1.jpg`] : [],
  coursewares: sequenceNo <= 4
    ? [{ id: `courseware-${sequenceNo}`, name: `培训资料-${sequenceNo}.pdf`, type: 'PDF' }]
    : [],
  assessments: trainees.map((trainee, index) => ({
    rowId: `${sequenceNo}-${index + 1}`,
    trainee,
    score: sequenceNo === 7 && index === 2 ? 58 : 80 + index * 5,
    remark: sequenceNo === 7 && index === 2 ? '需补考' : '已完成'
  })),
  evaluations: [
    { type: 'student_to_tutor', person: trainees[0], rating: 5, comment: '讲解清晰，案例贴近现场' },
    { type: 'tutor_to_student', person: trainees[0], rating: 4, comment: '学习投入，能够按要求完成练习' }
  ]
})

const makeGroup = ({
  sequenceNo,
  trainingTopic,
  trainingContent = '',
  trainer,
  purpose = '',
  resultCheck = '',
  dates,
  completedTexts,
  contentRows,
  mergedColumns
}) => ({
  id: `excel-group-${sequenceNo}`,
  sequenceNo,
  trainingTopic,
  trainingContent,
  trainer,
  purpose,
  resultCheck,
  sourceRows: [sequenceNo * 3 + 1, sequenceNo * 3 + 2, sequenceNo * 3 + 3],
  mergedColumns,
  rows: makeRows(dates, completedTexts, contentRows),
  system: makeSystem(sequenceNo, trainer)
})

export const initialExcelLedgerGroups = [
  makeGroup({
    sequenceNo: 1,
    trainingTopic: '电子元器件识别、电子器件原理分类使用场合',
    trainingContent: '理论与实践1:1结合，每类元件均包含"原理→识别→检测→应用"完整链条，配备实物样品库与典型故障案例库',
    trainer: '宋师傅',
    purpose: '确保学员真正掌握"看得懂、测得准、用得对"的核心能力。',
    resultCheck: '考核',
    dates: ['1.5', '1.7', '1.9'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 2,
    trainingTopic: '电气控制箱标准规范配线要求',
    trainingContent: '1、基础知识培训',
    trainer: '黄师傅',
    purpose: '学会电气控制箱标准规范配线',
    resultCheck: '考核',
    dates: ['1.12', '1.14', '1.16'],
    contentRows: ['1、基础知识培训', '2、安装前准备', '3、元器件、配线接线安装规范'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 3,
    trainingTopic: 'smart200与S7-1200PN通讯',
    trainingContent: '首期课程巩固',
    trainer: '施师傅',
    purpose: '掌握了解',
    resultCheck: '考核',
    dates: ['1.19', '1.21', '1.23'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 4,
    trainingTopic: '3D打印',
    trainingContent: '首期课程巩固',
    trainer: '余师傅',
    purpose: '学会使用3D打印技术',
    resultCheck: '考核',
    dates: ['1.26', '1.28', '1.30'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 5,
    trainingTopic: '电子元器件识别、电子器件原理分类使用场合',
    trainingContent: '首期课程巩固',
    trainer: '宋师傅',
    purpose: '电子元件掌握了解',
    resultCheck: '考核',
    dates: ['2.2', '2.4', '2.6'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 6,
    trainingTopic: '威纶通触摸屏_x000b_与西门子SMART200PLC的简单应用',
    trainingContent: '基础知识培训',
    trainer: '励师傅',
    resultCheck: '考核',
    dates: ['3.9', '3.11', '3.13'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 7,
    trainingTopic: '三相两平衡电炉控制(有芯炉)',
    trainingContent: '1、电压电流通过电阻、线圈、电容相位差\n2、平衡电抗、电客作用\n3、感应下炉结构\n4、线圈首末相接，右手判定电法方向\n5、电源三相相序方向\n6、纯感性负载无功补偿',
    trainer: '陈师傅',
    resultCheck: '考核',
    dates: ['3.16', '3.18', '3.20'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer', 'purpose', 'resultCheck']
  }),
  makeGroup({
    sequenceNo: 8,
    trainingTopic: 'solidsworks 软件基础建模',
    trainer: '陆师傅',
    dates: ['3.23', '3.25', '3.27'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 9,
    trainingTopic: '博图1500基础知识',
    trainer: '施师傅',
    dates: ['3.30', '4.1', '4.3'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 10,
    trainingTopic: '3D建模Proe教学',
    trainingContent: '复习巩固',
    trainer: '余师傅',
    dates: ['4.6', '4.8', '4.10'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 11,
    trainingTopic: '公司各类设备电气图纸认别和解读',
    trainer: '陆旭军',
    dates: ['4.13', '4.15', '4.17'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 12,
    trainingTopic: '《各类PLC与G120变频器的连接，并使用触摸屏进行控制》  ',
    trainer: '励师傅',
    dates: ['4.20', '4.22', '4.24'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 13,
    trainingTopic: '三菱Q系列PLC编程与调试',
    trainer: '黄师傅',
    dates: ['4.27', '4.29', '5.1'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 14,
    trainingTopic: '读懂印刷板',
    trainer: '宋师傅',
    dates: ['5.4', '5.6', '5.8'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 15,
    trainingTopic: '三相两平衡电炉器件配比计算',
    trainingContent: '1、电炉、电熔、电抗配比\n2.炉膛变化电感量的关系\n3.目前使用的大断路器、大接触器(2000A)知识',
    trainer: '陈师傅',
    dates: ['5.11', '5.13', '5.15'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 16,
    trainingTopic: 'ET200SP组态说明',
    trainer: '宋少波',
    dates: ['5.18', '5.20', '5.22'],
    completedTexts: ['', '', ''],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 17,
    trainingTopic: 'SW 填充阵列功能 异形孔螺纹线功能 配合螺旋功能',
    trainer: '陆师傅',
    dates: ['5.25', '5.27', '5.29'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 18,
    trainingTopic: '1500PLC组网通',
    trainer: '施师傅',
    dates: ['6.1', '6.3', '6.5'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  }),
  makeGroup({
    sequenceNo: 19,
    trainingTopic: '3D建模Proe教学基础模型建立',
    trainer: '余师傅',
    dates: ['6.8', '6.10', '6.12'],
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer']
  })
]

export const cloneLedgerGroups = () => JSON.parse(JSON.stringify(initialExcelLedgerGroups))

export const flattenLedgerGroups = (groups) => groups.flatMap(group =>
  group.rows.map((row, rowIndex) => ({
    ...row,
    personRow: row,
    group,
    rowIndex,
    rowKey: `${group.id}-${rowIndex}`,
    isFirstInGroup: rowIndex === 0,
    sequenceNo: group.sequenceNo,
    trainingTopic: group.trainingTopic,
    trainingContent: row.trainingContent ?? group.trainingContent,
    trainer: group.trainer,
    purpose: group.purpose,
    resultCheck: group.resultCheck
  }))
)

export const getExcelLedgerStats = (groups) => {
  const rows = flattenLedgerGroups(groups)
  const completedRows = rows.filter(row => row.completedText === '√').length
  const pendingGroups = groups.filter(group => group.rows.some(row => row.completedText !== '√'))

  return {
    groupCount: groups.length,
    personRowCount: rows.length,
    completedRows,
    completionRate: rows.length ? Math.round((completedRows / rows.length) * 100) : 0,
    pendingGroupCount: pendingGroups.length,
    mergeCount: excelMergeSummary.mergeCount
  }
}

export const getAssessmentForRow = (group, rowIndex) => group.system.assessments[rowIndex]

export const getEvaluationForRow = (group, rowIndex, type) => {
  const trainee = group.rows[rowIndex]?.trainee
  return group.system.evaluations.find(item => item.type === type && item.person === trainee)
}

export const getClosureSummary = (group) => {
  const missingAssessments = group.rows.filter((_, index) => !getAssessmentForRow(group, index)).length
  const missingStudentEvaluations = group.rows
    .filter((_, index) => !getEvaluationForRow(group, index, 'student_to_tutor')).length
  const missingTutorEvaluations = group.rows
    .filter((_, index) => !getEvaluationForRow(group, index, 'tutor_to_student')).length
  const coursewareCount = group.system.coursewares.length
  const gaps = []

  if (missingAssessments) gaps.push(`缺考核${missingAssessments}人`)
  if (missingStudentEvaluations) gaps.push(`缺学员评导师${missingStudentEvaluations}人`)
  if (missingTutorEvaluations) gaps.push(`缺导师评学员${missingTutorEvaluations}人`)
  if (!coursewareCount) gaps.push('缺课件')

  return {
    closureStatus: gaps.length ? '未闭环' : '已闭环',
    gapSummary: gaps.length ? gaps.join('、') : '已齐全',
    coursewareStatus: coursewareCount ? '已上传' : '未上传',
    coursewareList: coursewareCount ? group.system.coursewares.map(file => file.name).join('、') : ''
  }
}

export const getClosureRowValues = (group, rowIndex) => {
  const assessment = getAssessmentForRow(group, rowIndex)
  const studentToTutor = getEvaluationForRow(group, rowIndex, 'student_to_tutor')
  const tutorToStudent = getEvaluationForRow(group, rowIndex, 'tutor_to_student')
  const comments = [studentToTutor?.comment, tutorToStudent?.comment].filter(Boolean)

  return {
    assessmentScore: assessment?.score ?? '',
    assessmentResult: assessment ? (assessment.score >= 60 ? '通过' : '未通过') : '未录入',
    assessmentRemark: assessment?.remark || '',
    studentToTutorEvaluation: studentToTutor ? `已评 ${studentToTutor.rating}分` : '未评',
    tutorToStudentEvaluation: tutorToStudent ? `已评 ${tutorToStudent.rating}分` : '未评',
    evaluationSummary: comments.join('；')
  }
}
