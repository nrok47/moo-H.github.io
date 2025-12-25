import { useEffect, useMemo, useState } from 'react'
import './App.css'

type QuestionId = 'energy' | 'leak' | 'reward' | 'obstacle' | 'magic'

type Question = {
  id: QuestionId
  prompt: string
  helper: string
  type: 'slider' | 'chips' | 'text'
  options?: string[]
}

type Feedback = {
  headline: string
  detail: string
  advice: string
}

type Answers = Partial<Record<QuestionId, string>>

const QUESTIONS: Question[] = [
  {
    id: 'energy',
    prompt: "ร่างกายของคุณวันนี้ เหมือน ‘แบตเตอรี่’ ที่เหลือกี่ %?",
    helper: 'เลื่อนสไลด์เพื่อบอกระดับพลังงานของคุณ',
    type: 'slider',
  },
  {
    id: 'leak',
    prompt: 'ส่วนใหญ่แบตเตอรี่ของคุณ “รั่ว” ที่พฤติกรรมไหนมากที่สุด?',
    helper: 'เลือกสิ่งที่ทำให้พลังงานของคุณลดลงบ่อยที่สุด',
    type: 'chips',
    options: ['การนอน', 'อาหาร', 'ความเครียด', 'การออกกำลังกาย', 'อื่น ๆ'],
  },
  {
    id: 'reward',
    prompt: 'ถ้าอุดจุดรั่วนี้ได้สำเร็จ “รางวัล” อันดับแรกที่คุณอยากได้คืออะไร?',
    helper: 'เช่น ตื่นมาสดชื่น ได้ออกไปเที่ยว หรือเล่นกับครอบครัวได้นานขึ้น',
    type: 'text',
  },
  {
    id: 'obstacle',
    prompt: 'อะไรคือสิ่งกั้นกลางที่หนักหน่วงที่สุด ระหว่างคุณ กับ “รางวัล” นั้น?',
    helper: 'เลือกความรู้สึกหรืออุปสรรคที่ตรงใจที่สุด',
    type: 'chips',
    options: ['เวลา', 'ขาดแรงจูงใจ', 'ความเครียดสะสม', 'ไม่รู้จะเริ่มตรงไหน', 'อื่น ๆ'],
  },
  {
    id: 'magic',
    prompt: 'ถ้ามี “เวทมนตร์” ที่ทำให้เริ่มก้าวแรกได้ง่ายที่สุด คุณอยากให้มันคืออะไร?',
    helper: 'เลือกสิ่งที่อยากให้ระบบเตือนหรือจัดให้ทันที',
    type: 'chips',
    options: ['ปลุกให้เร็วขึ้น 10 นาที', 'เตรียมอาหารเช้าให้', 'ปิดแจ้งเตือนโซเชียล 1 ชม.', 'ส่งข้อความกำลังใจ', 'อื่น ๆ'],
  },
]

const STORAGE_KEY = 'moo-health-answers'

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

const createFeedback = (questionId: QuestionId, value: string, answers: Answers): Feedback => {
  switch (questionId) {
    case 'energy': {
      const percent = Number(value)
      if (Number.isNaN(percent)) {
        return {
          headline: 'ลองระบุเป็นตัวเลขเพื่อเริ่มต้น',
          detail: 'การรู้สถานะพลังงานของตัวเองคือจุดเริ่มของการฟื้นฟู',
          advice: 'เลื่อนสไลด์เพื่อบอกตัวเลข แล้วเราจะหาทางชาร์จพลังง่าย ๆ ให้คุณ',
        }
      }

      if (percent < 40) {
        return {
          headline: 'โหมดประหยัดพลังงาน',
          detail:
            'คุณกำลังใช้โหมดประหยัดพลังงานขั้นสุดอยู่ใช่ไหม? เราจะช่วยคุณหาจุดชาร์จพลังที่ง่ายที่สุดใน 4 ข้อถัดไปครับ',
          advice: 'เริ่มจากพักสายตา 2 นาที แล้วจิบน้ำอุ่น 1 แก้วก่อนตอบข้อถัดไป',
        }
      }

      if (percent < 70) {
        return {
          headline: 'พลังงานยังเหลือ แต่รั่วได้',
          detail: 'คุณมีพลังงานพอประมาณ ลองจับตาดูว่าจุดไหนรั่ว แล้วอุดทันทีจะได้อัปพลังไว',
          advice: 'เลือกจุดรั่วหลัก แล้วตั้งเป้า “แก้ 1 อย่าง” ใน 24 ชั่วโมง',
        }
      }

      return {
        headline: 'แบตพร้อมลุย',
        detail: 'ยอดเยี่ยม! คุณมีพลังพร้อมสร้างโมเมนตัม ลองใช้พลังนี้ตั้งเป้าเล็ก ๆ ให้สำเร็จทันที',
        advice: 'ใช้พลังช่วงนี้เริ่มก้าวแรก เช่น เดิน 5 นาที หรือจัดโต๊ะทำงานให้โล่ง',
      }
    }
    case 'leak': {
      const lower = value.toLowerCase()
      if (lower.includes('นอน') || lower.includes('อาหาร')) {
        return {
          headline: 'อุดจุดรั่วหลัก',
          detail:
            'คุณรู้ไหมว่าการนอนเพิ่มขึ้นแค่ 30 นาที อาจช่วยอุดจุดรั่วนี้ได้ถึงครึ่งหนึ่ง! นี่คือหัวใจของ Lifestyle Medicine เลยครับ',
          advice: 'คืนนี้ลองเข้านอนเร็วขึ้น 30 นาที หรือเตรียมมื้อเช้าเรียบง่ายไว้ล่วงหน้า',
        }
      }
      return {
        headline: 'เริ่มที่จุดรั่วเดียว',
        detail: `คุณระบุว่าแบตรั่วที่ “${value}” ลองโฟกัสแก้เพียงเรื่องเดียว จะเห็นพลังกลับมาเร็วที่สุด`,
        advice: 'บันทึกทริกสั้น ๆ 1 ข้อ เช่น ปิดจอ 30 นาทีก่อนนอน หรือเดินยืดตัวหลังประชุม',
      }
    }
    case 'reward': {
      return {
        headline: 'รางวัลที่มีความหมาย',
        detail: `การได้ “${value}” คืนมา จะเป็นพลังงานที่ดีที่สุดให้คุณทำสิ่งสำคัญอื่น ๆ ได้อีกมากมาย`,
        advice: 'จินตนาการภาพรางวัลนี้ชัด ๆ แล้วแบ่งขั้นตอนเป็นก้าวเล็กที่สุดที่ทำได้พรุ่งนี้',
      }
    }
    case 'obstacle': {
      return {
        headline: 'สะกิดด้วยความเข้าใจ',
        detail: `ความรู้สึก “${value}” เป็นเรื่องปกติที่ทุกคนเจอครับ แต่เรามี “เทคนิค 2 นาที” ที่จะช่วยทลายกำแพงนี้ให้คุณได้ทันที!`,
        advice: 'ลองกฎ 2 นาที: ทำก้าวแรกภายใน 120 วินาที เช่น ล้างหน้า เดินไปหยิบน้ำ หรือปิดแจ้งเตือนหนึ่งชั่วโมง',
      }
    }
    case 'magic': {
      const reward = answers.reward ? `เพื่อให้ได้ “${answers.reward}”` : ''
      return {
        headline: 'ตั้งนาฬิกาสะกิดแล้ว',
        detail: `จัดให้ครับ! ก้าวแรกของคุณคือ “${value}” ${reward} ผมได้ตั้งนาฬิกา “สะกิด” ไว้ให้คุณเริ่มพรุ่งนี้เช้าแล้วนะ พร้อมไหม?`,
        advice: 'เพิ่มการแจ้งเตือนลงปฏิทิน หรือเขียนโพสต์อิทแปะในจุดที่เห็นทันทีที่ตื่น',
      }
    }
    default:
      return {
        headline: 'ขอบคุณที่แชร์',
        detail: 'ข้อมูลของคุณช่วยให้เราปรับคำแนะนำให้ตรงใจมากขึ้น',
        advice: 'ตอบข้อถัดไปเพื่อดูแผนเฉพาะตัวของคุณ',
      }
  }
}

const formatEnergyLabel = (value?: string) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 'ยังไม่ระบุ'
  if (num < 40) return 'กำลังฮึดสู้'
  if (num < 70) return 'พอถูไถ'
  return 'พร้อมลุย'
}

const App = () => {
  const [answers, setAnswers] = useState<Answers>(loadAnswers)
  const [currentIndex, setCurrentIndex] = useState(() => getInitialIndex(loadAnswers()))
  const [coachNote, setCoachNote] = useState<Feedback>(() => ({
    headline: 'เริ่มจากคำถามแรก',
    detail: 'ตอบแต่ละข้อแล้วเราจะสะกิดพร้อมแผนปฏิบัติทันที',
    advice: 'ใช้เวลาคิดสั้น ๆ แล้วเลือกคำตอบที่ตรงใจที่สุด',
  }))
    const [sliderDraft, setSliderDraft] = useState(() => loadAnswers().energy ?? '50')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

    useEffect(() => {
      setSliderDraft(answers.energy ?? '50')
    }, [answers.energy])

  const completedCount = useMemo(
    () => QUESTIONS.filter((item) => answers[item.id]?.trim()).length,
    [answers],
  )

  const progress = Math.round((completedCount / QUESTIONS.length) * 100)
  const currentQuestion = QUESTIONS[currentIndex]

  const moveToNext = (updated: Answers) => {
    const nextIndex = QUESTIONS.findIndex((item) => !updated[item.id])
    setCurrentIndex(nextIndex === -1 ? QUESTIONS.length - 1 : nextIndex)
  }

  const handleAnswer = (value: string) => {
    const trimmed = value.trim()
    const updatedAnswers = { ...answers, [currentQuestion.id]: trimmed }
    setAnswers(updatedAnswers)
    setCoachNote(createFeedback(currentQuestion.id, trimmed, updatedAnswers))
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
      detail: 'ล้างคำตอบแล้ว เริ่มชาร์จพลังรอบใหม่ได้เลย',
      advice: 'เริ่มจากข้อที่ 1 แล้วจับความรู้สึกของตัวเองในตอนนี้',
    })
    setCurrentIndex(0)
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">moo-health • 5 คำถามเปลี่ยนชีวิต</p>
          <h1>พลังชีวิตคุณเหลือกี่เปอร์เซ็นต์?</h1>
          <p className="lede">
            แบบสอบถามสั้น ๆ นี้ใช้หลัก Ask-Affirm-Advice และ Lifestyle Medicine เพื่อสะกิดพลังใน 5 คำถาม
            ทุกคำตอบจะมีโค้ชตอบกลับทันที พร้อมแผนก้าวแรกที่ทำได้ภายใน 2 นาที
          </p>
        </div>
        <div className="hero-card">
          <div className="badge">Real-time Feedback</div>
          <p className="hero-title">HP Bar</p>
          <div className="hp-bar" aria-label="พลังความก้าวหน้ารวม">
            <div className="hp-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="hp-meta">
            <span>{progress}% สำเร็จ</span>
            <span>{completedCount}/{QUESTIONS.length} คำถาม</span>
          </div>
          <div className="energy-chip">
            <span>สถานะวันนี้:</span>
            <strong>{formatEnergyLabel(answers.energy)}</strong>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="card focus">
          <div className="card-header">
            <div>
              <p className="eyebrow">ข้อ {currentIndex + 1} / {QUESTIONS.length}</p>
              <h2>{currentQuestion.prompt}</h2>
              <p className="helper">{currentQuestion.helper}</p>
            </div>
            <div className="nav-actions">
              <button className="ghost" onClick={handleBack} disabled={currentIndex === 0}>
                ย้อนกลับ
              </button>
              <button className="ghost" onClick={reset}>
                เริ่มใหม่
              </button>
            </div>
          </div>

          <div className="input-area">
            {currentQuestion.type === 'slider' && (
              <div className="slider-group">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Number(sliderDraft)}
                  onChange={(event) => setSliderDraft(event.target.value)}
                />
                <div className="slider-meta">
                  <div className="slider-readout">
                    <span>{sliderDraft}%</span>
                    <span className="pill">{formatEnergyLabel(sliderDraft)}</span>
                  </div>
                  <button
                    className="solid"
                    onClick={() => handleAnswer(sliderDraft)}
                    disabled={answers.energy === sliderDraft}
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            )}

            {currentQuestion.type === 'chips' && (
              <div className="chips">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    className={
                      answers[currentQuestion.id] === option ? 'chip active' : 'chip'
                    }
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div className="text-input">
                <input
                  type="text"
                  placeholder="พิมพ์คำตอบสั้น ๆ"
                  value={answers[currentQuestion.id] ?? ''}
                  onChange={(event) => setAnswers({ ...answers, [currentQuestion.id]: event.target.value })}
                  onBlur={(event) => handleAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAnswer((event.target as HTMLInputElement).value)
                    }
                  }}
                />
                <p className="hint">กด Enter หรือคลิกนอกช่องเพื่อยืนยัน</p>
              </div>
            )}
          </div>
        </section>

        <section className="card coach">
          <div className="badge muted">Ask • Affirm • Advice</div>
          <h3>{coachNote.headline}</h3>
          <p className="coach-detail">{coachNote.detail}</p>
          <div className="advice">
            <span className="dot" />
            <p>{coachNote.advice}</p>
          </div>
          <div className="mini-grid">
            <div className="mini-card">
              <p className="eyebrow">พลังงานวันนี้</p>
              <p className="big">{answers.energy ?? '—'}%</p>
              <p className="helper">{formatEnergyLabel(answers.energy)}</p>
            </div>
            <div className="mini-card">
              <p className="eyebrow">จุดรั่วหลัก</p>
              <p className="big">{answers.leak ?? 'ยังไม่เลือก'}</p>
              <p className="helper">โฟกัสอุด 1 จุดก่อน</p>
            </div>
          </div>
        </section>
      </main>

      <section className="card grid">
        <div>
          <p className="eyebrow">รางวัลที่อยากได้</p>
          <h4>{answers.reward ?? 'ระบุรางวัลเพื่อสร้างแรงขับ'} </h4>
          <p className="helper">จินตนาการรางวัลช่วยให้ก้าวแรกง่ายขึ้น</p>
        </div>
        <div>
          <p className="eyebrow">อุปสรรคที่รู้สึก</p>
          <h4>{answers.obstacle ?? 'เลือกอุปสรรคที่ตรงใจ'} </h4>
          <p className="helper">รับรู้ความรู้สึก แล้วใช้เทคนิค 2 นาทีลดแรงต้าน</p>
        </div>
        <div>
          <p className="eyebrow">เวทมนตร์ก้าวแรก</p>
          <h4>{answers.magic ?? 'เลือกการสะกิดพรุ่งนี้เช้า'} </h4>
          <p className="helper">ก้าวแรกชัดเจนช่วยแปลงความตั้งใจเป็นการลงมือทำ</p>
        </div>
      </section>

      <footer className="footer">
        <div className="progress-line">
          {QUESTIONS.map((question, index) => {
            const isDone = Boolean(answers[question.id])
            return (
              <button
                key={question.id}
                className={isDone ? 'step done' : 'step'}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="step-index">{index + 1}</span>
                <span className="step-label">{question.prompt}</span>
              </button>
            )
          })}
        </div>
        <p className="helper">
          ระบบจะให้ฟีดแบ็กทันทีหลังตอบแต่ละข้อ และแถบ HP จะเพิ่มขึ้นทุกครั้งที่คุณยืนยันคำตอบ
        </p>
      </footer>
    </div>
  )
}

export default App
