
import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useHealthData } from '../context/HealthDataContext'

function SleepGraphs() {
  const { sleepEntries } = useHealthData()

  const weeklyData = useMemo(() => {
    const days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const key = date.toLocaleDateString('en-US')
      const dayEntries = sleepEntries.filter(
        entry => new Date(entry.wakeTime).toLocaleDateString('en-US') === key
      )

      const avgDuration = dayEntries.length
        ? dayEntries.reduce((sum, entry) => sum + entry.duration, 0) / dayEntries.length
        : null

      const avgQuality = dayEntries.length
        ? dayEntries.reduce((sum, entry) => sum + entry.quality, 0) / dayEntries.length
        : null

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        duration: avgDuration === null ? null : Number(avgDuration.toFixed(2)),
        quality: avgQuality === null ? null : Number(avgQuality.toFixed(2))
      })
    }

    return days
  }, [sleepEntries])

  const averageDuration = sleepEntries.length
    ? sleepEntries.reduce((sum, entry) => sum + entry.duration, 0) / sleepEntries.length
    : 0

  const averageQuality = sleepEntries.length
    ? sleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / sleepEntries.length
    : 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        Sleep Overview
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Sleep</p>
          <p className="text-2xl font-bold text-indigo-700">
            {averageDuration.toFixed(1)} hrs
          </p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Quality</p>
          <p className="text-2xl font-bold text-indigo-700">
            {averageQuality.toFixed(1)} / 5
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">
          Sleep Duration – Last 7 Days
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="duration" fill="#6366f1" name="Sleep (hours)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">
          Sleep Quality – Last 7 Days
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="quality"
              stroke="#10b981"
              strokeWidth={2}
              connectNulls={false}
              name="Quality (1–5)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SleepGraphs
