import { useMemo } from 'react'
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useHealthData } from '../context/HealthDataContext'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TIMES_OF_DAY = [['Night', 0, 5], ['Morning', 5, 12], ['Afternoon', 12, 17], ['Evening', 17, 24]]

const dayKey = (value) => new Date(value).toLocaleDateString('en-US')
const sum = (nums) => nums.reduce((a, b) => a + b, 0)
const average = (nums) => (nums.length ? sum(nums) / nums.length : null)
const round = (n) => (n === null ? null : Number(n.toFixed(2)))
const maxBy = (items, fn) => (items.length ? items.reduce((a, b) => (fn(b) > fn(a) ? b : a)) : null)
const minBy = (items, fn) => (items.length ? items.reduce((a, b) => (fn(b) < fn(a) ? b : a)) : null)

// Hours since midnight; bedtimes after midnight count as 24+ so 11pm and 1am average to midnight
function clockHours(value, isBedtime) {
  const d = new Date(value)
  const h = d.getHours() + d.getMinutes() / 60
  return isBedtime && h < 12 ? h + 24 : h
}

function formatClock(hours) {
  const d = new Date()
  d.setHours(Math.floor(hours % 24), Math.round((hours % 1) * 60))
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// Average of valueFn per weekday, using dateFn to pick each item's day
function byWeekday(items, dateFn, valueFn, combine = average) {
  return WEEKDAYS.map((label, i) => {
    const values = items.filter(x => new Date(dateFn(x)).getDay() === i).map(valueFn)
    return { label, value: values.length ? round(combine(values)) : null }
  })
}

// Pearson correlation coefficient: -1 (opposite) to 1 (move together)
function correlation(points) {
  if (points.length < 3) return null
  const mx = average(points.map(p => p.x))
  const my = average(points.map(p => p.y))
  let num = 0, sx = 0, sy = 0
  for (const { x, y } of points) {
    num += (x - mx) * (y - my)
    sx += (x - mx) ** 2
    sy += (y - my) ** 2
  }
  return sx && sy ? num / Math.sqrt(sx * sy) : null
}

function describe(r, upPhrase, downPhrase) {
  if (r === null) return 'Not enough data yet. Needs at least 3 matching entries.'
  const size = Math.abs(r)
  const strength = size >= 0.7 ? 'Strong' : size >= 0.4 ? 'Moderate' : size >= 0.2 ? 'Weak' : null
  if (!strength) return `No real link so far (r = ${r.toFixed(2)}).`
  return `${strength} link (r = ${r.toFixed(2)}): ${r > 0 ? upPhrase : downPhrase}.`
}

function compare(active, rest, what, when) {
  if (active === null || rest === null) return 'Needs both active and rest days to compare.'
  const diff = active - rest
  if (Math.abs(diff) < 0.1) return `Your ${what} is about the same either way.`
  return `Your ${what} is ${Math.abs(diff).toFixed(2)} ${diff > 0 ? 'higher' : 'lower'} ${when}.`
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function StatTile({ label, value, detail }) {
  return (
    <div className="bg-indigo-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-indigo-700">{value ?? '—'}</p>
      {detail && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
    </div>
  )
}

function BarCard({ title, subtitle, data, color, name, domain = [0, 5], horizontal = false }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={horizontal ? Math.max(250, data.length * 40) : 250}>
        {horizontal ? (
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={domain} ticks={[0, 1, 2, 3, 4, 5]} />
            <YAxis type="category" dataKey="label" width={150} interval={0} />
            <Tooltip />
            <Bar dataKey="value" fill={color} name={name} />
          </BarChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" interval={0} />
            <YAxis domain={domain} ticks={domain[1] === 5 ? [0, 1, 2, 3, 4, 5] : undefined} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill={color} name={name} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}

function ScatterCard({ title, subtitle, data, x, y, color, xTickFormatter }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name={x.name} unit={x.unit} domain={x.domain ?? ['auto', 'auto']}
            tickFormatter={xTickFormatter} />
          <YAxis type="number" dataKey="y" name={y.name} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, label) => (label === x.name && xTickFormatter ? xTickFormatter(value) : value)} />
          <Scatter data={data} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  )
}

function Section({ title, hasData, emptyText, children }) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {hasData ? children : <Card title={title}><p className="text-gray-500">{emptyText}</p></Card>}
    </section>
  )
}

function InsightsView() {
  const { moodEntries, sleepEntries, activityEntries } = useHealthData()

  const mood = useMemo(() => {
    const moodsByDay = {}
    moodEntries.forEach(e => (moodsByDay[e.date] ??= []).push(e.mood))

    // Consecutive days with a mood log, ending today (or yesterday if today isn't logged yet)
    let streak = 0
    const cursor = new Date()
    if (!moodsByDay[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
    while (moodsByDay[dayKey(cursor)]) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }

    const weekday = byWeekday(moodEntries, e => e.timestamp, e => e.mood)
    const timeOfDay = TIMES_OF_DAY.map(([label, start, end]) => ({
      label,
      value: round(average(moodEntries
        .filter(e => { const h = new Date(e.timestamp).getHours(); return h >= start && h < end })
        .map(e => e.mood)))
    }))

    return {
      moodsByDay,
      streak,
      weekday,
      timeOfDay,
      bestWeekday: maxBy(weekday.filter(d => d.value !== null), d => d.value),
      bestTime: maxBy(timeOfDay.filter(d => d.value !== null), d => d.value),
      distribution: [1, 2, 3, 4, 5].map(m => ({
        label: String(m),
        value: moodEntries.filter(e => e.mood === m).length
      }))
    }
  }, [moodEntries])

  const sleep = useMemo(() => {
    const bedtimes = sleepEntries.map(s => clockHours(s.bedtime, true))
    const avgBedtime = average(bedtimes)
    const bedtimeSpread = bedtimes.length > 1
      ? Math.sqrt(average(bedtimes.map(b => (b - avgBedtime) ** 2))) * 60
      : null
    const weekday = byWeekday(sleepEntries, s => s.wakeTime, s => s.duration)
    const bedtimePoints = sleepEntries.map(s => ({ x: clockHours(s.bedtime, true), y: s.quality }))

    return {
      avgDuration: average(sleepEntries.map(s => s.duration)),
      avgQuality: average(sleepEntries.map(s => s.quality)),
      avgBedtime,
      avgWake: average(sleepEntries.map(s => clockHours(s.wakeTime, false))),
      bedtimeSpread,
      longest: maxBy(sleepEntries, s => s.duration),
      shortest: minBy(sleepEntries, s => s.duration),
      goodNights: sleepEntries.filter(s => s.duration >= 7).length,
      bestWeekday: maxBy(weekday.filter(d => d.value !== null), d => d.value),
      weekday,
      bedtimePoints,
      bedtimeR: correlation(bedtimePoints)
    }
  }, [sleepEntries])

  const activity = useMemo(() => {
    const totals = {}
    activityEntries.forEach(a => {
      const t = (totals[a.activity] ??= { name: a.activity, hours: 0, enjoyment: [] })
      t.hours += a.duration
      t.enjoyment.push(a.enjoyment)
    })
    const types = Object.values(totals)
    const weekday = byWeekday(activityEntries, a => a.date, a => a.duration, sum)
    const lengthPoints = activityEntries.map(a => ({ x: a.duration, y: a.enjoyment }))

    return {
      totalHours: sum(activityEntries.map(a => a.duration)),
      typeCount: types.length,
      mostTime: maxBy(types, t => t.hours),
      mostFun: maxBy(types, t => average(t.enjoyment)),
      longestSession: maxBy(activityEntries, a => a.duration),
      busiestWeekday: maxBy(weekday.filter(d => d.value !== null), d => d.value),
      weekday,
      enjoymentByType: types
        .map(t => ({ label: t.name, value: round(average(t.enjoyment)) }))
        .sort((a, b) => b.value - a.value),
      lengthPoints,
      lengthR: correlation(lengthPoints)
    }
  }, [activityEntries])

  const connections = useMemo(() => {
    const dayMood = (key) => (mood.moodsByDay[key] ? average(mood.moodsByDay[key]) : null)
    const activeDays = new Set(activityEntries.map(a => dayKey(a.date)))

    // Each night's sleep is paired with the mood of the day you woke up
    const sleepMood = sleepEntries
      .map(s => ({ hours: s.duration, quality: s.quality, mood: dayMood(dayKey(s.wakeTime)) }))
      .filter(p => p.mood !== null)

    const moodDays = Object.keys(mood.moodsByDay)
    const activeMood = average(moodDays.filter(d => activeDays.has(d)).map(dayMood))
    const restMood = average(moodDays.filter(d => !activeDays.has(d)).map(dayMood))

    // A night belongs to the evening it started: shifting bedtime back 6h maps 1am to the previous day
    const followsActiveDay = (s) => activeDays.has(dayKey(new Date(s.bedtime).getTime() - 6 * 3600000))
    const activeSleep = average(sleepEntries.filter(followsActiveDay).map(s => s.quality))
    const restSleep = average(sleepEntries.filter(s => !followsActiveDay(s)).map(s => s.quality))

    const hoursPoints = sleepMood.map(p => ({ x: p.hours, y: round(p.mood) }))
    const qualityPoints = sleepMood.map(p => ({ x: p.quality, y: round(p.mood) }))

    return {
      hoursPoints,
      qualityPoints,
      hoursR: correlation(hoursPoints),
      qualityR: correlation(qualityPoints),
      moodCompare: [{ label: 'Active days', value: round(activeMood) }, { label: 'Rest days', value: round(restMood) }],
      moodText: compare(activeMood, restMood, 'average mood', 'on active days'),
      sleepCompare: [{ label: 'After active days', value: round(activeSleep) }, { label: 'After rest days', value: round(restSleep) }],
      sleepText: compare(activeSleep, restSleep, 'sleep quality', 'after active days')
    }
  }, [mood, sleepEntries, activityEntries])

  if (moodEntries.length + sleepEntries.length + activityEntries.length === 0) {
    return (
      <Card title="Insights">
        <p className="text-gray-500 text-center py-8">
          Nothing to analyze yet. Log some moods, sleep, and activities to unlock your stats!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <Section title="Mood" hasData={moodEntries.length > 0} emptyText="Log a mood to see mood stats.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile label="Mood logs" value={moodEntries.length} />
          <StatTile label="Current streak" value={`${mood.streak} day${mood.streak === 1 ? '' : 's'}`}
            detail={mood.streak ? 'Keep it going!' : 'Log a mood today to start one'} />
          <StatTile label="Happiest weekday" value={mood.bestWeekday?.label}
            detail={mood.bestWeekday && `avg mood ${mood.bestWeekday.value}`} />
          <StatTile label="Happiest time of day" value={mood.bestTime?.label}
            detail={mood.bestTime && `avg mood ${mood.bestTime.value}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BarCard title="Mood breakdown" subtitle="Times you've logged each mood" data={mood.distribution}
            color="#6366f1" name="Times logged" domain={[0, 'auto']} />
          <BarCard title="Mood by weekday" data={mood.weekday} color="#8b5cf6" name="Average mood" />
          <BarCard title="Mood by time of day" subtitle="Night 12–5am · Morning 5–12 · Afternoon 12–5 · Evening 5–12"
            data={mood.timeOfDay} color="#ec4899" name="Average mood" />
        </div>
      </Section>

      <Section title="Sleep" hasData={sleepEntries.length > 0} emptyText="Log a night of sleep to see sleep stats.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile label="Average sleep" value={`${sleep.avgDuration?.toFixed(1)} hrs`}
            detail={`avg quality ${sleep.avgQuality?.toFixed(1)} / 5`} />
          <StatTile label="Typical bedtime" value={sleep.avgBedtime !== null && formatClock(sleep.avgBedtime)} />
          <StatTile label="Typical wake-up" value={sleep.avgWake !== null && formatClock(sleep.avgWake)} />
          <StatTile label="Bedtime consistency"
            value={sleep.bedtimeSpread === null ? null : `± ${Math.round(sleep.bedtimeSpread)} min`}
            detail={sleep.bedtimeSpread === null ? 'Needs 2+ nights' : 'smaller = more regular schedule'} />
          <StatTile label="Longest sleep" value={`${sleep.longest?.duration} hrs`}
            detail={sleep.longest && `woke up ${dayKey(sleep.longest.wakeTime)}`} />
          <StatTile label="Shortest sleep" value={`${sleep.shortest?.duration} hrs`}
            detail={sleep.shortest && `woke up ${dayKey(sleep.shortest.wakeTime)}`} />
          <StatTile label="Nights with 7+ hours" value={`${sleep.goodNights} / ${sleepEntries.length}`}
            detail={`${Math.round((sleep.goodNights / sleepEntries.length) * 100)}% of nights`} />
          <StatTile label="Best-rested weekday" value={sleep.bestWeekday?.label}
            detail={sleep.bestWeekday && `avg ${sleep.bestWeekday.value} hrs (by wake-up day)`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarCard title="Sleep by weekday" subtitle="Average hours, by the day you woke up" data={sleep.weekday}
            color="#6366f1" name="Average hours" domain={[0, 'auto']} />
          <ScatterCard
            title="Does bedtime affect sleep quality?"
            subtitle={describe(sleep.bedtimeR, 'later bedtimes tend to mean better sleep', 'earlier bedtimes tend to mean better sleep')}
            data={sleep.bedtimePoints} color="#0ea5e9"
            x={{ name: 'Bedtime' }} y={{ name: 'Sleep quality' }} xTickFormatter={formatClock} />
        </div>
      </Section>

      <Section title="Activities" hasData={activityEntries.length > 0} emptyText="Log an activity to see activity stats.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile label="Total active time" value={`${activity.totalHours.toFixed(1)} hrs`}
            detail={`${activityEntries.length} session${activityEntries.length === 1 ? '' : 's'}`} />
          <StatTile label="Activities tried" value={activity.typeCount}
            detail={`avg session ${(activity.totalHours / activityEntries.length).toFixed(1)} hrs`} />
          <StatTile label="Most time spent on" value={activity.mostTime?.name}
            detail={activity.mostTime && `${activity.mostTime.hours.toFixed(1)} hrs total`} />
          <StatTile label="Most enjoyed" value={activity.mostFun?.name}
            detail={activity.mostFun && `avg enjoyment ${average(activity.mostFun.enjoyment).toFixed(1)} / 5`} />
          <StatTile label="Longest session" value={`${activity.longestSession?.duration} hrs`}
            detail={activity.longestSession && `${activity.longestSession.activity} on ${dayKey(activity.longestSession.date)}`} />
          <StatTile label="Most active weekday" value={activity.busiestWeekday?.label}
            detail={activity.busiestWeekday && `${activity.busiestWeekday.value} hrs total`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BarCard title="Enjoyment by activity" subtitle="Average enjoyment rating" data={activity.enjoymentByType}
            color="#f59e0b" name="Avg enjoyment" horizontal />
          <BarCard title="Active hours by weekday" subtitle="Total hours on each day" data={activity.weekday}
            color="#10b981" name="Hours" domain={[0, 'auto']} />
          <ScatterCard
            title="Are longer sessions more fun?"
            subtitle={describe(activity.lengthR, 'longer sessions tend to be more enjoyable', 'shorter sessions tend to be more enjoyable')}
            data={activity.lengthPoints} color="#f97316"
            x={{ name: 'Duration', unit: ' h' }} y={{ name: 'Enjoyment' }} />
        </div>
      </Section>

      <Section title="Connections" hasData={sleepEntries.length > 0 || activityEntries.length > 0}
        emptyText="Log sleep or activities alongside your moods to discover how they connect.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScatterCard
            title="Does sleep length affect your mood?"
            subtitle={describe(connections.hoursR, 'more sleep tends to mean a better mood', 'more sleep tends to mean a lower mood')}
            data={connections.hoursPoints} color="#6366f1"
            x={{ name: 'Sleep', unit: ' h' }} y={{ name: 'Mood' }} />
          <ScatterCard
            title="Does sleep quality affect your mood?"
            subtitle={describe(connections.qualityR, 'better sleep tends to mean a better mood', 'better sleep tends to mean a lower mood')}
            data={connections.qualityPoints} color="#10b981"
            x={{ name: 'Sleep quality', domain: [1, 5] }} y={{ name: 'Mood' }} />
          <BarCard title="Do activities lift your mood?" subtitle={connections.moodText}
            data={connections.moodCompare} color="#f59e0b" name="Average mood" />
          <BarCard title="Do activities help you sleep?" subtitle={connections.sleepText}
            data={connections.sleepCompare} color="#0ea5e9" name="Avg sleep quality" />
        </div>
      </Section>
    </div>
  )
}

export default InsightsView
