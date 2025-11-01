'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntroPageProps {
  onComplete: () => void
}

export default function IntroPage({ onComplete }: IntroPageProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const sections = [
    {
      id: 'combined',
      lines: [
        'AUTOPIA × 天天音乐节',
        '特别款',
        '',
        '',
        '填写资料让AI可以更了解你',
        '领取你的本场灵魂共鸣搭子',
        '每日都来碰一碰遇见惊喜哦',
        '',
        '',
        '',
        'AUTOPIA',
        '全球首款AI首饰',
        '独家芯片植入技术',
        '高端设计美学加持'
      ],
      duration: 4000
    }
  ]

  useEffect(() => {
    const currentSectionData = sections[currentSection]
    if (!currentSectionData) return

    const timer = setTimeout(() => {
      if (currentSection < sections.length - 1) {
        setIsVisible(false)
        setTimeout(() => {
          setCurrentSection(prev => prev + 1)
          setIsVisible(true)
        }, 800)
      } else {
        // 最后一个section显示完后，额外停留 1s，然后淡出并结束
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            onComplete()
          }, 1200) // 与退出动画 1.2s 对齐
        }, 2000)
      }
    }, currentSectionData.duration)

    return () => clearTimeout(timer)
  }, [currentSection, onComplete, sections])

  const currentSectionData = sections[currentSection]
  
  if (!currentSectionData) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* 微妙的背景纹理 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
      </div>
      
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="text-center px-8 max-w-5xl relative min-h-screen flex flex-col justify-center"
          >
            {/* 主标题区域 */}
            <div className="mb-10">
              {currentSectionData.lines.slice(0, 2).map((line, index) => {
                if (line === '') return <div key={index} className="h-2"></div>
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.6,
                      duration: 1.0,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className={
                      index === 0 
                        ? 'text-2xl md:text-4xl font-light tracking-[0.15em] text-white mb-2 font-mono'
                        : 'text-lg md:text-xl font-light tracking-wide text-gray-300'
                    }
                  >
                    {line}
                  </motion.div>
                )
              })}
            </div>

            {/* 功能介绍区域 */}
            <div className="mb-12">
              {currentSectionData.lines.slice(4, 7).map((line, index) => {
                if (line === '') return <div key={index + 4} className="h-2"></div>
                
                return (
                  <motion.div
                    key={index + 4}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: (index + 2) * 0.6,
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="text-base md:text-lg font-light text-gray-200 mb-3 border-l-2 border-white/20 pl-4 py-1 hover:border-white/40 transition-colors duration-300"
                  >
                    {line}
                  </motion.div>
                )
              })}
            </div>

            {/* 品牌介绍区域 */}
            <div className="border-t border-white/10 pt-10">
              {currentSectionData.lines.slice(10).map((line, index) => {
                if (line === '') return <div key={index + 10} className="h-2"></div>
                
                return (
                  <motion.div
                    key={index + 10}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      // 增加 0.5s 额外停顿，使下半部分更晚出现
                      delay: (index + 6) * 0.5,
                      duration: 1.0,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className={
                      index === 0 
                        ? 'text-xl md:text-3xl font-light tracking-[0.2em] text-white mb-4 font-mono'
                        : 'text-sm md:text-base font-light text-gray-400 mb-2 tracking-wide'
                    }
                  >
                    {line}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 简约的跳过按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        onClick={onComplete}
        className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all duration-300 text-sm font-light tracking-wider px-4 py-2 border border-gray-600 hover:border-white/30 rounded-sm"
      >
        跳过
      </motion.button>
    </div>
  )
}