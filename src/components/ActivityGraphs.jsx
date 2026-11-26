
import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useHealthData } from '../context/HealthDataContext'

function ActivityGraphs() {
  const { activityEntries } = useHealthData()

  const activityData = useMemo(() => {
    const totals = {}

    activityEntries.forEach(entry => {
      if (!totals[entry.activity]) {
        totals[entry.activity] = {
          activity: entry.activity,
          hours: 0
        }
      }

      totals[entry.activity].hours += entry.duration
    })

    return Object.values(totals)
      .map(entry => ({
        ...entry,
        hours: Number(entry.hours.toFixed(2))
      }))
      .sort((a, b) => b.hours - a.hours)
  }, [activityEntries])

  const weeklyData = useMemo(() => {
    const days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const key = date.toLocaleDateString('en-US')

      const dayEntries = activityEntries.filter(
        entry => new Date(entry.date).toLocaleDateString('en-US') === key
      )

      const hours = dayEntries.reduce(
        (sum, entry) => sum + entry.duration, 0
      )

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number(hours.toFixed(2))
      })
    }

    return days
  }, [activityEntries])

  const averageEnjoyment = activityEntries.length
    ? activityEntries.reduce((sum, entry) => sum + entry.enjoyment, 0) / activityEntries.length
    : 0

  const totalHours = activityEntries.reduce(
    (sum, entry) => sum + entry.duration, 0
  )

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        Recreational Activity Overview
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Hours</p>
          <p className="text-2xl font-bold text-indigo-700">
            {totalHours.toFixed(1)}
          </p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Enjoyment</p>
          <p className="text-2xl font-bold text-indigo-700">
            {averageEnjoyment.toFixed(1)} / 5
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">
          Time by Activity
        </h4>
        {activityData.length === 0 ? (
          <p className="text-sm text-gray-500 py-6">
            Record activities to see your breakdown.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#6366f1" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">
          Recreational Hours – Last 7 Days
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#10b981" name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ActivityGraphs
