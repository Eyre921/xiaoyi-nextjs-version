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
  favoriteSong: string
  mbti: string
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
  
  // 合并个人简介、MBTI和最喜欢歌曲
  let combinedBio = userData.introduction
  
  if (userData.mbti) {
    combinedBio += `\n\n【MBTI】\n${userData.mbti}`
  }
  
  if (userData.favoriteSong) {
    combinedBio += `\n\n【最喜欢的歌曲】\n${userData.favoriteSong}`
  }
  
  return {
    nfcuid,
    name: userData.nickname,
    gender: userData.gender,
    birthdate,
    wechat_id: userData.wechatId,
    bio: combinedBio,
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
    favoriteSong: '',
    mbti: '',
    wechatId: '',
    allowRecommendation: true
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
        return userData.introduction.trim().length > 0 && userData.favoriteSong.trim().length > 0 && userData.mbti.trim().length > 0
      case 4:
        return userData.wechatId.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
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
              favoriteSong={userData.favoriteSong}
              mbti={userData.mbti}
              onUpdate={(field, value) => updateUserData(field, value)}
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
      <div className="fixed bottom-8 right-8 z-50">
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
        <p className="text-white/60 text-lg">你希望大家怎么称呼你呢～</p>
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
          <h3 className="text-xl text-white/80 mb-4">生日</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* Year Selector */}
            <div className="relative">
              <select
                value={userData.birthYear}
                onChange={(e) => onUpdate('birthYear', e.target.value)}
                className="w-full appearance-none bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-4 sm:py-5 text-white text-center text-lg font-medium focus:border-white/60 focus:bg-white/20 outline-none transition-all duration-300 hover:bg-white/10 hover:border-white/40 shadow-lg"
              >
                <option value="" className="bg-gray-900 text-gray-300">年份</option>
                {years.map(year => (
                  <option key={year} value={year.toString()} className="bg-gray-900 text-white">{year}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Month Selector */}
            <div className="relative">
              <select
                value={userData.birthMonth}
                onChange={(e) => onUpdate('birthMonth', e.target.value)}
                className="w-full appearance-none bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-4 sm:py-5 text-white text-center text-lg font-medium focus:border-white/60 focus:bg-white/20 outline-none transition-all duration-300 hover:bg-white/10 hover:border-white/40 shadow-lg"
              >
                <option value="" className="bg-gray-900 text-gray-300">月份</option>
                {months.map(month => (
                  <option key={month} value={month.toString()} className="bg-gray-900 text-white">{month}月</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Day Selector */}
            <div className="relative">
              <select
                value={userData.birthDay}
                onChange={(e) => onUpdate('birthDay', e.target.value)}
                className="w-full appearance-none bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-4 sm:py-5 text-white text-center text-lg font-medium focus:border-white/60 focus:bg-white/20 outline-none transition-all duration-300 hover:bg-white/10 hover:border-white/40 shadow-lg"
              >
                <option value="" className="bg-gray-900 text-gray-300">日期</option>
                {days.map(day => (
                  <option key={day} value={day.toString()} className="bg-gray-900 text-white">{day}日</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Visual feedback for selected date */}
          {(userData.birthYear || userData.birthMonth || userData.birthDay) && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/20">
              <p className="text-white/70 text-center">
                {userData.birthYear && <span className="text-white font-medium">{userData.birthYear}年</span>}
                {userData.birthMonth && <span className="text-white font-medium ml-1">{userData.birthMonth}月</span>}
                {userData.birthDay && <span className="text-white font-medium ml-1">{userData.birthDay}日</span>}
              </p>
            </div>
          )}
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

function IntroductionStep({ introduction, favoriteSong, mbti, onUpdate }: { introduction: string; favoriteSong: string; mbti: string; onUpdate: (field: 'introduction' | 'favoriteSong' | 'mbti', value: string) => void }) {
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
          onChange={(e) => onUpdate('introduction', e.target.value)}
          placeholder="比如：我是一个热爱生活的人，喜欢旅行和摄影，希望能遇到志同道合的朋友..."
          rows={6}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white resize-none focus:border-white outline-none transition-colors placeholder:text-white/40"
        />
        
        <div className="pt-4">
          <label className="block text-white/80 text-lg mb-2">你的MBTI类型 *</label>
          <select
            value={mbti}
            onChange={(e) => onUpdate('mbti', e.target.value)}
            className="w-full bg-gradient-to-r from-white/15 to-white/10 border border-white/30 rounded-2xl px-6 py-5 text-white text-lg font-medium shadow-lg backdrop-blur-sm focus:border-white/60 focus:bg-white/20 focus:shadow-xl outline-none transition-all duration-300 hover:border-white/50 hover:bg-white/15 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 1.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
            required
          >
            <option value="" className="bg-gray-900 text-gray-300 py-3">请选择你的MBTI类型</option>
            <option value="INTJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">INTJ - 建筑师</option>
            <option value="INTP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">INTP - 思想家</option>
            <option value="ENTJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ENTJ - 指挥官</option>
            <option value="ENTP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ENTP - 辩论家</option>
            <option value="INFJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">INFJ - 提倡者</option>
            <option value="INFP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">INFP - 调停者</option>
            <option value="ENFJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ENFJ - 主人公</option>
            <option value="ENFP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ENFP - 竞选者</option>
            <option value="ISTJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ISTJ - 物流师</option>
            <option value="ISFJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ISFJ - 守护者</option>
            <option value="ESTJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ESTJ - 总经理</option>
            <option value="ESFJ" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ESFJ - 执政官</option>
            <option value="ISTP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ISTP - 鉴赏家</option>
            <option value="ISFP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ISFP - 探险家</option>
            <option value="ESTP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ESTP - 企业家</option>
            <option value="ESFP" className="bg-gray-800 text-white py-3 hover:bg-gray-700">ESFP - 表演者</option>
          </select>
        </div>
        
        <div className="pt-4">
          <label className="block text-white/80 text-lg mb-2">你最喜欢天天组合里面哪首歌</label>
          <textarea
            value={favoriteSong}
            onChange={(e) => onUpdate('favoriteSong', e.target.value)}
            placeholder="分享一下你最喜欢的歌，以及说说为什么它很打动你吧～"
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white resize-none focus:border-white outline-none transition-colors placeholder:text-white/40"
          />
        </div>
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