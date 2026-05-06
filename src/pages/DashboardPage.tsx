import { useState } from 'react'

interface HabitEntry {
  id: string
  name: string
  completed: boolean
}

const DEFAULT_HABITS: HabitEntry[] = [
  { id: '1', name: 'Morning Workout', completed: false },
  { id: '2', name: '8 Hours Sleep', completed: false },
  { id: '3', name: 'Track Nutrition', completed: false },
  { id: '4', name: 'Drink 2L Water', completed: false },
]

export function DashboardPage() {
  const [habits, setHabits] = useState<HabitEntry[]>(DEFAULT_HABITS)
  const [newHabit, setNewHabit] = useState('')

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    )
  }

  const addHabit = () => {
    if (!newHabit.trim()) return
    setHabits((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newHabit.trim(), completed: false },
    ])
    setNewHabit('')
  }

  const completedCount = habits.filter((h) => h.completed).length

  return (
    <div className="space-y-6">
      <section className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Today&apos;s Progress
        </h2>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-indigo-400">
            {completedCount}/{habits.length}
          </span>
          <span className="text-sm text-gray-500 pb-1">habits completed</span>
        </div>
        <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Daily Habits
        </h2>
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li key={habit.id}>
              <button
                type="button"
                onClick={() => toggleHabit(habit.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  habit.completed
                    ? 'bg-indigo-950/50 border-indigo-700 text-indigo-300'
                    : 'bg-gray-900 border-gray-800 text-gray-200 hover:border-gray-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    habit.completed ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600'
                  }`}
                >
                  {habit.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={habit.completed ? 'line-through opacity-60' : ''}>
                  {habit.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          placeholder="Add a new habit..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={addHabit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add
        </button>
      </section>
    </div>
  )
}
