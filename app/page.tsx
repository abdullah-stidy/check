"use client"

import { useEffect, useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TopicList from "@/components/topic-list"
import { topics } from "@/lib/data"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, GraduationCap, Brain, ExternalLink, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ErrorBoundary from "@/components/error-boundary"

// Random doodle element as a memo to prevent re-renders
const Doodle = ({ style }) => {
  const doodles = ["★", "☆", "✎", "♡", "💩", "✏️", "✌️", "✨"]
  // Use a ref to keep the doodle consistent between renders
  const doodleRef = useRef(doodles[Math.floor(Math.random() * doodles.length)])
  const rotationRef = useRef(`rotate(${Math.random() * 360}deg)`)
  const sizeRef = useRef(`${Math.random() * 1.5 + 0.8}rem`)
  
  return (
    <div 
      className="absolute text-gray-200 opacity-30 select-none"
      style={{ 
        transform: rotationRef.current,
        fontSize: sizeRef.current,
        ...style
      }}
    >
      {doodleRef.current}
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  // Reference the initial value and avoid direct manipulation in render
  const activeTabRef = useRef("algebra")
  const [activeTab, setActiveTab] = useLocalStorage("activeTab", "algebra")
  const [completedTopics] = useLocalStorage("completedTopics", [])
  const [totalStudyTime] = useLocalStorage("totalStudyTime", 0)
  const [studySessions] = useLocalStorage("studySessions", 0)
  const { theme, setTheme } = useTheme()
  
  // Generate doodle positions once and memoize them
  const doodlePositions = useRef(
    Array.from({ length: 15 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }))
  )

  // Set mounted state only once
  useEffect(() => {
    setMounted(true)
    // Update the ref with localStorage value to avoid sync issues
    if (activeTab) {
      activeTabRef.current = activeTab
    }
  }, [])

  // Handle tab change safely
  const handleTabChange = (value) => {
    if (value !== activeTab) {
      setActiveTab(value)
      activeTabRef.current = value
    }
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null
  }

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-white relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />
        
        {/* Random doodles - using memo pattern to avoid rerenders */}
        {doodlePositions.current.map((pos, i) => (
          <Doodle key={i} style={{ top: pos.top, left: pos.left }} />
        ))}

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <GraduationCap className="h-8 w-8 text-gray-800" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                A-Level Mathematics
              </h1>
            </motion.div>
            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-800"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Link href="https://graduspp.com/resources" target="_blank">
                <Button
                  variant="outline"
                  className="text-white-800 border-gray-300 hover:bg-gray-100 hover:text-black"
                >
                  Resources
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-gray-800">
                  <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                  Topics Progress
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round((completedTopics.length / topics.length) * 100)}%
                  </p>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                    {completedTopics.length} of {topics.length}
                  </Badge>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-800 transition-all duration-500"
                    style={{ width: `${Math.round((completedTopics.length / topics.length) * 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-gray-800">
                  <Brain className="h-5 w-5 mr-2 text-gray-600" />
                  Study Time
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Total time spent learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800">
                  {formatStudyTime(totalStudyTime)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Keep going to improve your knowledge
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-gray-800">
                  <GraduationCap className="h-5 w-5 mr-2 text-gray-600" />
                  Study Sessions
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Your learning consistency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800">{studySessions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Regular practice leads to mastery
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4 md:p-6">
              <Tabs 
                defaultValue={activeTabRef.current} 
                value={activeTab}
                onValueChange={handleTabChange} 
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-9 bg-gray-50 p-1 rounded-lg mb-6">
                  {[
                    "algebra",
                    "logarithmic",
                    "trigonometry",
                    "differentiation",
                    "integration",
                    "numerical",
                    "vectors",
                    "differential",
                    "complex",
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="data-[state=active]:bg-white data-[state=active]:text-gray-800 text-gray-500 capitalize text-xs md:text-sm"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {[
                  { value: "algebra", title: "3.1 Algebra" },
                  { value: "logarithmic", title: "3.2 Logarithmic & Exponential Functions" },
                  { value: "trigonometry", title: "3.3 Trigonometry" },
                  { value: "differentiation", title: "3.4 Differentiation" },
                  { value: "integration", title: "3.5 Integration" },
                  { value: "numerical", title: "3.6 Numerical Solution of Equations" },
                  { value: "vectors", title: "3.7 Vectors" },
                  { value: "differential", title: "3.8 Differential Equations" },
                  { value: "complex", title: "3.9 Complex Numbers" },
                ].map((section) => (
                  <TabsContent key={section.value} value={section.value}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-gray-600 mr-2">{section.title}</span>
                    </h2>
                    <TopicList topics={topics.filter((topic) => topic.category === section.value)} />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} A-Level Mathematics Resource</p>
          </footer>
        </div>
      </main>
    </ErrorBoundary>
  )
}