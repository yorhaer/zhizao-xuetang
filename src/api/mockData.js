// Mock data for the training ledger prototype.

export const studios = [
  { id: 'studio_a', name: '一号工作室', shortName: '导师A' },
  { id: 'studio_b', name: '二号工作室', shortName: '导师C' }
]

export const trainingStatuses = {
  upcoming: { text: '未开始', type: 'info', order: 1 },
  completed: { text: '已完成', type: 'success', order: 2 },
  assessed: { text: '已考核', type: 'warning', order: 3 },
  evaluated: { text: '已评价', type: '', order: 4 }
}

export const tutors = [
  { id: 1, name: '导师A', studio: 'studio_a', company: '工匠工作室', phone: '13000000001' },
  { id: 2, name: '导师B', studio: 'studio_a', company: '工匠工作室', phone: '13000000002' },
  { id: 3, name: '导师C', studio: 'studio_b', company: '工匠工作室', phone: '13000000003' },
  { id: 4, name: '导师D', studio: 'studio_b', company: '工匠工作室', phone: '13000000004' }
]

export const students = [
  { id: 1, name: '学员A', studio: 'studio_a', company: '企业A', phone: '13100000001' },
  { id: 2, name: '学员B', studio: 'studio_a', company: '企业B', phone: '13100000002' },
  { id: 3, name: '学员C', studio: 'studio_a', company: '企业A', phone: '13100000003' },
  { id: 4, name: '学员D', studio: 'studio_b', company: '企业C', phone: '13100000004' },
  { id: 5, name: '学员E', studio: 'studio_b', company: '企业B', phone: '13100000005' },
  { id: 6, name: '学员F', studio: 'studio_b', company: '企业C', phone: '13100000006' }
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
    students: ['学员A', '学员B', '学员C'],
    studentIds: [1, 2, 3],
    startDate: '2026-06-08',
    endDate: '2026-06-08',
    startTime: '09:30',
    endTime: '11:30',
    durationHours: 2,
    location: '一号工作室',
    status: 'evaluated',
    purpose: '掌握液压阀基础结构，能独立识别主要部件',
    resultCheck: '现场提问与拆解演示均通过',
    executionRemark: '学员C实操动作需继续巩固',
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
      { studentId: 1, score: 85, result: '通过', remark: '结构识别准确' },
      { studentId: 2, score: 92, result: '通过', remark: '实操熟练' },
      { studentId: 3, score: 78, result: '通过', remark: '理论需巩固' }
    ],
    evaluations: [
      { type: 'student_to_tutor', studentId: 1, tutorId: 1, rating: 5, comment: '讲解清晰，实操时间充足', source: '企微导入' },
      { type: 'student_to_tutor', studentId: 2, tutorId: 1, rating: 4, comment: '内容很多，希望节奏慢一点', source: '系统录入' },
      { type: 'tutor_to_student', studentId: 1, tutorId: 1, rating: 5, comment: '实操掌握快', source: '系统录入' }
    ]
  },
  {
    id: 2,
    sequenceNo: 2,
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
    purpose: '能判断常见密封失效原因',
    resultCheck: '',
    executionRemark: '已完成培训，待录入考核',
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
    sequenceNo: 3,
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
    sequenceNo: 4,
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

export function getStudioName(studioId) {
  return studios.find(studio => studio.id === studioId)?.name || '全部工作室'
}

export function getStatusText(status) {
  return trainingStatuses[status]?.text || status
}

export function getStatusType(status) {
  return trainingStatuses[status]?.type || ''
}

export function ratingToScore(rating) {
  const scoreMap = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 }
  return scoreMap[rating] || 0
}

export function getUserTrainings(userId, role) {
  return trainingPlans.filter(plan => {
    if (role === 'student') return plan.studentIds.includes(userId)
    if (role === 'tutor') return plan.tutorId === userId
    return false
  })
}

export function getTrainingGaps(plan) {
  const gaps = []
  if (plan.status === 'completed' && plan.assessments.length === 0) gaps.push('待录考核')
  if (['completed', 'assessed'].includes(plan.status) && plan.photos.length === 0) gaps.push('缺现场照片')
  if (plan.coursewares.length === 0) gaps.push('缺课卷')
  if (['completed', 'assessed'].includes(plan.status) && !hasStudentTutorEvaluation(plan)) gaps.push('缺学员评价')
  if (['completed', 'assessed'].includes(plan.status) && !hasTutorStudentEvaluation(plan)) gaps.push('缺导师评价')
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
    owner: gap.includes('课卷') || gap.includes('导师') ? plan.tutor : '台账用户'
  })))
}

export function getDashboardStats(plans = trainingPlans) {
  const completed = plans.filter(plan => ['completed', 'assessed', 'evaluated'].includes(plan.status))
  const assessed = plans.filter(plan => ['assessed', 'evaluated'].includes(plan.status))
  const scores = plans.flatMap(plan => plan.assessments.map(item => item.score))
  const ratings = plans.flatMap(plan => plan.evaluations.filter(item => item.type === 'student_to_tutor').map(item => item.rating))
  const passCount = plans.flatMap(plan => plan.assessments).filter(item => item.score >= 60).length
  const todoCount = getTodoItems(plans).length

  return {
    totalTraining: plans.length,
    completedTraining: completed.length,
    completionRate: plans.length ? Math.round((completed.length / plans.length) * 100) : 0,
    assessedTraining: assessed.length,
    passCount,
    avgScore: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
    avgRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0,
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
  const scores = plans.flatMap(plan => plan.assessments.map(item => item.score))
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
