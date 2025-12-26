import { useEffect, useMemo, useState } from 'react'
import './App.css'

type QuestionId = 'sweet_spending' | 'stress_eating' | 'late_night' | 'exercise' | 'sleep' | 'palm_reading' | 'bad_signs'

type ShareOptions = {
  title: string
  text: string
  url: string
}

type Question = {
  id: QuestionId
  prompt: string
  helper: string
  type: 'likert' | 'chips' | 'checklist'
  options?: string[]
  icon?: string
  image?: string
  category?: string
}

type Feedback = {
  headline: string
  detail: string
  advice: string
  destiny: 'heaven' | 'hell' | 'middle'
}

type Answers = Partial<Record<QuestionId, string | string[]>>

const QUESTIONS: Question[] = [
  {
    id: 'sweet_spending',
    prompt: 'ในแต่ละสัปดาห์ ท่านหมดเงินไปกับการบูชา "เทพเจ้าของหวาน" (ชานม, ขนมเค้ก, น้ำหวาน) มากเพียงใด?',
    helper: 'เลือกระดับการถวายทรัพย์สิน (๑ = น้อยที่สุด, ๖ = มากที่สุดจนกระเป๋าฉีก)',
    type: 'likert',
    icon: 'local_cafe',
    image: 'https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=400',
  },
  {
    id: 'stress_eating',
    prompt: 'เมื่อท่านรู้สึกเครียด ท่านมักจะ "แก้กรรม" ด้วยการเสพความหวาน บ่อยครั้งเพียงใด?',
    helper: 'ระดับความถี่ในการแก้กรรม (๑ = นั่งสมาธิ, ๖ = กินล้างผลาญ)',
    type: 'likert',
    icon: 'psychology',
    image: 'https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=400',
  },
  {
    id: 'late_night',
    prompt: 'ท่านมักจะกินอาหารมื้อสุดท้ายของวันในช่วงเวลาใด?',
    helper: 'เลือกช่วงเวลาที่ตรงกับพฤติกรรมของท่าน',
    type: 'chips',
    options: ['ก่อน 18:00 น.', '18:00-20:00 น.', '20:00-22:00 น.', 'หลัง 22:00 น.', 'ไม่แน่นอน'],
    icon: 'bedtime',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  },
  {
    id: 'exercise',
    prompt: 'ในหนึ่งสัปดาห์ ท่านออกกำลังกายหรือเคลื่อนไหวร่างกายกี่วัน?',
    helper: 'เลือกจำนวนวันที่ออกกำลังกายอย่างน้อย 30 นาที',
    type: 'chips',
    options: ['ไม่เคย', '1-2 วัน', '3-4 วัน', '5-6 วัน', 'ทุกวัน'],
    icon: 'fitness_center',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
  },
  {
    id: 'sleep',
    prompt: 'โดยเฉลี่ยแล้ว ท่านนอนหลับกี่ชั่วโมงต่อคืน?',
    helper: 'นับเฉพาะชั่วโมงที่หลับจริง ไม่รวมเวลานอนแต่ยังไม่หลับ',
    type: 'chips',
    options: ['น้อยกว่า 5 ชม.', '5-6 ชม.', '6-7 ชม.', '7-8 ชม.', 'มากกว่า 8 ชม.'],
    icon: 'hotel',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
  },
  {
    id: 'palm_reading',
    prompt: 'ดวงสายมือแม่นๆ - เลือกข้อความที่ตรงกับตัวคุณ',
    helper: 'เลือกได้มากกว่า 1 ข้อ (เลือกตามความจริงใจ)',
    type: 'checklist',
    category: 'HEAD - เส้นสมอง (เดียว)',
    options: [
      'มีส คิดก่อนทำ',
      'รู้จักและจัดการอารมณ์ได้',
      'รู้จัดข้อเสียของตนเอง',
      'ยอมรับคำวิจารณ์ได้',
      'มีเป้าหมายชีวิตชัดเจน'
    ],
    icon: 'front_hand',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400',
  },
  {
    id: 'bad_signs',
    prompt: 'ลางร้าย ทักครับ - ลางร้ายแบบไหนเคยมาทักขายบ้าง',
    helper: 'เลือกได้มากกว่า 1 ข้อ (ยิ่งเลือกน้อย ยิ่งดี)',
    type: 'checklist',
    category: 'PART 4 | ชิงดวง',
    options: [
      'ช่วงนี้รู้สึกเบื่อหมดอำนาจกับทุกเรื่อง',
      'อันตรายไร ไม่เคยคุดให้คนใดบ้าง ทางบ้านของคุณ',
      'อันข่วขอดอไขคนขนพามทางเจ้า',
      'ผ่านงานแล้วเต้นอยู่เหมือน ไม่ผ่ายแต่เนียอนดิด',
      'ห่วงปี่นเก่า เลียนชายกงชี ทำบนพันครั้ง แตระมนึก',
      'เซซาตะจีนที่เรือง',
      'เรื้อเล่าตนักขวอกงขวามปีวงมีเลืองมีเสือง'
    ],
    icon: 'warning',
    image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400',
  },
]

const STORAGE_KEY = 'muketing-destiny-answers'

const loadAnswers = (): Answers => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Answers
  } catch (error) {
    console.error('Failed to parse stored answers', error)
    return {}
  }
}

const getInitialIndex = (answers: Answers) => {
  const firstUnanswered = QUESTIONS.findIndex((item) => !answers[item.id])
  return firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered
}

const createFeedback = (questionId: QuestionId, value: string): Feedback => {
  switch (questionId) {
    case 'sweet_spending': {
      const level = Number(value)
      if (level >= 5) {
        return {
          headline: 'ดวงเกื้อหนุนหรือบุญหวานน้อย',
          detail: 'ท่านกำลังถวายทรัพย์สินให้กับเทพเจ้าของหวานมากเกินไป! กระเป๋าเงินร้องไห้ และดวงชะตาทรัพย์กำลังหนีห่างไป',
          advice: 'ลดการบูชาเทพหวานลง แล้วท่านจะพบว่าทรัพย์สินเริ่มสะสม และดวงชะตาเริ่มเปลี่ยนแปลง',
          destiny: 'hell'
        }
      } else if (level >= 3) {
        return {
          headline: 'ดวงปานกลาง ระวังพลาด',
          detail: 'ท่านยังพอควบคุมได้ แต่ต้องระวังอย่าให้ความหวานกลายเป็นกรรมที่ทำลายทรัพย์สิน',
          advice: 'ตั้งงบประมาณชัดเจน และยึดมั่นในวินัยทางการเงิน',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'ดวงเกื้อหนุน บุญสมบูรณ์',
          detail: 'ท่านมีวินัยในการควบคุมการใช้จ่าย ดวงชะตาทรัพย์กำลังส่องสว่าง!',
          advice: 'รักษาวินัยนี้ไว้ แล้วทรัพย์สินจะเติบโตอย่างมั่นคง',
          destiny: 'heaven'
        }
      }
    }
    case 'stress_eating': {
      const level = Number(value)
      if (level >= 5) {
        return {
          headline: 'เคราะห์มันเยิ้ม ขวางทางรวย',
          detail: 'เมื่อเครียดแล้วหันไปพึ่งความหวาน นี่คือวงจรกรรมที่ทำให้ทั้งสุขภาพและทรัพย์สินเสื่อมทราม',
          advice: 'เรียนรู้การจัดการความเครียดด้วยวิธีอื่น เช่น สมาธิ ออกกำลังกาย หรือพูดคุยกับคนใกล้ชิด',
          destiny: 'hell'
        }
      } else if (level >= 3) {
        return {
          headline: 'ระวัง! กรรมกำลังสะสม',
          detail: 'ท่านยังใช้ความหวานเป็นที่พึ่งในยามเครียดอยู่บ้าง ระวังอย่าให้กลายเป็นนิสัย',
          advice: 'หาวิธีจัดการความเครียดที่ดีกว่า และลดการพึ่งพาความหวาน',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'ควบคุมจิตใจได้ดี',
          detail: 'ท่านไม่ใช้ความหวานเป็นที่พึ่งในยามเครียด แสดงว่ามีวิธีจัดการอารมณ์ที่ดี',
          advice: 'รักษาความสมดุลทางจิตใจนี้ไว้ จะทำให้ชีวิตราบรื่น',
          destiny: 'heaven'
        }
      }
    }
    case 'late_night': {
      if (value.includes('22:00') || value === 'ไม่แน่นอน') {
        return {
          headline: 'ดวงเค็มปี๋ ทรัพย์หนีหาย',
          detail: 'กินดึกคือการเชิญเคราะห์เข้าบ้าน! ทั้งสุขภาพและดวงชะตาทรัพย์จะเสื่อมลง',
          advice: 'ปรับเวลากินให้เร็วขึ้น ควรกินมื้อสุดท้ายก่อน 20:00 น. เพื่อให้ร่างกายพักผ่อนได้เต็มที่',
          destiny: 'hell'
        }
      } else if (value.includes('20:00')) {
        return {
          headline: 'พอใช้ได้ แต่ยังปรับปรุงได้',
          detail: 'เวลากินค่อนข้างดึก อาจส่งผลต่อคุณภาพการนอนและการเผาผลาญ',
          advice: 'พยายามกินให้เร็วขึ้นเป็น 18:00-19:00 น. จะดียิ่งขึ้น',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'ดวงดี มีวินัย',
          detail: 'ท่านกินในเวลาที่เหมาะสม ส่งผลดีต่อทั้งสุขภาพและการนอนหลับ',
          advice: 'รักษาเวลาการกินนี้ไว้ เป็นพื้นฐานสำคัญของสุขภาพที่ดี',
          destiny: 'heaven'
        }
      }
    }
    case 'exercise': {
      if (value === 'ไม่เคย' || value === '1-2 วัน') {
        return {
          headline: 'ลางร้ายทักครับ',
          detail: 'ร่างกายที่ไม่เคลื่อนไหวคือร่างกายที่เชิญโรคภัยเข้ามา ดวงชะตาสุขภาพกำลังตกต่ำ',
          advice: 'เริ่มต้นด้วยการเดินเพียง 15 นาทีต่อวัน แล้วค่อยเพิ่มขึ้นเป็นลำดับ',
          destiny: 'hell'
        }
      } else if (value === '3-4 วัน') {
        return {
          headline: 'ดีแล้ว แต่ยังพอดีกว่า',
          detail: 'ท่านออกกำลังกายพอสมควร แต่ยังน้อยไปสักหน่อยสำหรับสุขภาพที่สมบูรณ์',
          advice: 'พยายามเพิ่มเป็น 5-6 วันต่อสัปดาห์ เพื่อผลลัพธ์ที่ดีขึ้น',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'ดวงเจริญรุ่งเรือง',
          detail: 'ท่านออกกำลังกายสม่ำเสมอ นี่คือพื้นฐานของชีวิตที่มีพลังและสุขภาพดี',
          advice: 'รักษาความสม่ำเสมอนี้ไว้ คุณกำลังสร้างรากฐานสุขภาพที่แข็งแรง',
          destiny: 'heaven'
        }
      }
    }
    case 'sleep': {
      if (value.includes('น้อยกว่า 5') || value === '5-6 ชม.') {
        return {
          headline: 'แก้เคล็ดสุขภาพสู่ดวงเศรษฐี',
          detail: 'การนอนน้อยคือการทำลายตัวเองทีละน้อย ทั้งสุขภาพ สมองและดวงชะตาจะเสื่อมลง',
          advice: 'พยายามนอนให้ได้ 7-8 ชั่วโมงต่อคืน เริ่มจากการเข้านอนเร็วขึ้น 30 นาที',
          destiny: 'hell'
        }
      } else if (value === '6-7 ชม.' || value === 'มากกว่า 8 ชม.') {
        return {
          headline: 'พอใช้ได้',
          detail: 'ท่านนอนพอสมควร แต่ยังไม่ได้อยู่ในจุดที่สมบูรณ์แบบ',
          advice: 'พยายามนอนให้ได้ 7-8 ชั่วโมงเต็มทุกคืน เพื่อสุขภาพที่ดีที่สุด',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'การพักผ่อนที่สมบูรณ์',
          detail: 'ท่านนอนหลับในจำนวนที่เหมาะสม นี่คือรากฐานของสุขภาพและความสำเร็จในชีวิต',
          advice: 'รักษาคุณภาพการนอนนี้ไว้ นี่คือการลงทุนที่ดีที่สุดสำหรับชีวิต',
          destiny: 'heaven'
        }
      }
    }
    case 'palm_reading': {
      const selected = value.split(',').filter(v => v.trim() !== '')
      const count = selected.length
      
      if (count >= 4) {
        return {
          headline: 'ดวงสายมือดีเด่น - เส้นสมองชัดเจน',
          detail: 'ท่านมีคุณสมบัติที่ดีหลายด้าน แสดงว่ามีสติปัญญาและความมั่นคงในชีวิต เส้นชีวิตของท่านแข็งแรง',
          advice: 'รักษาความมั่นใจและวิสัยทัศน์นี้ไว้ ใช้จุดแข็งเหล่านี้พัฒนาตนเองต่อไป',
          destiny: 'heaven'
        }
      } else if (count >= 2) {
        return {
          headline: 'ดวงสายมือปานกลาง - มีพัฒนาการที่ดี',
          detail: 'ท่านมีคุณสมบัติบางอย่างที่โดดเด่น แต่ยังมีส่วนที่ต้องพัฒนาอีก',
          advice: 'โฟกัสพัฒนาจุดแข็งที่มี และค่อยๆ ฝึกฝนในส่วนที่ยังขาด',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'ดวงสายมือยังต้องพัฒนา',
          detail: 'ท่านยังมีพื้นที่ในการพัฒนาตนเองอีกมาก อย่าท้อแท้ ทุกคนสามารถสร้างและพัฒนาตนเองได้',
          advice: 'เริ่มฝึกฝนทีละเล็กทีละน้อย โดยเฉพาะการมีสติและคิดก่อนทำ',
          destiny: 'middle'
        }
      }
    }
    case 'bad_signs': {
      const selected = value.split(',').filter(v => v.trim() !== '')
      const count = selected.length
      
      if (count >= 5) {
        return {
          headline: 'ลางร้ายทักครับ! - สัญญาณเตือนเยอะ',
          detail: 'ท่านมีอาการเตือนหลายข้อที่บ่งบอกว่าสุขภาพกำลังส่งสัญญาณ SOS นี่คือเวลาที่ต้องหยุดและดูแลตัวเองจริงจัง!',
          advice: 'ปรึกษาแพทย์หรือผู้เชี่ยวชาญด้านสุขภาพทันที อย่ารอจนอาการแย่ลง เริ่มเปลี่ยนแปลงพฤติกรรมตั้งแต่วันนี้',
          destiny: 'hell'
        }
      } else if (count >= 3) {
        return {
          headline: 'เริ่มมีลางไม่ดี - ควรระวัง',
          detail: 'ท่านมีอาการเตือนหลายข้อ ร่างกายกำลังส่งสัญญาณว่าต้องการการดูแลมากขึ้น อย่าละเลย!',
          advice: 'เริ่มปรับเปลี่ยนพฤติกรรมในด้านที่เป็นปัญหา และสังเกตอาการอย่างใกล้ชิด หากไม่ดีขึ้นควรพบแพทย์',
          destiny: 'middle'
        }
      } else if (count >= 1) {
        return {
          headline: 'มีอาการเตือนเล็กน้อย',
          detail: 'ท่านมีอาการบางอย่างที่ควรสังเกต แต่ยังไม่ร้ายแรง เป็นโอกาสดีที่จะเริ่มดูแลตัวเอง',
          advice: 'ดูแลสุขภาพให้ดีขึ้น พักผ่อนให้เพียงพอ และออกกำลังกายสม่ำเสมอ',
          destiny: 'middle'
        }
      } else {
        return {
          headline: 'ไม่มีลางร้าย - สุขภาพดี',
          detail: 'ยินดีด้วย! ท่านไม่มีอาการเตือนใดๆ แสดงว่าสุขภาพกำลังดีอยู่',
          advice: 'รักษาสุขภาพที่ดีนี้ไว้ ดูแลตัวเองต่อไปอย่างสม่ำเสมอ',
          destiny: 'heaven'
        }
      }
    }
    default:
      return {
        headline: 'ขอบคุณที่แชร์',
        detail: 'ข้อมูลของคุณช่วยให้เราปรับคำแนะนำให้ตรงใจมากขึ้น',
        advice: 'ตอบข้อถัดไปเพื่อดูแผนเฉพาะตัวของคุณ',
        destiny: 'middle'
      }
  }
}

const getDestinyScore = (answers: Answers): { score: number; level: string; color: string } => {
  let score = 0
  let total = 0

  Object.entries(answers).forEach(([key, value]) => {
    if (!value) return
    total++

    switch (key) {
      case 'sweet_spending':
      case 'stress_eating':
        score += Math.max(0, 6 - Number(value))
        break
      case 'late_night':
        if (typeof value === 'string') {
          if (value.includes('ก่อน 18')) score += 5
          else if (value.includes('18:00-20:00')) score += 4
          else if (value.includes('20:00-22:00')) score += 2
          else score += 0
        }
        break
      case 'exercise':
        if (value === 'ทุกวัน') score += 5
        else if (value === '5-6 วัน') score += 4
        else if (value === '3-4 วัน') score += 3
        else if (value === '1-2 วัน') score += 1
        break
      case 'sleep':
        if (value === '7-8 ชม.') score += 5
        else if (value === '6-7 ชม.') score += 3
        else if (value === 'มากกว่า 8 ชม.') score += 3
        else score += 1
        break
      case 'palm_reading':
        if (Array.isArray(value)) {
          const count = value.length
          if (count >= 4) score += 5
          else if (count >= 3) score += 4
          else if (count >= 2) score += 3
          else score += 1
        }
        break
      case 'bad_signs':
        if (Array.isArray(value)) {
          const count = value.length
          // ยิ่งมีอาการเตือนมาก ยิ่งได้คะแนนน้อย (เพราะเป็นลางร้าย)
          if (count === 0) score += 5
          else if (count <= 2) score += 3
          else if (count <= 4) score += 2
          else score += 0
        }
        break
    }
  })

  const percentage = total > 0 ? Math.round((score / (total * 5)) * 100) : 0

  if (percentage >= 70) {
    return { score: percentage, level: 'ดวงเศรษฐี บุญสมบูรณ์', color: '#C5A059' }
  } else if (percentage >= 40) {
    return { score: percentage, level: 'ดวงปานกลาง ระวังพลาด', color: '#F9E79F' }
  } else {
    return { score: percentage, level: 'ดวงตก ลางร้าย', color: '#d41132' }
  }
}

const App = () => {
  const [answers, setAnswers] = useState<Answers>(loadAnswers)
  const [currentIndex, setCurrentIndex] = useState(() => getInitialIndex(loadAnswers()))
  const [showSummary, setShowSummary] = useState(false)
  const [coachNote, setCoachNote] = useState<Feedback>(() => ({
    headline: 'เริ่มเปิดดวงชะตาเศรษฐี',
    detail: 'ตอบคำถามทั้งหมด 5 ข้อ เพื่อเช็กพลังโชคลาภผ่านพฤติกรรมการกิน',
    advice: 'ใช้เวลาคิดสั้น ๆ แล้วเลือกคำตอบที่ตรงใจที่สุด',
    destiny: 'middle'
  }))

  const currentQuestion = QUESTIONS[currentIndex]

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const completedCount = useMemo(
    () => QUESTIONS.filter((item) => {
      const answer = answers[item.id]
      if (Array.isArray(answer)) {
        return answer.length > 0
      }
      return answer?.trim()
    }).length,
    [answers],
  )

  const progress = Math.round((completedCount / QUESTIONS.length) * 100)
  const destinyScore = useMemo(() => getDestinyScore(answers), [answers])

  const moveToNext = (updated: Answers) => {
    const nextIndex = QUESTIONS.findIndex((item) => !updated[item.id])
    if (nextIndex === -1) {
      // All questions answered, show summary
      setShowSummary(true)
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  const handleAnswer = (value: string) => {
    const trimmed = value.trim()
    const updatedAnswers = { ...answers, [currentQuestion.id]: trimmed }
    setAnswers(updatedAnswers)
    setCoachNote(createFeedback(currentQuestion.id, trimmed))
    moveToNext(updatedAnswers)
  }

  const handleBack = () => {
    const prevIndex = Math.max(0, currentIndex - 1)
    setCurrentIndex(prevIndex)
  }

  const reset = () => {
    setAnswers({})
    setCoachNote({
      headline: 'เริ่มต้นใหม่อีกครั้ง',
      detail: 'ล้างคำตอบแล้ว พร้อมเปิดดวงชะตาใหม่',
      advice: 'เริ่มจากข้อที่ 1 แล้วตอบตามความจริงใจ',
      destiny: 'middle'
    })
    setCurrentIndex(0)
    setShowSummary(false)
  }

  // Share Functions
  const getShareData = (): ShareOptions => {
    const url = window.location.href
    const title = 'เปิดดวงชะตาเศรษฐี - มูเตลู อีทติ้ง'
    const text = `ฉันได้ ${destinyScore.level} (${destinyScore.score} คะแนน) 🎯\nมาลองเปิดดวงชะตาของคุณกันเถอะ!`
    return { title, text, url }
  }

  const handleNativeShare = async () => {
    const shareData = getShareData()
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      alert('คัดลอกลิงก์แล้ว! 📋')
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('คัดลอกลิงก์แล้ว! 📋')
    }
  }

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
  }

  const handleShareTwitter = () => {
    const shareData = getShareData()
    const url = encodeURIComponent(shareData.url)
    const text = encodeURIComponent(shareData.text)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
  }

  const handleShareLine = () => {
    const shareData = getShareData()
    const url = encodeURIComponent(shareData.url)
    const text = encodeURIComponent(shareData.text)
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
  }

  // If all questions answered and showSummary is true, show summary page
  if (showSummary && completedCount === QUESTIONS.length) {
    return (
      <div className="page dark summary-page">
        {/* Header */}
        <header className="navbar">
          <div className="navbar-content">
            <div className="navbar-brand">
              <span className="material-symbols-outlined navbar-icon">temple_buddhist</span>
              <h2 className="navbar-title">มูเตลู อีทติ้ง</h2>
            </div>
            <div className="navbar-menu">
              <a href="#" className="navbar-link">หน้าแรก</a>
              <a href="#" className="navbar-link">ทำนายดวง</a>
              <a href="#" className="navbar-link">บทความมูเตลู</a>
              <button className="navbar-button">เข้าสู่ระบบ</button>
            </div>
          </div>
        </header>

        {/* Summary Content */}
        <main className="summary-content">
          <div className="summary-scroll">
            <div className="summary-badge">วิถีดวงผลทาน กับ สีสี่ส</div>
            
            {/* Destiny Wheel */}
            <div className="destiny-wheel-container">
              <div className="destiny-wheel">
                <div className="wheel-inner">
                  <div className="wheel-segments">
                    <div className="segment segment-1"></div>
                    <div className="segment segment-2"></div>
                    <div className="segment segment-3"></div>
                    <div className="segment segment-4"></div>
                  </div>
                  <div className="wheel-center">
                    <div className="wheel-score" style={{ color: destinyScore.color }}>
                      ดวงดี {destinyScore.score}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative stars */}
              <div className="star star-1">✦</div>
              <div className="star star-2">✦</div>
              <div className="star star-3">✦</div>
              <div className="star star-4">✦</div>
              <div className="star star-5">✦</div>
              <div className="star star-6">✦</div>
              <div className="star star-7">✦</div>
              <div className="star star-8">✦</div>
            </div>

            {/* Summary Text */}
            <div className="summary-results">
              <h2 className="summary-title">{destinyScore.level}</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-icon">💪</span>
                  <p>โภชนาการดี ลงๆ {answers.sweet_spending && Number(answers.sweet_spending) <= 2 ? '✓' : '✗'}</p>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">🧠</span>
                  <p>เพราะสุขภาพทางจิต กลฉุด {answers.stress_eating && Number(answers.stress_eating) <= 3 ? '✓' : '✗'}</p>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">🍽️</span>
                  <p>โอเค่ๆก่อนบ้านง่วง {answers.late_night && !answers.late_night.includes('22:00') ? '✓' : '✗'}</p>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">🏃</span>
                  <p>อยากคล้ายโคตึด หายคุณอุดรฉีว {answers.exercise && answers.exercise !== 'ไม่เคย' ? '✓' : '✗'}</p>
                </div>
              </div>

              <div className="summary-message">
                <p className="summary-tagline">
                  ดวงดีสร้างได้ แค่คุณนี่ 'สุข' ให้ครบทุกด้าน
                </p>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="cta-buttons">
              <button className="cta-primary" onClick={() => {
                alert('เริ่มต้นการเปลี่ยนแปลงของคุณ! 🎯')
              }}>
                <span className="cta-icon">🚀</span>
                เริ่มก้าวแรกเพื่อตัวเอง
              </button>
              <button className="cta-secondary" onClick={() => {
                alert('เรียนรู้เพิ่มเติมเกี่ยวกับการดูแลสุขภาพ 📚')
              }}>
                <span className="cta-icon">📖</span>
                ศึกษาวิธีการเปลี่ยนแปลง
              </button>
            </div>

            {/* Share Section */}
            <div className="share-section">
              <h3 className="share-title">แชร์ผลลัพธ์ของคุณ</h3>
              <div className="share-buttons">
                <button className="share-btn share-native" onClick={handleNativeShare} title="แชร์">
                  <span className="material-symbols-outlined">share</span>
                  <span>แชร์</span>
                </button>
                <button className="share-btn share-copy" onClick={handleCopyLink} title="คัดลอกลิงก์">
                  <span className="material-symbols-outlined">link</span>
                  <span>คัดลอก</span>
                </button>
                <button className="share-btn share-facebook" onClick={handleShareFacebook} title="แชร์บน Facebook">
                  <span className="share-icon">f</span>
                  <span>Facebook</span>
                </button>
                <button className="share-btn share-twitter" onClick={handleShareTwitter} title="แชร์บน X (Twitter)">
                  <span className="share-icon">𝕏</span>
                  <span>Twitter</span>
                </button>
                <button className="share-btn share-line" onClick={handleShareLine} title="แชร์บน LINE">
                  <span className="share-icon">L</span>
                  <span>LINE</span>
                </button>
              </div>
            </div>

            {/* Final Message */}
            <div className="summary-footer-message">
              <h3 className="footer-message-title">ดวงดีสร้างได้</h3>
              <p className="footer-message-text">แค่คุณนี่ 'สุข' ให้ครบทุกด้าน</p>
            </div>

            {/* Reset Button */}
            <button className="summary-reset" onClick={reset}>
              <span className="material-symbols-outlined">refresh</span>
              ทำนายใหม่อีกครั้ง
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="material-symbols-outlined">spa</span>
              <span>Muketing Strategy © 2024</span>
              <span className="material-symbols-outlined">balance</span>
            </div>
            <p className="footer-disclaimer">
              การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลโภชนาการก่อนตัดสินใจกิน
            </p>
          </div>
        </footer>
      </div>
    )
  }

  
  return (
    <div className="page dark">
      {/* Header */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <span className="material-symbols-outlined navbar-icon">temple_buddhist</span>
            <h2 className="navbar-title">มูเตลู อีทติ้ง</h2>
          </div>
          <div className="navbar-menu">
            <a href="#" className="navbar-link">หน้าแรก</a>
            <a href="#" className="navbar-link">ทำนายดวง</a>
            <a href="#" className="navbar-link">บทความมูเตลู</a>
            <button className="navbar-button">เข้าสู่ระบบ</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Background decoration */}
        <div className="bg-pattern"></div>
        <div className="bg-gradient"></div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-header">
            <div className="progress-label">
              <span className="material-symbols-outlined">footprint</span>
              <span>เส้นทางกรรม (Karma Path)</span>
            </div>
            <span className="progress-count">{currentIndex + 1}/{QUESTIONS.length}</span>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Header Section */}
        <div className="destiny-header">
          <div className="destiny-icon top">
            <span className="material-symbols-outlined">auto_fix</span>
          </div>
          <h1 className="destiny-title">เปิดดวงชะตาเศรษฐี</h1>
          <p className="destiny-subtitle">เช็กพลังโชคลาภผ่านพฤติกรรมการกิน</p>
          <div className="destiny-icon bottom">
            <span className="material-symbols-outlined">local_fire_department</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-container">
          <div className="question-card">
            <div className="question-visual">
              <div 
                className="question-image"
                style={{ backgroundImage: `url(${currentQuestion.image})` }}
              ></div>
              <div className="question-badge">คำถามที่ {currentIndex + 1}</div>
            </div>
            
            <div className="question-content">
              <div className="question-text">
                <h3>{currentQuestion.prompt}</h3>
                <p className="question-helper">{currentQuestion.helper}</p>
              </div>

              {/* Likert Scale */}
              {currentQuestion.type === 'likert' && (
                <div className="likert-scale">
                  <div className="likert-labels">
                    <span>ละเว้น</span>
                    <span className="hell-label">นรกกินกบาล</span>
                  </div>
                  <div className="likert-options">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <label key={num} className="likert-option">
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={num}
                          checked={answers[currentQuestion.id] === String(num)}
                          onChange={(e) => handleAnswer(e.target.value)}
                        />
                        <div className={`likert-circle ${answers[currentQuestion.id] === String(num) ? 'active' : ''}`}>
                          {['๑', '๒', '๓', '๔', '๕', '๖'][num - 1]}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Chips */}
              {currentQuestion.type === 'chips' && (
                <div className="chips">
                  {currentQuestion.options?.map((option) => (
                    <button
                      key={option}
                      className={answers[currentQuestion.id] === option ? 'chip active' : 'chip'}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Checklist */}
              {currentQuestion.type === 'checklist' && (
                <div className="checklist-container">
                  {currentQuestion.category && (
                    <div className="checklist-category">
                      <span className="material-symbols-outlined">front_hand</span>
                      <h4>{currentQuestion.category}</h4>
                    </div>
                  )}
                  <div className="checklist">
                    {currentQuestion.options?.map((option) => {
                      const selectedItems = Array.isArray(answers[currentQuestion.id]) 
                        ? answers[currentQuestion.id] as string[]
                        : []
                      const isChecked = selectedItems.includes(option)
                      
                      return (
                        <label key={option} className={`checklist-item ${isChecked ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const current = Array.isArray(answers[currentQuestion.id])
                                ? [...(answers[currentQuestion.id] as string[])]
                                : []
                              
                              if (e.target.checked) {
                                current.push(option)
                              } else {
                                const index = current.indexOf(option)
                                if (index > -1) current.splice(index, 1)
                              }
                              
                              const updatedAnswers = { ...answers, [currentQuestion.id]: current }
                              setAnswers(updatedAnswers)
                              
                              if (current.length > 0) {
                                setCoachNote(createFeedback(currentQuestion.id, current.join(',')))
                              }
                            }}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="checkbox-label">{option}</span>
                        </label>
                      )
                    })}
                  </div>
                  <button
                    className="checklist-confirm"
                    onClick={() => {
                      const selected = answers[currentQuestion.id]
                      if (Array.isArray(selected) && selected.length > 0) {
                        moveToNext(answers)
                      }
                    }}
                    disabled={!Array.isArray(answers[currentQuestion.id]) || (answers[currentQuestion.id] as string[]).length === 0}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    ยืนยันคำตอบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="feedback-card">
          <div className={`feedback-badge ${coachNote.destiny}`}>คำทำนาย</div>
          <h3 className="feedback-headline">{coachNote.headline}</h3>
          <p className="feedback-detail">{coachNote.detail}</p>
          <div className="feedback-advice">
            <span className="material-symbols-outlined">tips_and_updates</span>
            <p>{coachNote.advice}</p>
          </div>
          
          {/* Destiny Score */}
          {completedCount === QUESTIONS.length && (
            <div className="destiny-score">
              <div className="destiny-score-circle" style={{ borderColor: destinyScore.color }}>
                <span className="destiny-score-number" style={{ color: destinyScore.color }}>{destinyScore.score}</span>
                <span className="destiny-score-label">คะแนนดวงชะตา</span>
              </div>
              <div className="destiny-score-text">
                <h4 style={{ color: destinyScore.color }}>{destinyScore.level}</h4>
                <p>ผลรวมจาก {completedCount} คำถาม</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleBack} disabled={currentIndex === 0}>
            <span className="material-symbols-outlined">arrow_back</span>
            ย้อนกลับ
          </button>
          <button className="btn-primary" onClick={reset}>
            <span className="material-symbols-outlined">refresh</span>
            เริ่มใหม่
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="material-symbols-outlined">spa</span>
            <span>Muketing Strategy © 2024</span>
            <span className="material-symbols-outlined">balance</span>
          </div>
          <p className="footer-disclaimer">
            การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลโภชนาการก่อนตัดสินใจกิน
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
