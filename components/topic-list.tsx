"use client"

import { useState } from "react"
import { Check, ExternalLink, ChevronDown, ChevronUp, Play, Clock, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Topic {
  id: string
  title: string
  category: string
  url: string
  completed: boolean
}

interface TopicListProps {
  topics: Topic[]
}

export default function TopicList({ topics }: TopicListProps) {
  const [completedTopics, setCompletedTopics] = useLocalStorage<string[]>("completedTopics", [])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [studyDurations] = useLocalStorage<Record<string, number>>("topicStudyDurations", {})

  // Group topics by section (e.g., "B: Algebra & Functions")
  const groupedTopics: Record<string, Topic[]> = {}
  topics.forEach((topic) => {
    const section = topic.title.split(":")[0].trim()
    if (!groupedTopics[section]) {
      groupedTopics[section] = []
    }
    groupedTopics[section].push(topic)
  })

  const toggleCompletion = (id: string) => {
    setCompletedTopics((prev) => {
      if (prev.includes(id)) {
        return prev.filter((topicId) => topicId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getSectionProgress = (section: string) => {
    const sectionTopics = groupedTopics[section]
    const completed = sectionTopics.filter((topic) => completedTopics.includes(topic.id)).length

    return {
      completed,
      total: sectionTopics.length,
      percentage: Math.round((completed / sectionTopics.length) * 100),
    }
  }

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return "Not started"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <div className="space-y-4">
      {Object.keys(groupedTopics).map((section) => {
        const isExpanded = expandedSections[section] !== false // Default to expanded
        const progress = getSectionProgress(section)

        return (
          <Card
            key={section}
            className="bg-black/20 dark:bg-black/20 light:bg-white/80 border-red-500/20 overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/5 transition-colors"
              onClick={() => toggleSection(section)}
            >
              <div className="flex items-center space-x-4">
                <h3 className="font-medium text-white dark:text-white light:text-gray-900">{section}</h3>
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50">
                  {progress.completed}/{progress.total}
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Progress
                  value={progress.percentage}
                  className="w-32 h-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                />
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400 dark:text-gray-400 light:text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-400 light:text-gray-600" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="p-0">
                    <ul className="divide-y divide-red-500/10">
                      {groupedTopics[section].map((topic) => {
                        const isCompleted = completedTopics.includes(topic.id)
                        const videoId = getYouTubeId(topic.url)
                        const studyTime = studyDurations[topic.id] || 0

                        return (
                          <motion.li key={topic.id} className="p-4 hover:bg-red-500/5" layout>
                            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                              <div className="flex items-start flex-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button onClick={() => toggleCompletion(topic.id)} className="flex-shrink-0 mt-1">
                                        <div
                                          className={cn(
                                            "h-5 w-5 rounded border flex items-center justify-center",
                                            isCompleted ? "bg-red-500 border-red-500" : "border-red-500/30",
                                          )}
                                        >
                                          {isCompleted && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Mark as {isCompleted ? "incomplete" : "complete"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <div className="ml-4 flex-1">
                                  <p
                                    className={cn(
                                      "text-sm",
                                      isCompleted
                                        ? "text-gray-400 dark:text-gray-400 light:text-gray-500"
                                        : "text-white dark:text-white light:text-gray-900",
                                    )}
                                  >
                                    {topic.title.split(":").slice(1).join(":").trim()}
                                  </p>
                                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDuration(studyTime)}
                                    {isCompleted && (
                                      <Badge className="ml-2 bg-red-500/10 text-red-500 border-red-500/50 text-xs py-0 h-4">
                                        <Award className="h-2.5 w-2.5 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 ml-9 md:ml-4">
                                {videoId && (
                                  <div className="relative w-32 h-18 rounded-lg overflow-hidden">
                                    <img
                                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                      alt="Video thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <Play className="h-8 w-8 text-white/90" />
                                    </div>
                                  </div>
                                )}

                                <div className="flex space-x-2">
                                  <Link href={`/video/${topic.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-white dark:text-white light:text-gray-900 hover:bg-red-500/10 border-red-500/30"
                                    >
                                      Focus View
                                    </Button>
                                  </Link>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <a
                                          href={topic.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Open in YouTube</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )
      })}
    </div>
  )
}

