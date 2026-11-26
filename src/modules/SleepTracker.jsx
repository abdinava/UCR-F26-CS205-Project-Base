
import { useState } from 'react'
import { useHealthData } from '../context/HealthDataContext'

function SleepTracker() {
  const { sleepEntries, addSleepEntry, deleteSleepEntry } = useHealthData()

  const [bedtime, setBedtime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [quality, setQuality] = useState(3)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const duration = (new Date(wakeTime) - new Date(bedtime)) / 3600000

    if (duration <= 0) {
      setError('Wake time must be later than bedtime.')
      return
    }

    addSleepEntry({
      id: Date.now(),
      bedtime,
      wakeTime,
      duration: Number(duration.toFixed(2)),
      quality,
      notes
    })

    setBedtime('')
    setWakeTime('')
    setQuality(3)
    setNotes('')
  }

  const sortedEntries = [...sleepEntries].sort(
    (a, b) => new Date(b.bedtime) - new Date(a.bedtime)
  )

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Sleep Tracker
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedtime
            </label>
            <input
              type="datetime-local"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wake Time
            </label>
            <input
              type="datetime-local"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sleep Quality
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setQuality(rating)}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  quality === rating
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            1 = Very Poor, 5 = Excellent
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
            placeholder="Anything worth noting about your sleep?"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Save Sleep Entry
        </button>
      </form>

      <div className="border-t border-gray-200 mt-8 pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Sleep History
        </h3>

        {sortedEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No sleep entries yet. Start tracking your sleep!
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
                    {new Date(entry.bedtime).toLocaleString()} –{' '}
                    {new Date(entry.wakeTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {entry.duration} hours · Quality: {entry.quality}/5
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      {entry.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Delete this sleep entry?')) {
                      deleteSleepEntry(entry.id)
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

export default SleepTracker
