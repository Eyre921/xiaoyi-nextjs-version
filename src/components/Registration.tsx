'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface UserData {
  nickname: string
  gender: 'male' | 'female' | ''
  birthYear: string
  birthMonth: string
  birthDay: string
  introduction: string
  wechatId: string
  allowRecommendation: boolean
}

interface RegistrationProps {
  nfcuid: string
  onRegistrationSuccess: () => void
}

// 数据转换函数：将新格式转换为后端期望的格式
const convertUserDataToBackendFormat = (userData: UserData, nfcuid: string) => {
  // 构建生日字符串 YYYY-MM-DD
  const birthdate = `${userData.birthYear}-${userData.birthMonth.padStart(2, '0')}-${userData.birthDay.padStart(2, '0')}`
  
  return {
    nfcuid,
    name: userData.nickname,
    gender: userData.gender,
    birthdate,
    wechat_id: userData.wechatId,
    bio: userData.introduction,
    is_matchable: userData.allowRecommendation
  }
}

export default function Registration({ nfcuid, onRegistrationSuccess }: RegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState<UserData>({
    nickname: '',
    gender: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    introduction: '',
    wechatId: '',
    allowRecommendation: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false)

  const totalSteps = 4

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Handle registration completion
      handleRegistrationComplete()
    }
  }

  const handleRegistrationComplete = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // 转换数据格式
      const backendData = convertUserDataToBackendFormat(userData, nfcuid)
      
      console.log('Submitting registration data:', backendData)
      
      // 提交到后端API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '注册失败')
      }

      const result = await response.json()
      console.log('Registration successful:', result)
      
      // 设置注册成功状态
      setIsRegistrationSuccess(true)
      
      // 延迟调用成功回调，给用户看到成功状态
      setTimeout(() => {
        onRegistrationSuccess()
      }, 1000)
      
    } catch (error) {
      console.error('Registration error:', error)
      alert(error instanceof Error ? error.message : '注册失败，请重试')
      setIsSubmitting(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateUserData = (field: keyof UserData, value: string | boolean) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return userData.nickname.trim().length > 0 && userData.nickname.length <= 15
      case 2:
        return userData.gender !== '' && userData.birthYear !== '' && userData.birthMonth !== '' && userData.birthDay !== ''
      case 3:
        return userData.introduction.trim().length > 0
      case 4:
        return userData.wechatId.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 px-6">
        <div className="flex items-center justify-between mb-8">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <span className="text-6xl font-light opacity-20">
              0{currentStep}
            </span>
            <span className="text-4xl font-light opacity-20">
              /{totalSteps}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-white/10 h-1 rounded-full mb-12">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-20">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <NicknameStep
              key="nickname"
              nickname={userData.nickname}
              onUpdate={(value) => updateUserData('nickname', value)}
            />
          )}
          {currentStep === 2 && (
            <GenderAgeStep
              key="gender-age"
              userData={userData}
              onUpdate={updateUserData}
            />
          )}
          {currentStep === 3 && (
            <IntroductionStep
              key="introduction"
              introduction={userData.introduction}
              onUpdate={(value) => updateUserData('introduction', value)}
            />
          )}
          {currentStep === 4 && (
            <WechatStep
              key="wechat"
              userData={userData}
              onUpdate={updateUserData}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Next/Complete button */}
      <div className="fixed bottom-8 right-8">
        <motion.button
          onClick={nextStep}
          disabled={!canProceed() || isSubmitting || isRegistrationSuccess}
          className={`${
            currentStep === totalSteps ? 'w-24 h-16 px-4' : 'w-16 h-16'
          } rounded-full flex items-center justify-center transition-all ${
            isRegistrationSuccess
              ? 'bg-green-500 text-white'
              : canProceed() && !isSubmitting
              ? 'bg-white text-black hover:scale-110'
              : 'bg-white/20 text-white/40 cursor-not-allowed'
          }`}
          whileHover={canProceed() && !isSubmitting && !isRegistrationSuccess ? { scale: 1.1 } : {}}
          whileTap={canProceed() && !isSubmitting && !isRegistrationSuccess ? { scale: 0.95 } : {}}
        >
          {isRegistrationSuccess ? (
            <span className="text-sm font-medium">成功</span>
          ) : isSubmitting ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : currentStep === totalSteps ? (
            <span className="text-sm font-medium">完成</span>
          ) : (
            <ArrowRight size={24} />
          )}
        </motion.button>
      </div>
    </div>
  )
}

// Step Components
function NicknameStep({ nickname, onUpdate }: { nickname: string; onUpdate: (value: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-5xl font-light mb-4">你的昵称</h1>
        <p className="text-white/60 text-lg">取个好听的昵称吧！</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={nickname}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="设置昵称（15字之内）"
            maxLength={15}
            className="w-full bg-transparent border-b-2 border-white/20 focus:border-white text-2xl py-4 outline-none transition-colors placeholder:text-white/40"
          />
          <div className="absolute right-0 bottom-1 text-sm text-white/40">
            {nickname.length}/15
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function GenderAgeStep({ userData, onUpdate }: { userData: UserData; onUpdate: (field: keyof UserData, value: string) => void }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-5xl font-light mb-4">性别&年龄</h1>
        <p className="text-red-400 text-sm">⚠️ 性别注册后不可修改</p>
      </div>

      <div className="space-y-8">
        {/* Birth Date */}
        <div className="space-y-4">
          <div className="flex space-x-4">
            <select
              value={userData.birthYear}
              onChange={(e) => onUpdate('birthYear', e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white outline-none"
            >
              <option value="">年</option>
              {years.map(year => (
                <option key={year} value={year.toString()} className="bg-black">{year}</option>
              ))}
            </select>
            <select
              value={userData.birthMonth}
              onChange={(e) => onUpdate('birthMonth', e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white outline-none"
            >
              <option value="">月</option>
              {months.map(month => (
                <option key={month} value={month.toString()} className="bg-black">{month}</option>
              ))}
            </select>
            <select
              value={userData.birthDay}
              onChange={(e) => onUpdate('birthDay', e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white outline-none"
            >
              <option value="">日</option>
              {days.map(day => (
                <option key={day} value={day.toString()} className="bg-black">{day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-4">
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => onUpdate('gender', 'female')}
              className="flex flex-col items-center space-y-4 group bg-transparent border-none p-0"
            >
              <div className={`relative w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center transition-all duration-300 ${
                userData.gender === 'female' 
                  ? 'bg-green-500 border-green-400' 
                  : 'bg-transparent border-gray-500 group-hover:border-gray-400'
              }`}>
                <span className={`text-6xl font-light transition-all duration-300 ${
                  userData.gender === 'female' ? 'text-white' : 'text-gray-400'
                }`}>♀</span>
              </div>
              <div className={`text-lg transition-all duration-300 ${
                userData.gender === 'female' ? 'text-green-400' : 'text-gray-400'
              }`}>
                我是女孩
              </div>
            </button>

            <button
              onClick={() => onUpdate('gender', 'male')}
              className="flex flex-col items-center space-y-4 group bg-transparent border-none p-0"
            >
              <div className={`relative w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center transition-all duration-300 ${
                userData.gender === 'male' 
                  ? 'bg-green-500 border-green-400' 
                  : 'bg-transparent border-gray-500 group-hover:border-gray-400'
              }`}>
                <span className={`text-6xl font-light transition-all duration-300 ${
                  userData.gender === 'male' ? 'text-white' : 'text-gray-400'
                }`}>♂</span>
              </div>
              <div className={`text-lg transition-all duration-300 ${
                userData.gender === 'male' ? 'text-green-400' : 'text-gray-400'
              }`}>
                我是男孩
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function IntroductionStep({ introduction, onUpdate }: { introduction: string; onUpdate: (value: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-5xl font-light mb-4">介绍自己</h1>
        <p className="text-white/60 text-lg">几句话介绍下自己，让我认识下～</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={introduction}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="比如：我是一个热爱生活的人，喜欢旅行和摄影，希望能遇到志同道合的朋友..."
          rows={8}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white resize-none focus:border-white outline-none transition-colors placeholder:text-white/40"
        />
      </div>
    </motion.div>
  )
}

function WechatStep({ userData, onUpdate }: { userData: UserData; onUpdate: (field: keyof UserData, value: string | boolean) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-5xl font-light mb-4">微信号&推荐设置</h1>
        <p className="text-white/60 text-lg">填写下微信号～极速扩列～</p>
      </div>

      <div className="space-y-8">
        {/* WeChat ID Input */}
        <div className="space-y-4">
          <input
            type="text"
            value={userData.wechatId}
            onChange={(e) => onUpdate('wechatId', e.target.value)}
            placeholder="填写你的微信号"
            className="w-full bg-transparent border-b-2 border-white/20 focus:border-white text-xl py-4 outline-none transition-colors placeholder:text-white/40"
          />
        </div>

        {/* Recommendation Toggle */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">允许被推荐给其他用户</h3>
              <p className="text-white/60 text-sm mt-1">
                {userData.allowRecommendation
                  ? '已开启智能推荐，DD会为您寻找有趣的朋友'
                  : '开启后，DD可能会将您推荐给合适的朋友'
                }
              </p>
            </div>
            <button
              onClick={() => onUpdate('allowRecommendation', !userData.allowRecommendation)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                userData.allowRecommendation ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-sm"
                animate={{
                  x: userData.allowRecommendation ? 15 : -15
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}