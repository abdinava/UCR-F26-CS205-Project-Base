
import { useState } from 'react'
import { useHealthData } from '../context/HealthDataContext'

function ActivitiesTracker() {
  const { activityEntries, addActivityEntry, deleteActivityEntry } = useHealthData()

  const [activity, setActivity] = useState('')
  const [date, setDate] = useState(() => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  })
  const [duration, setDuration] = useState('')
  const [enjoyment, setEnjoyment] = useState(3)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (Number(duration) <= 0) return

    addActivityEntry({
      id: Date.now(),
      activity: activity.trim(),
      date,
      duration: Number(duration),
      enjoyment,
      notes
    })

    setActivity('')
    setDuration('')
    setEnjoyment(3)
    setNotes('')
  }

  const sortedEntries = [...activityEntries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Recreational Activities
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Hiking, reading, gaming..."
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="1.5"
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enjoyment
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setEnjoyment(rating)}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  enjoyment === rating
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            1 = Not Enjoyable, 5 = Extremely Enjoyable
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Anything worth remembering?"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Save Activity
        </button>
      </form>

      <div className="border-t border-gray-200 mt-8 pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Activity History
        </h3>

        {sortedEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No activities recorded yet. Start tracking!
          </p>
        ) : (
          <div className="space-y-3">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {entry.activity}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleString()} · {entry.duration} hours
                  </p>
                  <p className="text-sm text-gray-600">
                    Enjoyment: {entry.enjoyment}/5
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      {entry.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Delete this activity?')) {
                      deleteActivityEntry(entry.id)
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-medium ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivitiesTracker
