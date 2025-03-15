"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { topics } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Check, ArrowLeft, Clock, Save, Play, Pause, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  // Ensure id is a string
  const id = typeof params.id === "string" ? params.id : params.id[0]

  const [topic, setTopic] = useState<{
    id: string
    title: string
    category: string
    url: string
    completed: boolean
  } | null>(null)
  
  const [notes, setNotes] = useLocalStorage(`notes-${id}`, "")
  const [completedTopics, setCompletedTopics] = useLocalStorage<string[]>("completedTopics", [])
  const [isCompleted, setIsCompleted] = useState(false)
  const [isStudying, setIsStudying] = useState(false)
  const [studyDuration, setStudyDuration] = useLocalStorage<number>(`study-duration-${id}`, 0)
  const [activeTab, setActiveTab] = useState("video")

  // Get YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  useEffect(() => {
    const foundTopic = topics.find((t) => t.id === id)
    if (foundTopic) {
      setTopic(foundTopic)
    } else {
      router.push("/")
    }
    setIsCompleted(completedTopics.includes(id))
  }, [id, router, completedTopics])

  const toggleCompletion = () => {
    const newCompletedTopics = completedTopics.includes(id)
      ? completedTopics.filter((topicId) => topicId !== id)
      : [...completedTopics, id]
    
    setCompletedTopics(newCompletedTopics)
    setIsCompleted(!isCompleted)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  const videoId = getYouTubeId(topic.url)
  const currentIndex = topics.findIndex((t) => t.id === id)
  const prevTopic = currentIndex > 0 ? topics[currentIndex - 1] : null
  const nextTopic = currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null

  // Random doodle elements to be placed
  const Doodle: React.FC<{ className: string }> = ({ className }) => {
    const doodles = ["★", "✎", "♡", "☺", "✓", "💩", "✰", "⌇", "○"]
    const randomDoodle = doodles[Math.floor(Math.random() * doodles.length)]
    
    return (
      <div className={`absolute text-gray-300 select-none ${className}`}>
        {randomDoodle}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Paper-like grid background */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1d1d1 1px, transparent 1px),
            linear-gradient(to bottom, #d1d1d1 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Random doodles */}
      {[...Array(15)].map((_, i) => (
        <Doodle 
          key={i} 
          className="absolute text-gray-500 opacity-70 rotate-45 top-10vh left-20vw text-24"
        />
      ))}

      <div className="container mx-auto px-4 py-6 relative">
        {/* Navigation and Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="text-gray-800 border-gray-300 hover:bg-gray-100">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
              </Button>
            </Link>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-600 border-green-300">
                <Check className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className={
              isStudying
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "text-gray-800 border-gray-300 hover:bg-gray-100"
            }
            onClick={() => setIsStudying(!isStudying)}
          >
            {isStudying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isStudying ? "Studying" : "Start Study"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-gray-800">
                  {topic.title.split(":").slice(1).join(":").trim()}
                </CardTitle>
                <div className="text-gray-500 text-sm">
                  {topic.title.split(":")[0].trim()} • {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-gray-800 border-gray-300 hover:bg-gray-100"
                  onClick={toggleCompletion}
                >
                  <div className={`h-4 w-4 mr-2 rounded-sm flex items-center justify-center ${isCompleted ? "bg-green-500 border-none" : "border border-gray-400"}`}>
                    {isCompleted && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  Mark as {isCompleted ? "incomplete" : "complete"}
                </Button>
              </CardHeader>
            </Card>

            {/* Tabs for Content */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <Tabs defaultValue="video" onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="video" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                      Resources
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="video" className="m-0">
                  <div className="relative aspect-video w-full">
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={topic.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-400">Video not available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="m-0 p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Additional Resources</h3>
                    <p className="text-gray-600">Visit our website for additional learning materials, practice problems, and study guides.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card className="bg-gray-50 border-gray-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-800">Practice Problems</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">Test your understanding with practice problems.</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-50 border-gray-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-800">Formula Sheet</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">Quick reference guide for formulas.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation between topics */}
              <div className="p-4 border-t border-gray-200 flex justify-between">
                {prevTopic ? (
                  <Link href={`/video/${prevTopic.id}`}>
                    <Button variant="outline" className="text-gray-800 border-gray-300 hover:bg-gray-100">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Topic
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextTopic && (
                  <Link href={`/video/${nextTopic.id}`}>
                    <Button variant="outline" className="text-gray-800 border-gray-300 hover:bg-gray-100">
                      Next Topic
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <CardTitle className="text-sm text-gray-800">Study Time</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl text-gray-800 font-medium">{formatDuration(studyDuration)}</div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-800">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl text-gray-800 font-medium">
                    {Math.round((completedTopics.length / topics.length) * 100)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes Section */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-gray-800">Notes</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-800 hover:bg-gray-100"
                  onClick={() => alert("Notes saved successfully!")}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </CardHeader>
              <Separator className="bg-gray-200" />
              <CardContent className="pt-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes here..."
                  className="w-full h-[300px] p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Notes are automatically saved to your browser.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
