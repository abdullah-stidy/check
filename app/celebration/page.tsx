"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Trophy,
  Star,
  ArrowRight,
  Download,
  Clock,
  FileText,
  Share2,
  Sparkles,
  Award,
  Rocket,
  ChevronRight,
  Sun,
  Moon,
  SparkleIcon as Firework,
  Medal,
  GraduationCap,
  Brain,
  BarChart,
} from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { topics } from "@/lib/data"

export default function CelebrationPage() {
  const [mounted, setMounted] = useState(false)
  const [completedTopics] = useLocalStorage<string[]>("completedTopics", [])
  const [totalStudyTime] = useLocalStorage<number>("totalStudyTime", 0)
  const [studySessions] = useLocalStorage<number>("studySessions", 0)
  const [topicStudyDurations] = useLocalStorage<Record<string, number>>("topicStudyDurations", {})
  const [activeTab, setActiveTab] = useState("overview")
  const { theme, setTheme } = useTheme()
  const [showCertificate, setShowCertificate] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  // Calculate category completion percentages - moved outside of render to avoid recalculation
  const categoryStats = topics.reduce((acc: Record<string, { total: number; completed: number }>, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = { total: 0, completed: 0 }
    }
    acc[topic.category].total += 1
    if (completedTopics.includes(topic.id)) {
      acc[topic.category].completed += 1
    }
    return acc
  }, {})

  // Find most studied category - moved outside of render to avoid recalculation
  const mostStudiedCategory = Object.entries(topicStudyDurations || {}).reduce(
    (acc: { categories: Record<string, number>; maxDuration: number; category: string }, [id, duration]) => {
      const topic = topics.find((t) => t.id === id)
      if (topic) {
        if (!acc.categories[topic.category]) {
          acc.categories[topic.category] = 0
        }
        acc.categories[topic.category] += duration

        if (acc.categories[topic.category] > acc.maxDuration) {
          acc.maxDuration = acc.categories[topic.category]
          acc.category = topic.category
        }
      }
      return acc
    },
    { categories: {}, maxDuration: 0, category: "" },
  ).category

  // Mount effect - only runs once
  useEffect(() => {
    setMounted(true)
  }, [])

  // Confetti effect - only runs once after mounting
  useEffect(() => {
    if (!mounted) return

    // Trigger confetti
    const duration = 15 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#000000", "#333333", "#666666"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#000000", "#333333", "#666666"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [mounted]) // Only depend on mounted state

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const downloadCertificate = () => {
    if (certificateRef.current) {
      // In a real app, you would use html2canvas or a similar library to capture the certificate
      // For this demo, we'll just show an alert
      alert("Certificate download started!")
    }
  }

  const shareAchievement = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "A-Level Mathematics Achievement",
          text: "I just completed all A-Level Mathematics topics! 🎉",
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert("Share URL copied to clipboard!")
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-purple-900 dark:from-black dark:via-purple-950 dark:to-purple-900 light:from-white light:via-purple-50 light:to-purple-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 dark:bg-purple-500 light:bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-700 dark:bg-purple-700 light:bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-600 dark:bg-purple-600 light:bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header with theme toggle */}
        <div className="flex justify-end mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-white dark:text-white light:text-gray-900 hover:bg-white/10"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {theme === "dark" ? "light" : "dark"} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {showCertificate ? (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Certificate View */}
                <div
                  ref={certificateRef}
                  className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl border-4 border-purple-500 shadow-2xl relative overflow-hidden"
                >
                  {/* Certificate Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:20px_20px]"></div>
                  </div>

                  {/* Certificate Content */}
                  <div className="relative text-center">
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    <h2 className="text-2xl font-serif text-purple-500 mb-2">Certificate of Achievement</h2>
                    <h1 className="text-4xl font-bold text-white mb-6">A-Level Mathematics</h1>

                    <p className="text-gray-300 mb-4">This certifies that</p>
                    <h3 className="text-3xl font-bold text-white mb-4 font-serif">Student Name</h3>
                    <p className="text-gray-300 mb-8">has successfully completed all topics in A-Level Mathematics</p>

                    <div className="flex justify-center mb-8">
                      <div className="h-px w-48 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                    </div>

                    <div className="flex justify-between text-gray-400 text-sm">
                      <div>Date: {new Date().toLocaleDateString()}</div>
                      <div>Topics Completed: {completedTopics.length}</div>
                      <div>Study Time: {formatStudyTime(totalStudyTime)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                  <Button
                    variant="outline"
                    className="bg-black/40 text-white border-purple-500/30 hover:bg-purple-500/10"
                    onClick={() => setShowCertificate(false)}
                  >
                    Back to Celebration
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-90"
                    onClick={downloadCertificate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="main-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Main Celebration Content */}
                <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-purple-500/20 mb-8">
                  <CardHeader className="text-center pb-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center"
                    >
                      <Trophy className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <CardTitle className="text-4xl md:text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
                        Congratulations! 🎉
                      </CardTitle>
                      <CardDescription className="text-xl text-gray-400 dark:text-gray-400 light:text-gray-500">
                        You've completed all A-Level Mathematics topics!
                      </CardDescription>
                    </motion.div>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                      <TabsList className="grid grid-cols-3 bg-black/30 dark:bg-black/30 light:bg-gray-100 p-1 rounded-xl mb-6">
                        <TabsTrigger
                          value="overview"
                          className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="achievements"
                          className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500"
                        >
                          Achievements
                        </TabsTrigger>
                        <TabsTrigger
                          value="stats"
                          className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500"
                        >
                          Statistics
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                        >
                          {[
                            {
                              title: "Topics Completed",
                              value: completedTopics.length,
                              icon: Star,
                              color: "text-purple-500",
                            },
                            {
                              title: "Hours Studied",
                              value: formatStudyTime(totalStudyTime),
                              icon: Clock,
                              color: "text-purple-500",
                            },
                            { title: "Study Sessions", value: studySessions, icon: FileText, color: "text-purple-500" },
                          ].map((stat, index) => (
                            <Card
                              key={index}
                              className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20"
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-white dark:text-white light:text-gray-900">
                                  <stat.icon className={`w-5 h-5 mr-2 ${stat.color}`} />
                                  {stat.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-white dark:text-white light:text-gray-900">
                                  {stat.value}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className="text-center space-y-4"
                        >
                          <p className="text-white dark:text-white light:text-gray-900">
                            This is a remarkable achievement! You've demonstrated exceptional dedication and
                            perseverance in mastering A-Level Mathematics.
                          </p>

                          <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/50 py-1.5">
                              <Award className="w-3.5 h-3.5 mr-1" /> Master of Algebra
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/50 py-1.5">
                              <Award className="w-3.5 h-3.5 mr-1" /> Calculus Expert
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/50 py-1.5">
                              <Award className="w-3.5 h-3.5 mr-1" /> Geometry Guru
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/50 py-1.5">
                              <Award className="w-3.5 h-3.5 mr-1" /> Statistics Specialist
                            </Badge>
                          </div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="achievements" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20 overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center text-white dark:text-white light:text-gray-900">
                                <Medal className="w-5 h-5 mr-2 text-purple-500" />
                                Perfect Score
                              </CardTitle>
                              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                                Completed 100% of all topics
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="text-white dark:text-white light:text-gray-900">
                                  {completedTopics.length} / {topics.length} topics
                                </div>
                                <Badge className="bg-purple-500 text-white">Achieved</Badge>
                              </div>
                              <Progress
                                value={100}
                                className="h-2 mt-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                              />
                            </CardContent>
                          </Card>

                          <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20 overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center text-white dark:text-white light:text-gray-900">
                                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                                Dedicated Learner
                              </CardTitle>
                              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                                Studied for more than 10 hours
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="text-white dark:text-white light:text-gray-900">
                                  {formatStudyTime(totalStudyTime)}
                                </div>
                                <Badge className="bg-purple-500 text-white">Achieved</Badge>
                              </div>
                              <Progress
                                value={100}
                                className="h-2 mt-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                              />
                            </CardContent>
                          </Card>

                          <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20 overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center text-white dark:text-white light:text-gray-900">
                                <Rocket className="w-5 h-5 mr-2 text-purple-500" />
                                Math Specialist
                              </CardTitle>
                              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                                Mastered{" "}
                                {mostStudiedCategory
                                  ? mostStudiedCategory.charAt(0).toUpperCase() + mostStudiedCategory.slice(1)
                                  : "Mathematics"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="text-white dark:text-white light:text-gray-900">
                                  Most studied category
                                </div>
                                <Badge className="bg-purple-500 text-white">Achieved</Badge>
                              </div>
                              <Progress
                                value={100}
                                className="h-2 mt-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                              />
                            </CardContent>
                          </Card>

                          <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20 overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center text-white dark:text-white light:text-gray-900">
                                <Firework className="w-5 h-5 mr-2 text-purple-500" />
                                Consistent Learner
                              </CardTitle>
                              <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                                Completed more than 10 study sessions
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="text-white dark:text-white light:text-gray-900">
                                  {studySessions} sessions
                                </div>
                                <Badge className="bg-purple-500 text-white">Achieved</Badge>
                              </div>
                              <Progress
                                value={100}
                                className="h-2 mt-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="stats" className="space-y-6">
                        <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20">
                          <CardHeader>
                            <CardTitle className="flex items-center text-white dark:text-white light:text-gray-900">
                              <BarChart className="w-5 h-5 mr-2 text-purple-500" />
                              Category Completion
                            </CardTitle>
                            <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                              Your progress across different mathematics categories
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {Object.entries(categoryStats).map(([category, stats]) => (
                              <div key={category} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-white dark:text-white light:text-gray-900 capitalize">
                                    {category}
                                  </div>
                                  <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                                    {stats.completed}/{stats.total} ({Math.round((stats.completed / stats.total) * 100)}
                                    %)
                                  </div>
                                </div>
                                <Progress
                                  value={(stats.completed / stats.total) * 100}
                                  className="h-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                                />
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center text-white dark:text-white light:text-gray-900">
                                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                                Average Study Time per Topic
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl text-white dark:text-white light:text-gray-900 font-medium">
                                {formatStudyTime(totalStudyTime / (completedTopics.length || 1))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center text-white dark:text-white light:text-gray-900">
                                <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                                Completion Rate
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl text-white dark:text-white light:text-gray-900 font-medium">
                                {(completedTopics.length / (studySessions || 1)).toFixed(2)} topics per session
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>

                  <CardFooter className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-black/40 text-white dark:text-white light:text-gray-900 border-purple-500/30 hover:bg-purple-500/10"
                      onClick={() => setShowCertificate(true)}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-black/40 text-white dark:text-white light:text-gray-900 border-purple-500/30 hover:bg-purple-500/10"
                      onClick={shareAchievement}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Achievement
                    </Button>

                    <Link href="/">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-90"
                      >
                        Continue Learning
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                {/* What's Next Section */}
                <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-gray-900">What's Next?</CardTitle>
                    <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                      Continue your mathematics journey with these recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Advanced Topics",
                          description: "Explore more advanced mathematical concepts",
                          icon: Rocket,
                          action: "Explore Advanced Topics",
                        },
                        {
                          title: "Practice Tests",
                          description: "Test your knowledge with practice exams",
                          icon: FileText,
                          action: "Take Practice Tests",
                        },
                        {
                          title: "Review Weak Areas",
                          description: "Revisit topics you found challenging",
                          icon: Brain,
                          action: "Review Topics",
                        },
                      ].map((item, index) => (
                        <Card
                          key={index}
                          className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-purple-500/20"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center text-white dark:text-white light:text-gray-900">
                              <item.icon className="w-4 h-4 mr-2 text-purple-500" />
                              {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-500">
                              {item.description}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="ghost"
                              className="w-full text-purple-500 hover:bg-purple-500/10 flex items-center justify-center"
                            >
                              {item.action}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

