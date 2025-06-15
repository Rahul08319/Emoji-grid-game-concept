"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

const EMOJI_POOL = ["👾", "🔓", "👻", "🤖", "💀", "⚡", "🔥", "💎", "🚀", "🎯", "🔮", "💊", "🧬", "⚙️", "🔋", "💻"]

const PATTERNS = [
  ["👾", "🔓", "👻"],
  ["🤖", "💀", "⚡"],
  ["🔥", "💎", "🚀"],
  ["🎯", "🔮", "💊"],
  ["🧬", "⚙️", "🔋"],
  ["👾", "🤖", "💻"],
  ["🔓", "💀", "🔥"],
  ["👻", "⚡", "💎"],
]

export default function Component() {
  const [grid, setGrid] = useState<string[]>([])
  const [currentPattern, setCurrentPattern] = useState<string[]>([])
  const [selectedEmojis, setSelectedEmojis] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameState, setGameState] = useState<"playing" | "won" | "lost" | "start">("start")
  const [glitchCells, setGlitchCells] = useState<Set<number>>(new Set())

  const generateGrid = useCallback(() => {
    const gridSize = Math.min(6 + level, 10)
    const totalCells = gridSize * gridSize
    const newGrid = Array(totalCells)
      .fill(null)
      .map(() => EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)])

    // Ensure the pattern exists in the grid
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
    const startIndex = Math.floor(Math.random() * (totalCells - pattern.length))

    // Place pattern horizontally if possible
    if (startIndex % gridSize <= gridSize - pattern.length) {
      pattern.forEach((emoji, i) => {
        newGrid[startIndex + i] = emoji
      })
    } else {
      // Place pattern vertically
      const validStart = Math.floor(Math.random() * (totalCells - pattern.length * gridSize))
      pattern.forEach((emoji, i) => {
        newGrid[validStart + i * gridSize] = emoji
      })
    }

    setGrid(newGrid)
    setCurrentPattern(pattern)
  }, [level])

  const startGame = () => {
    setScore(0)
    setLevel(1)
    setTimeLeft(30)
    setGameState("playing")
    setSelectedEmojis([])
    generateGrid()
  }

  const handleCellClick = (index: number) => {
    if (gameState !== "playing") return

    const newSelected = [...selectedEmojis, index]
    setSelectedEmojis(newSelected)

    if (newSelected.length === currentPattern.length) {
      const selectedPattern = newSelected.map((i) => grid[i])
      const isCorrect = selectedPattern.every((emoji, i) => emoji === currentPattern[i])

      if (isCorrect) {
        setScore((prev) => prev + level * 100)
        setLevel((prev) => prev + 1)
        setTimeLeft((prev) => Math.min(prev + 5, 60))
        setSelectedEmojis([])
        generateGrid()
      } else {
        // Trigger glitch effect
        setGlitchCells(new Set(newSelected))
        setTimeout(() => {
          setGlitchCells(new Set())
          setSelectedEmojis([])
        }, 500)
      }
    }
  }

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameState("lost")
    }
  }, [timeLeft, gameState])

  const gridSize = Math.min(6 + level - 1, 10)

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono relative overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-xs leading-3 whitespace-pre-wrap break-all animate-pulse">
          {Array(100)
            .fill(0)
            .map((_, i) => (
              <span key={i} className="text-green-500">
                {Math.random().toString(36).substring(2, 15)}
              </span>
            ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse">
            EMOJI HACKER
          </h1>
          <p className="text-cyan-300 text-sm">{"> DECODE THE GRID <"}</p>
        </div>

        {gameState === "start" && (
          <div className="text-center">
            <div className="bg-gray-900 border border-green-500 rounded-lg p-8 mb-8 shadow-lg shadow-green-500/20">
              <h2 className="text-2xl mb-4 text-green-400">MISSION BRIEFING</h2>
              <p className="mb-4 text-gray-300">Decode hidden emoji patterns in the matrix grid.</p>
              <p className="mb-4 text-gray-300">Find the sequence shown at the top before time runs out.</p>
              <p className="text-yellow-400 text-sm">Wrong guesses trigger system glitches!</p>
            </div>
            <Button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-black font-bold px-8 py-3 text-lg border border-green-400 shadow-lg shadow-green-500/30"
            >
              INITIATE HACK
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            <div className="flex justify-between items-center mb-6 bg-gray-900 border border-cyan-500 rounded-lg p-4 shadow-lg shadow-cyan-500/20">
              <div className="text-cyan-400">
                <span className="text-sm">SCORE:</span>
                <span className="text-xl font-bold ml-2 text-green-400">{score.toLocaleString()}</span>
              </div>
              <div className="text-cyan-400">
                <span className="text-sm">LEVEL:</span>
                <span className="text-xl font-bold ml-2 text-yellow-400">{level}</span>
              </div>
              <div className="text-cyan-400">
                <span className="text-sm">TIME:</span>
                <span
                  className={`text-xl font-bold ml-2 ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-green-400"}`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-cyan-300 mb-2">TARGET SEQUENCE:</p>
              <div className="flex justify-center gap-2 bg-gray-900 border border-purple-500 rounded-lg p-4 shadow-lg shadow-purple-500/20">
                {currentPattern.map((emoji, i) => (
                  <span key={i} className="text-3xl animate-pulse">
                    {emoji}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="grid gap-2 mx-auto mb-6 bg-gray-900 border border-green-500 rounded-lg p-4 shadow-lg shadow-green-500/20"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                maxWidth: `${gridSize * 60}px`,
              }}
            >
              {grid.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={`
                    w-12 h-12 text-2xl border rounded transition-all duration-200 flex items-center justify-center
                    ${
                      selectedEmojis.includes(index)
                        ? "border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50"
                        : "border-green-500 bg-green-500/10 hover:bg-green-500/20 hover:shadow-md hover:shadow-green-500/30"
                    }
                    ${glitchCells.has(index) ? "animate-pulse bg-red-500/30 border-red-500" : ""}
                  `}
                >
                  <span className={glitchCells.has(index) ? "animate-bounce" : ""}>{emoji}</span>
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Selected: {selectedEmojis.length}/{currentPattern.length}
              </p>
            </div>
          </>
        )}

        {gameState === "lost" && (
          <div className="text-center">
            <div className="bg-gray-900 border border-red-500 rounded-lg p-8 mb-8 shadow-lg shadow-red-500/20">
              <h2 className="text-3xl mb-4 text-red-400 animate-pulse">SYSTEM BREACH FAILED</h2>
              <p className="text-xl mb-4 text-gray-300">Final Score: {score.toLocaleString()}</p>
              <p className="text-lg mb-4 text-gray-300">Level Reached: {level}</p>
              <p className="text-yellow-400">The matrix has detected your intrusion...</p>
            </div>
            <Button
              onClick={startGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 text-lg border border-red-400 shadow-lg shadow-red-500/30"
            >
              RETRY HACK
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
