// Mock data for the training ledger prototype.

export const studios = [
  { id: 'studio_a', name: '一号工作室', shortName: '导师A' },
  { id: 'studio_b', name: '二号工作室', shortName: '导师C' }
]

export const trainingStatuses = {
  upcoming: { text: '未开始', type: 'info', order: 1 },
  completed: { text: '已完成', type: 'success', order: 2 },
  assessed: { text: '已考核', type: 'warning', order: 3 },
  evaluated: { text: '已闭环', type: 'success', order: 4 }
}

export const tutors = [
  {
    id: 1,
    name: '导师A',
    studio: 'studio_a',
    company: '工匠工作室',
    phone: '13000000001',
    title: '液压装配导师',
    level: '高级技师',
    years: 8,
    profileSummary: '长期负责液压阀结构识别、拆解实操和现场故障复盘培训。',
    specialtyTags: ['液压阀', '拆解实操', '故障复盘'],
    certificates: ['高级技师', '内训师'],
    photoMaterial: 'tutor-a-profile.jpg'
  },
  {
    id: 2,
    name: '导师B',
    studio: 'studio_a',
    company: '工匠工作室',
    phone: '13000000002',
    title: '设备维修导师',
    level: '技师',
    years: 6,
    profileSummary: '擅长设备维修、密封件更换和现场抢修案例教学。',
    specialtyTags: ['设备维修', '密封件更换', '案例教学'],
    certificates: ['技师', '安全培训讲师'],
    photoMaterial: 'tutor-b-profile.jpg'
  },
  {
    id: 3,
    name: '导师C',
    studio: 'studio_b',
    company: '工匠工作室',
    phone: '13000000003',
    title: '泵类设备导师',
    level: '高级工',
    years: 5,
    profileSummary: '负责柱塞泵原理、压力调节和异常噪声判断相关课程。',
    specialtyTags: ['柱塞泵', '压力调节', '异常判断'],
    certificates: ['高级工'],
    photoMaterial: 'tutor-c-profile.jpg'
  },
  {
    id: 4,
    name: '导师D',
    studio: 'studio_b',
    company: '工匠工作室',
    phone: '13000000004',
    title: '热处理导师',
    level: '高级技师',
    years: 9,
    profileSummary: '聚焦热处理参数窗口、硬度检测和过程记录规范。',
    specialtyTags: ['热处理', '硬度检测', '过程记录'],
    certificates: ['高级技师', '质量内审员'],
    photoMaterial: 'tutor-d-profile.jpg'
  }
]

export const students = [
  {
    id: 1,
    name: '学员A',
    studio: 'studio_a',
    company: '企业A',
    phone: '13100000001',
    roleTitle: '装配工',
    resumeSummary: '3 年液压装配经验，熟悉阀体拆装、基础点检和现场安全规范。',
    skillTags: ['液压阀', '拆解实操', '现场点检'],
    certificates: ['初级工']
  },
  {
    id: 2,
    name: '学员B',
    studio: 'studio_a',
    company: '企业B',
    phone: '13100000002',
    roleTitle: '维修工',
    resumeSummary: '参与设备维修和异常复盘，具备常见密封件更换经验。',
    skillTags: ['设备维修', '故障复盘', '密封件更换'],
    certificates: ['中级工']
  },
  {
    id: 3,
    name: '学员C',
    studio: 'studio_a',
    company: '企业A',
    phone: '13100000003',
    roleTitle: '见习技工',
    resumeSummary: '新进技能培养对象，重点补齐液压阀结构识别和标准化操作。',
    skillTags: ['结构识别', '标准作业'],
    certificates: ['培训中']
  },
  {
    id: 4,
    name: '学员D',
    studio: 'studio_b',
    company: '企业C',
    phone: '13100000004',
    roleTitle: '机修工',
    resumeSummary: '熟悉泵类设备日常维护，正在提升故障定位和参数判断能力。',
    skillTags: ['柱塞泵', '设备维护', '参数判断'],
    certificates: ['中级工']
  },
  {
    id: 5,
    name: '学员E',
    studio: 'studio_b',
    company: '企业B',
    phone: '13100000005',
    roleTitle: '质检员',
    resumeSummary: '负责基础质量记录和检测协同，关注过程记录完整性。',
    skillTags: ['质量记录', '检测协同'],
    certificates: ['初级工']
  },
  {
    id: 6,
    name: '学员F',
    studio: 'studio_b',
    company: '企业C',
    phone: '13100000006',
    roleTitle: '热处理操作员',
    resumeSummary: '参与热处理过程记录和硬度检测，需继续强化参数窗口理解。',
    skillTags: ['热处理', '硬度检测', '过程记录'],
    certificates: ['培训中']
  }
]

export const trainingPlans = [
  {
    id: 1,
    sequenceNo: 1,
    studio: 'studio_a',
    studioName: '一号工作室',
    courseName: '液压阀基础知识（1）',
    trainingContent: '电磁阀结构、拆解步骤与常见故障排查',
    tutor: '导师A',
    tutorId: 1,
    students: ['学员A'],
    studentIds: [1],
    startDate: '2026-06-08',
    endDate: '2026-06-08',
    startTime: '09:30',
    endTime: '11:30',
    durationHours: 2,
    location: '一号工作室',
    status: 'evaluated',
    manualClosed: false,
    purpose: '掌握液压阀基础结构，能独立识别主要部件',
    resultCheck: '现场提问与拆解演示均通过',
    executionRemark: '学员A已完成现场实操',
    changeLogs: [
      { time: '2026-06-07 16:20', operator: '台账用户', action: '确认授课时间', detail: '按原计划执行' }
    ],
    source: '历史Excel导入',
    photos: ['valve-site-1.jpg', 'valve-site-2.jpg'],
    coursewares: [
      {
        id: 1,
        name: '液压阀结构图解.pdf',
        type: 'PDF',
        visibility: 'public',
        knowledgeTags: ['液压阀', '结构识别'],
        summary: '适合课前预习和课后复盘，重点看电磁阀主要部件和拆解顺序。',
        url: '/courseware/valve-structure.pdf'
      },
      {
        id: 2,
        name: '电磁阀拆解步骤.docx',
        type: 'Word',
        visibility: 'class',
        knowledgeTags: ['拆解步骤', '实操'],
        summary: '课堂实操材料，仅对参训学员开放。',
        url: '/courseware/valve-disassemble.docx'
      }
    ],
    assessments: [
      { studentId: 1, score: 85, result: '通过', remark: '结构识别准确' }
    ],
    evaluations: [
      { type: 'student_to_tutor', studentId: 1, tutorId: 1, rating: 5, comment: '讲解清晰，实操时间充足', source: '企微导入' },
      { type: 'tutor_to_student', studentId: 1, tutorId: 1, rating: 5, comment: '实操掌握快', source: '系统录入' }
    ]
  },
  {
    id: 5,
    sequenceNo: 2,
    studio: 'studio_a',
    studioName: '一号工作室',
    courseName: '液压阀基础知识（1）',
    trainingContent: '电磁阀结构、拆解步骤与常见故障排查',
    tutor: '导师A',
    tutorId: 1,
    students: ['学员B'],
    studentIds: [2],
    startDate: '2026-06-09',
    endDate: '2026-06-09',
    startTime: '09:30',
    endTime: '11:30',
    durationHours: 2,
    location: '一号工作室',
    status: 'assessed',
    manualClosed: false,
    purpose: '掌握液压阀基础结构，能独立识别主要部件',
    resultCheck: '已完成线下考核',
    executionRemark: '同一课程按学员分批排班',
    changeLogs: [
      { time: '2026-06-08 17:20', operator: '台账用户', action: '分批排班', detail: '同一导师同一课程安排第二场' }
    ],
    source: '系统录入',
    photos: ['valve-site-4.jpg'],
    coursewares: [
      {
        id: 1,
        name: '液压阀结构图解.pdf',
        type: 'PDF',
        visibility: 'public',
        knowledgeTags: ['液压阀', '结构识别'],
        summary: '适合课前预习和课后复盘，重点看电磁阀主要部件和拆解顺序。',
        url: '/courseware/valve-structure.pdf'
      }
    ],
    assessments: [
      { studentId: 2, score: 92, result: '通过', remark: '实操熟练' }
    ],
    evaluations: [
      { type: 'student_to_tutor', studentId: 2, tutorId: 1, rating: 4, comment: '内容很多，希望节奏慢一点', source: '系统录入' },
      { type: 'tutor_to_student', studentId: 2, tutorId: 1, rating: 5, comment: '拆解步骤掌握较好', source: '系统录入' }
    ]
  },
  {
    id: 6,
    sequenceNo: 3,
    studio: 'studio_a',
    studioName: '一号工作室',
    courseName: '液压阀基础知识（1）',
    trainingContent: '电磁阀结构、拆解步骤与常见故障排查',
    tutor: '导师A',
    tutorId: 1,
    students: ['学员C'],
    studentIds: [3],
    startDate: '2026-06-10',
    endDate: '2026-06-10',
    startTime: '09:30',
    endTime: '11:30',
    durationHours: 2,
    location: '一号工作室',
    status: 'completed',
    manualClosed: false,
    purpose: '掌握液压阀基础结构，能独立识别主要部件',
    resultCheck: '',
    executionRemark: '同一课程按学员分批排班，待录入考核',
    changeLogs: [
      { time: '2026-06-09 17:20', operator: '台账用户', action: '分批排班', detail: '同一导师同一课程安排第三场' }
    ],
    source: '系统录入',
    photos: [],
    coursewares: [
      {
        id: 1,
        name: '液压阀结构图解.pdf',
        type: 'PDF',
        visibility: 'public',
        knowledgeTags: ['液压阀', '结构识别'],
        summary: '适合课前预习和课后复盘，重点看电磁阀主要部件和拆解顺序。',
        url: '/courseware/valve-structure.pdf'
      }
    ],
    assessments: [],
    evaluations: []
  },
  {
    id: 2,
    sequenceNo: 4,
    studio: 'studio_a',
    studioName: '一号工作室',
    courseName: '液压阀基础知识（2）',
    trainingContent: '阀芯磨损判断、密封件更换与故障复盘',
    tutor: '导师B',
    tutorId: 2,
    students: ['学员A', '学员B'],
    studentIds: [1, 2],
    startDate: '2026-06-12',
    endDate: '2026-06-12',
    startTime: '09:30',
    endTime: '11:30',
    durationHours: 2,
    location: '一号工作室',
    status: 'completed',
    manualClosed: true,
    manualCloseReason: '线下记录已确认完整，评价与考核由纸质表留存。',
    purpose: '能判断常见密封失效原因',
    resultCheck: '',
    executionRemark: '已执行培训，待录入考核',
    changeLogs: [
      { time: '2026-06-10 09:12', operator: '导师B', action: '改期', detail: '因现场抢修，课程从 2026-06-11 调整至 2026-06-12' }
    ],
    source: '系统录入',
    photos: ['valve-site-3.jpg'],
    coursewares: [],
    assessments: [],
    evaluations: []
  },
  {
    id: 3,
    sequenceNo: 5,
    studio: 'studio_b',
    studioName: '二号工作室',
    courseName: '柱塞泵工作原理',
    trainingContent: '柱塞泵结构、压力调节和异常噪声判断',
    tutor: '导师C',
    tutorId: 3,
    students: ['学员D', '学员E', '学员F'],
    studentIds: [4, 5, 6],
    startDate: '2026-06-06',
    endDate: '2026-06-06',
    startTime: '14:00',
    endTime: '16:00',
    durationHours: 2,
    location: '二号工作室',
    status: 'assessed',
    manualClosed: false,
    purpose: '掌握柱塞泵故障识别方法',
    resultCheck: '已完成线下考核',
    executionRemark: '缺少学员评价',
    source: '企微执行表导入',
    photos: ['pump-site-1.jpg', 'pump-site-2.jpg', 'pump-site-3.jpg'],
    coursewares: [
      {
        id: 3,
        name: '柱塞泵工作原理.pdf',
        type: 'PDF',
        visibility: 'public',
        knowledgeTags: ['柱塞泵', '故障判断'],
        summary: '解释压力调节、异常噪声和常见故障定位，可作为同类课程的通用知识。',
        url: '/courseware/pump.pdf'
      }
    ],
    assessments: [
      { studentId: 4, score: 88, result: '通过', remark: '回答完整' },
      { studentId: 5, score: 73, result: '通过', remark: '需加强实操' },
      { studentId: 6, score: 58, result: '未通过', remark: '需补考' }
    ],
    evaluations: [
      { type: 'tutor_to_student', studentId: 4, tutorId: 3, rating: 4, comment: '理论理解较好', source: '系统录入' }
    ]
  },
  {
    id: 4,
    sequenceNo: 6,
    studio: 'studio_b',
    studioName: '二号工作室',
    courseName: '铜铬锆合金热处理',
    trainingContent: '热处理窗口、硬度检测与过程记录',
    tutor: '导师D',
    tutorId: 4,
    students: ['学员D', '学员F'],
    studentIds: [4, 6],
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    startTime: '09:00',
    endTime: '11:00',
    durationHours: 2,
    location: '二号工作室',
    status: 'upcoming',
    manualClosed: false,
    purpose: '熟悉热处理关键参数',
    resultCheck: '',
    executionRemark: '',
    source: '系统录入',
    photos: [],
    coursewares: [
      {
        id: 4,
        name: '热处理注意事项.png',
        type: '图片',
        visibility: 'draft',
        knowledgeTags: ['热处理', '过程记录'],
        summary: '待导师确认后公开。',
        url: '/courseware/heat-note.png'
      }
    ],
    assessments: [],
    evaluations: []
  }
]

export const skillAssessmentSchemes = [
  {
    id: 'scheme-valve-basic',
    name: '液压阀基础阶段考试',
    studio: 'studio_a',
    cycle: '2026-06',
    skillName: '液压阀拆解与故障识别',
    relatedTrainingIds: [1, 5, 6, 2],
    assessmentDate: '2026-06-28',
    passLine: 60,
    practicalPassLine: 70,
    requirePracticalPass: true,
    weights: {
      written: 30,
      practical: 60,
      classroom: 10
    },
    dimensions: [
      { key: 'written', label: '笔试', desc: '结构原理、故障判断和安全规范' },
      { key: 'practical', label: '实操', desc: '拆解步骤、工具使用、现场复盘' },
      { key: 'classroom', label: '平时评价', desc: '每节课后导师评价的平均值' }
    ]
  },
  {
    id: 'scheme-pump-basic',
    name: '柱塞泵故障判断阶段考试',
    studio: 'studio_b',
    cycle: '2026-06',
    skillName: '柱塞泵参数判断与异常识别',
    relatedTrainingIds: [3],
    assessmentDate: '2026-06-24',
    passLine: 60,
    practicalPassLine: 65,
    requirePracticalPass: true,
    weights: {
      written: 35,
      practical: 55,
      classroom: 10
    },
    dimensions: [
      { key: 'written', label: '笔试', desc: '原理、参数和故障原因判断' },
      { key: 'practical', label: '实操', desc: '压力调节、异常噪声定位、记录规范' },
      { key: 'classroom', label: '平时评价', desc: '每节课后导师评价的平均值' }
    ]
  }
]

export const stageAssessments = [
  {
    id: 'stage-valve-basic-1',
    schemeId: 'scheme-valve-basic',
    studentId: 1,
    writtenScore: 86,
    practicalScore: 90,
    classroomScore: 100,
    remark: '拆解步骤稳定，能独立说明密封失效风险。'
  },
  {
    id: 'stage-valve-basic-2',
    schemeId: 'scheme-valve-basic',
    studentId: 2,
    writtenScore: 82,
    practicalScore: 76,
    classroomScore: 100,
    remark: '实操达标，故障复盘表达还可继续加强。'
  },
  {
    id: 'stage-valve-basic-3',
    schemeId: 'scheme-valve-basic',
    studentId: 3,
    writtenScore: null,
    practicalScore: null,
    classroomScore: 0,
    remark: '待完成阶段考试。'
  },
  {
    id: 'stage-pump-basic-1',
    schemeId: 'scheme-pump-basic',
    studentId: 4,
    writtenScore: 84,
    practicalScore: 78,
    classroomScore: 80,
    remark: '参数判断通过，现场记录完整。'
  },
  {
    id: 'stage-pump-basic-2',
    schemeId: 'scheme-pump-basic',
    studentId: 5,
    writtenScore: 76,
    practicalScore: 61,
    classroomScore: 0,
    remark: '综合分接近达标，但实操单项未达到配置线。'
  },
  {
    id: 'stage-pump-basic-3',
    schemeId: 'scheme-pump-basic',
    studentId: 6,
    writtenScore: 58,
    practicalScore: 52,
    classroomScore: 0,
    remark: '需补考并安排实操辅导。'
  }
]

export function getStudioName(studioId) {
  return studios.find(studio => studio.id === studioId)?.name || '全部工作室'
}

export function getStatusText(status) {
  return trainingStatuses[status]?.text || status
}

export function getStatusType(status) {
  return trainingStatuses[status]?.type || ''
}

export function hasCompleteAssessments(plan) {
  if (!plan.studentIds.length) return false
  return plan.studentIds.every(studentId => plan.assessments.some(item => item.studentId === studentId))
}

export function hasExecutionMaterials(plan) {
  return plan.photos.length > 0
}

export function hasCompleteStudentTutorEvaluations(plan) {
  if (!plan.studentIds.length) return false
  return plan.studentIds.every(studentId =>
    plan.evaluations.some(item => item.type === 'student_to_tutor' && item.studentId === studentId)
  )
}

export function hasCompleteTutorStudentEvaluations(plan) {
  if (!plan.studentIds.length) return false
  return plan.studentIds.every(studentId =>
    plan.evaluations.some(item => item.type === 'tutor_to_student' && item.studentId === studentId)
  )
}

export function isTrainingAutoClosed(plan) {
  if (!['completed', 'assessed', 'evaluated'].includes(plan.status)) return false
  return hasExecutionMaterials(plan)
    && hasCompleteStudentTutorEvaluations(plan)
    && hasCompleteTutorStudentEvaluations(plan)
}

export function isTrainingClosed(plan) {
  return Boolean(plan.manualClosed) || isTrainingAutoClosed(plan)
}

export function getTrainingDisplayStatus(plan) {
  if (isTrainingClosed(plan)) return plan.manualClosed ? '人工闭环' : '已闭环'
  return getStatusText(plan.status)
}

export function getTrainingDisplayType(plan) {
  if (isTrainingClosed(plan)) return 'success'
  return getStatusType(plan.status)
}

export function ratingToScore(rating) {
  const scoreMap = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 }
  return scoreMap[rating] || 0
}

export function getAssessmentScheme(schemeId) {
  return skillAssessmentSchemes.find(scheme => scheme.id === schemeId)
}

export function getSchemeWeightTotal(scheme) {
  if (!scheme) return 0
  return Object.values(scheme.weights).reduce((sum, value) => sum + value, 0)
}

export function calculateStageFinalScore(record, scheme) {
  if (!record || !scheme) return null
  const scores = {
    written: record.writtenScore,
    practical: record.practicalScore,
    classroom: record.classroomScore
  }
  const hasMissingScore = Object.entries(scheme.weights).some(([key, weight]) =>
    weight > 0 && typeof scores[key] !== 'number'
  )
  if (hasMissingScore) return null

  const total = Object.entries(scheme.weights).reduce((sum, [key, weight]) =>
    sum + scores[key] * (weight / 100), 0
  )
  return Math.round(total)
}

export function getStageAssessmentResult(record, scheme) {
  const finalScore = calculateStageFinalScore(record, scheme)
  if (finalScore === null) return '待考核'
  if (scheme.requirePracticalPass && record.practicalScore < scheme.practicalPassLine) return '实操待补'
  return finalScore >= scheme.passLine ? '通过' : '未通过'
}

export function enrichStageAssessment(record) {
  const scheme = getAssessmentScheme(record.schemeId)
  const finalScore = calculateStageFinalScore(record, scheme)
  return {
    ...record,
    scheme,
    finalScore,
    result: getStageAssessmentResult(record, scheme)
  }
}

export function getStageAssessmentsForStudent(studentId) {
  return stageAssessments
    .filter(record => record.studentId === studentId)
    .map(enrichStageAssessment)
    .sort((a, b) => b.scheme.assessmentDate.localeCompare(a.scheme.assessmentDate))
}

export function getStageAssessmentsForTraining(trainingId, studentId) {
  return stageAssessments
    .map(enrichStageAssessment)
    .filter(record =>
      record.studentId === studentId &&
      record.scheme.relatedTrainingIds.includes(trainingId)
    )
    .sort((a, b) => b.scheme.assessmentDate.localeCompare(a.scheme.assessmentDate))
}

export function getClassroomPerformanceForStudent(studentId) {
  const ratings = trainingPlans.flatMap(plan =>
    plan.evaluations
      .filter(item => item.type === 'tutor_to_student' && item.studentId === studentId)
      .map(item => ({
        ...item,
        courseName: plan.courseName,
        startDate: plan.startDate,
        score: ratingToScore(item.rating)
      }))
  )
  const scores = ratings.map(item => item.score)

  return {
    records: ratings,
    avgScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    count: ratings.length
  }
}

export function getStudentProfileSummary(studentId) {
  const relatedTrainings = trainingPlans
    .filter(plan => plan.studentIds.includes(studentId))
    .map(plan => ({
      ...plan,
      assessment: plan.assessments.find(item => item.studentId === studentId),
      dailyEvaluation: plan.evaluations.find(item => item.type === 'tutor_to_student' && item.studentId === studentId),
      closed: isTrainingClosed(plan)
    }))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
  const scores = relatedTrainings
    .map(plan => plan.assessment?.score)
    .filter(score => typeof score === 'number')
  const classroomPerformance = getClassroomPerformanceForStudent(studentId)
  const stageRecords = getStageAssessmentsForStudent(studentId)
  const latestStageAssessment = stageRecords[0]

  return {
    trainings: relatedTrainings,
    stageAssessments: stageRecords,
    classroomPerformance,
    latestStageAssessment,
    latestTraining: relatedTrainings[0],
    trainingCount: relatedTrainings.length,
    closedCount: relatedTrainings.filter(plan => plan.closed).length,
    avgScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    passCount: scores.filter(score => score >= 60).length,
    stageFinalScore: latestStageAssessment?.finalScore ?? 0,
    practicalScore: latestStageAssessment?.practicalScore ?? 0,
    classroomScore: classroomPerformance.avgScore,
    photos: [...new Set(relatedTrainings.flatMap(plan => plan.photos))]
  }
}

export function getTutorProfileSummary(tutorId) {
  const relatedTrainings = trainingPlans
    .filter(plan => plan.tutorId === tutorId)
    .map(plan => ({
      ...plan,
      closed: isTrainingClosed(plan),
      avgScore: plan.assessments.length
        ? Math.round(plan.assessments.reduce((sum, item) => sum + item.score, 0) / plan.assessments.length)
        : 0
    }))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
  const studentIds = new Set(relatedTrainings.flatMap(plan => plan.studentIds))
  const ratings = relatedTrainings.flatMap(plan =>
    plan.evaluations
      .filter(item => item.type === 'student_to_tutor')
      .map(item => item.rating)
  )

  return {
    trainings: relatedTrainings,
    latestTraining: relatedTrainings[0],
    trainingCount: relatedTrainings.length,
    closedCount: relatedTrainings.filter(plan => plan.closed).length,
    studentCount: studentIds.size,
    avgRating: ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)) : 0,
    ratingCount: ratings.length,
    coursewares: [...new Map(relatedTrainings
      .flatMap(plan => plan.coursewares.map(file => [file.name, file]))
    ).values()]
  }
}

export function getUserTrainings(userId, role) {
  return trainingPlans.filter(plan => {
    if (role === 'student') return plan.studentIds.includes(userId)
    if (role === 'tutor') return plan.tutorId === userId
    return false
  })
}

export function getTrainingGaps(plan) {
  if (isTrainingClosed(plan)) return []
  const gaps = []
  const executed = ['completed', 'assessed', 'evaluated'].includes(plan.status)
  const assessmentStage = ['completed', 'assessed', 'evaluated'].includes(plan.status)
  if (executed && !hasExecutionMaterials(plan)) gaps.push('缺执行资料')
  if (assessmentStage && !hasCompleteStudentTutorEvaluations(plan)) gaps.push('缺学员评价')
  if (assessmentStage && !hasCompleteTutorStudentEvaluations(plan)) gaps.push('缺平时评价')
  return gaps
}

export function getKnowledgeResources(plans = trainingPlans, visibility = 'public') {
  return plans.flatMap(plan => plan.coursewares
    .filter(file => !visibility || file.visibility === visibility)
    .map(file => ({
      ...file,
      trainingId: plan.id,
      courseName: plan.courseName,
      trainingContent: plan.trainingContent,
      tutor: plan.tutor,
      studioName: plan.studioName,
      startDate: plan.startDate,
      studentCount: plan.students.length
    })))
}

export function hasStudentTutorEvaluation(plan) {
  return plan.evaluations.some(item => item.type === 'student_to_tutor')
}

export function hasTutorStudentEvaluation(plan) {
  return plan.evaluations.some(item => item.type === 'tutor_to_student')
}

export function getTodoItems(plans = trainingPlans) {
  return plans.flatMap(plan => getTrainingGaps(plan).map(gap => ({
    id: `${plan.id}-${gap}`,
    studio: plan.studio,
    studioName: plan.studioName,
    trainingId: plan.id,
    title: gap,
    courseName: plan.courseName,
    date: plan.startDate,
    owner: gap.includes('导师') ? plan.tutor : '台账用户'
  })))
}

export function getDashboardStats(plans = trainingPlans) {
  const completed = plans.filter(plan => isTrainingClosed(plan))
  const assessed = plans.filter(plan => ['assessed', 'evaluated'].includes(plan.status))
  const relatedTrainingIds = new Set(plans.map(plan => plan.id))
  const relatedStageRecords = stageAssessments
    .map(enrichStageAssessment)
    .filter(record => record.scheme.relatedTrainingIds.some(id => relatedTrainingIds.has(id)))
  const stageScores = relatedStageRecords
    .map(record => record.finalScore)
    .filter(score => typeof score === 'number')
  const courseScores = plans.flatMap(plan => plan.assessments.map(item => item.score))
  const scores = stageScores.length ? stageScores : courseScores
  const ratings = plans.flatMap(plan => plan.evaluations.filter(item => item.type === 'student_to_tutor').map(item => item.rating))
  const dailyScores = plans.flatMap(plan =>
    plan.evaluations
      .filter(item => item.type === 'tutor_to_student')
      .map(item => ratingToScore(item.rating))
  )
  const passCount = stageScores.length
    ? relatedStageRecords.filter(item => item.result === '通过').length
    : plans.flatMap(plan => plan.assessments).filter(item => item.score >= 60).length
  const todoCount = getTodoItems(plans).length

  return {
    totalTraining: plans.length,
    completedTraining: completed.length,
    completionRate: plans.length ? Math.round((completed.length / plans.length) * 100) : 0,
    assessedTraining: assessed.length,
    passCount,
    avgScore: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
    avgRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0,
    dailyAvgScore: dailyScores.length ? dailyScores.reduce((sum, score) => sum + score, 0) / dailyScores.length : 0,
    dailyEvaluationCount: dailyScores.length,
    todoCount
  }
}

export function getStudioStats() {
  return studios.map(studio => ({
    ...studio,
    ...getDashboardStats(trainingPlans.filter(plan => plan.studio === studio.id))
  }))
}

export function getTutorRankings() {
  return tutors.map(tutor => {
    const ratings = trainingPlans.flatMap(plan =>
      plan.evaluations
        .filter(item => item.type === 'student_to_tutor' && item.tutorId === tutor.id)
        .map(item => item.rating)
    )
    return {
      ...tutor,
      trainingCount: trainingPlans.filter(plan => plan.tutorId === tutor.id).length,
      rating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0,
      ratingCount: ratings.length
    }
  }).sort((a, b) => b.rating - a.rating)
}

export function getAssessmentDistribution(plans = trainingPlans) {
  const relatedTrainingIds = new Set(plans.map(plan => plan.id))
  const stageScores = stageAssessments
    .map(enrichStageAssessment)
    .filter(record => record.scheme.relatedTrainingIds.some(id => relatedTrainingIds.has(id)))
    .map(record => record.finalScore)
    .filter(score => typeof score === 'number')
  const scores = stageScores.length ? stageScores : plans.flatMap(plan => plan.assessments.map(item => item.score))
  const buckets = [
    { label: '优秀(90+)', min: 90, max: 100, color: '#67c23a' },
    { label: '良好(80-89)', min: 80, max: 89, color: '#409eff' },
    { label: '合格(60-79)', min: 60, max: 79, color: '#e6a23c' },
    { label: '不合格(<60)', min: 0, max: 59, color: '#f56c6c' }
  ]

  return buckets.map(bucket => {
    const count = scores.filter(score => score >= bucket.min && score <= bucket.max).length
    return {
      ...bucket,
      count,
      percent: scores.length ? Math.round((count / scores.length) * 100) : 0
    }
  })
}

export function getMonthlyCompletionTrend() {
  return [
    { month: '4月', rate: 78 },
    { month: '5月', rate: 84 },
    { month: '6月', rate: getDashboardStats().completionRate }
  ]
}
