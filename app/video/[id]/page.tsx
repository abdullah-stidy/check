"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { topics } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  Check,
  ArrowLeft,
  Clock,
  Save,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Volume2,
  VolumeX,
  BookOpen,
  ListChecks,
  Calendar,
  ExternalLink,
  Sun,
  Moon,
  Award,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [topic, setTopic] = useState<any>(null)
  const [notes, setNotes] = useLocalStorage<string>(`notes-${id}`, "")
  const [completedTopics, setCompletedTopics] = useLocalStorage<string[]>("completedTopics", [])
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const { theme, setTheme } = useTheme()

  // Study session tracking
  const [studyDuration, setStudyDuration] = useLocalStorage<number>(`study-duration-${id}`, 0)
  const [totalStudyTime, setTotalStudyTime] = useLocalStorage<number>("totalStudyTime", 0)
  const [studySessions, setStudySessions] = useLocalStorage<number>("studySessions", 0)
  const [isStudying, setIsStudying] = useState(false)
  const studyInterval = useRef<NodeJS.Timeout | null>(null)

  // Topic study durations
  const [topicStudyDurations, setTopicStudyDurations] = useLocalStorage<Record<string, number>>(
    "topicStudyDurations",
    {},
  )

  // Pomodoro timer state
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Active tab
  const [activeTab, setActiveTab] = useState<string>("video")

  // Get YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  useEffect(() => {
    const foundTopic = topics.find((t) => t.id === id)
    if (foundTopic) {
      setTopic(foundTopic)
      // Increment study sessions when first visiting a topic
      const hasVisited = localStorage.getItem(`visited-${id}`)
      if (!hasVisited) {
        setStudySessions((prev) => prev + 1)
        localStorage.setItem(`visited-${id}`, "true")
      }
    } else {
      router.push("/")
    }

    setIsCompleted(completedTopics.includes(id as string))
  }, [id, router, completedTopics, setStudySessions])

  // Study duration tracking
  useEffect(() => {
    if (isStudying) {
      studyInterval.current = setInterval(() => {
        setStudyDuration((prev) => prev + 1)
        setTotalStudyTime((prev) => prev + 1)

        // Update topic-specific study duration
        setTopicStudyDurations((prev) => ({
          ...prev,
          [id as string]: (prev[id as string] || 0) + 1,
        }))
      }, 1000)
    } else if (studyInterval.current) {
      clearInterval(studyInterval.current)
    }

    return () => {
      if (studyInterval.current) {
        clearInterval(studyInterval.current)
      }
    }
  }, [isStudying, setStudyDuration, setTotalStudyTime, id, setTopicStudyDurations])

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            if (timerMode === "focus") {
              setTimerMode("break")
              return 5 * 60
            } else {
              setTimerMode("focus")
              return 25 * 60
            }
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerActive, timerMode])

  const toggleCompletion = () => {
    const newCompletedTopics = completedTopics.includes(id as string)
      ? completedTopics.filter((topicId) => topicId !== (id as string))
      : [...completedTopics, id as string]

    setCompletedTopics(newCompletedTopics)
    setIsCompleted(!isCompleted)

    // Check if all topics are completed
    if (newCompletedTopics.length === topics.length) {
      router.push("/celebration")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-red-900 dark:from-black dark:via-red-950 dark:to-red-900 light:from-white light:via-red-50 light:to-red-100 flex items-center justify-center">
        <div className="animate-pulse text-white dark:text-white light:text-gray-900">Loading...</div>
      </div>
    )
  }

  const videoId = getYouTubeId(topic.url)
  const currentIndex = topics.findIndex((t) => t.id === id)
  const prevTopic = currentIndex > 0 ? topics[currentIndex - 1] : null
  const nextTopic = currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-red-900 dark:from-black dark:via-red-950 dark:to-red-900 light:from-white light:via-red-50 light:to-red-100 relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 dark:bg-red-500 light:bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-red-700 dark:bg-red-700 light:bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-red-600 dark:bg-red-600 light:bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 py-6 relative">
        {/* Navigation and Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="outline"
                className="text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
              </Button>
            </Link>
            {isCompleted && (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/50">
                <Award className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="text-white dark:text-white light:text-gray-900 hover:bg-white/10"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {theme === "dark" ? "light" : "dark"} mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link href="https://graduspp.com/resources" target="_blank">
              <Button
                variant="outline"
                className="text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
              >
                Resources
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="text-white dark:text-white light:text-gray-900 hover:bg-white/10"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <BookOpen className="h-4 w-4" />
            </Button>

            <Button
              variant={isStudying ? "default" : "outline"}
              size="sm"
              className={
                isStudying
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
              }
              onClick={() => setIsStudying(!isStudying)}
            >
              {isStudying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isStudying ? "Studying" : "Start Study"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className={`${showSidebar ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}>
            {/* Title Card */}
            <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-white dark:text-white light:text-gray-900">
                  {topic.title.split(":").slice(1).join(":").trim()}
                </CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                  {topic.title.split(":")[0].trim()} •{" "}
                  {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                  onClick={toggleCompletion}
                >
                  <div
                    className={`
                    h-4 w-4 mr-2 rounded-sm flex items-center justify-center
                    ${isCompleted ? "bg-red-500 border-none" : "border border-red-500/30"}
                  `}
                  >
                    {isCompleted && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  Mark as {isCompleted ? "incomplete" : "complete"}
                </Button>

                {isStudying && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50">
                    <Clock className="h-3 w-3 mr-1 animate-pulse" /> Study in progress
                  </Badge>
                )}
              </CardFooter>
            </Card>

            {/* Tabs for Content */}
            <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20 overflow-hidden">
              <Tabs defaultValue="video" onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="bg-black/30 dark:bg-black/30 light:bg-gray-100">
                    <TabsTrigger
                      value="video"
                      className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
                    >
                      Video
                    </TabsTrigger>
                    <TabsTrigger
                      value="resources"
                      className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
                    >
                      Resources
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="video" className="m-0">
                  <div className="relative aspect-video w-full">
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?mute=${isMuted ? 1 : 0}`}
                        title={topic.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <p className="text-gray-400">Video not available</p>
                      </div>
                    )}

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white/20"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-white/20"
                          onClick={() => {
                            const elem = document.documentElement
                            if (!isFullscreen) {
                              elem.requestFullscreen()
                            } else {
                              document.exitFullscreen()
                            }
                            setIsFullscreen(!isFullscreen)
                          }}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="m-0 p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white dark:text-white light:text-gray-900">
                      Additional Resources
                    </h3>

                    <Alert className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-red-500/30">
                      <ExternalLink className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-white dark:text-white light:text-gray-900">
                        External Resources
                      </AlertTitle>
                      <AlertDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                        Visit{" "}
                        <a
                          href="https://graduspp.com/resources"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:underline"
                        >
                          graduspp.com/resources
                        </a>{" "}
                        for additional learning materials, practice problems, and study guides.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-red-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-white dark:text-white light:text-gray-900">
                            Practice Problems
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 dark:text-gray-400 light:text-gray-500 text-sm">
                            Test your understanding with practice problems related to {topic.category}.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                          >
                            View Problems
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-red-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-white dark:text-white light:text-gray-900">
                            Formula Sheet
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 dark:text-gray-400 light:text-gray-500 text-sm">
                            Quick reference guide for formulas related to {topic.category}.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                          >
                            Download PDF
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation between topics */}
              <div className="p-4 border-t border-red-500/20 flex justify-between">
                {prevTopic ? (
                  <Link href={`/video/${prevTopic.id}`}>
                    <Button
                      variant="outline"
                      className="text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Topic
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextTopic && (
                  <Link href={`/video/${nextTopic.id}`}>
                    <Button
                      variant="outline"
                      className="text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                    >
                      Next Topic
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Study Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-white dark:text-white light:text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                    Study Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl text-white dark:text-white light:text-gray-900 font-medium">
                    {formatDuration(studyDuration)}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-1">
                    Time spent on this topic
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-white dark:text-white light:text-gray-900">
                    <ListChecks className="h-4 w-4 mr-2 text-red-500" />
                    Topic Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl text-white dark:text-white light:text-gray-900 font-medium">
                    {Math.round((completedTopics.length / topics.length) * 100)}%
                  </div>
                  <Progress
                    value={Math.round((completedTopics.length / topics.length) * 100)}
                    className="h-1 mt-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                  />
                </CardContent>
              </Card>

              <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center text-white dark:text-white light:text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                    Study Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl text-white dark:text-white light:text-gray-900 font-medium">
                    {studySessions}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 mt-1">
                    Total learning sessions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <motion.div
              layout
              className="lg:col-span-4 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Pomodoro Timer */}
              <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-gray-900">Study Timer</CardTitle>
                  <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                    {timerMode === "focus" ? "Focus Session" : "Break Time"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-mono text-white dark:text-white light:text-gray-900 text-center mb-4">
                    {formatTime(timerSeconds)}
                  </div>
                  <Progress
                    value={(timerSeconds / (timerMode === "focus" ? 1500 : 300)) * 100}
                    className="mb-4 h-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                  />
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Button
                    variant={timerActive ? "default" : "outline"}
                    className={
                      timerActive
                        ? "flex-1 bg-red-500 hover:bg-red-600 text-white"
                        : "flex-1 text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                    }
                    onClick={() => setTimerActive(!timerActive)}
                  >
                    {timerActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" /> Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white dark:text-white light:text-gray-900 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => {
                      setTimerActive(false)
                      setTimerSeconds(timerMode === "focus" ? 1500 : 300)
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Notes Section */}
              <Card className="bg-black/40 dark:bg-black/40 light:bg-white/90 backdrop-blur-lg border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-white dark:text-white light:text-gray-900">Notes</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white dark:text-white light:text-gray-900 hover:bg-red-500/10"
                    onClick={() => {
                      alert("Notes saved successfully!")
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </CardHeader>
                <Separator className="bg-red-500/20" />
                <CardContent className="pt-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes here..."
                    className="w-full h-[calc(100vh-600px)] min-h-[200px] p-3 rounded-lg bg-black/20 dark:bg-black/20 light:bg-white/80 border border-red-500/20 text-white dark:text-white light:text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
                    Notes are automatically saved to your browser's local storage.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

