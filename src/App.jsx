
// import { useState } from 'react'
// import { HealthDataProvider } from './context/HealthDataContext'
// import MoodTracker from './modules/MoodTracker'
// import SleepTracker from './modules/SleepTracker'
// import ActivitiesTracker from './modules/ActivitiesTracker'
// import DailyGraph from './components/DailyGraph'
// import WeeklyGraph from './components/WeeklyGraph'
// import SleepGraphs from './components/SleepGraphs'
// import ActivityGraphs from './components/ActivityGraphs'
// import HistoryView from './components/HistoryView'
// import FileManager from './components/FileManager'

// function App() {
//   const [activeTab, setActiveTab] = useState('dashboard')

//   return (
//     <HealthDataProvider>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="container mx-auto px-4 py-8 max-w-7xl">
//           <header className="mb-8">
//             <h1 className="text-4xl font-bold text-gray-800 mb-2">
//               Mood Tracking App
//             </h1>
//             <p className="text-gray-600">
//               Track how you feel over time with a simple 1–5 mood scale
//             </p>
//           </header>

//           <div className="mb-6 border-b border-gray-200">
//             <nav className="flex space-x-8">
//               {[
//                 ['dashboard', 'Dashboard'],
//                 ['history', 'History'],
//                 ['sleep', 'Sleep'],
//                 ['activities', 'Activities'],
//                 ['data', 'Data Management']
//               ].map(([tab, label]) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === tab
//                       ? 'border-indigo-500 text-indigo-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {activeTab === 'dashboard' && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <MoodTracker />
//               <DailyGraph />
//               <WeeklyGraph />
//               <SleepGraphs />
//               <ActivityGraphs />
//             </div>
//           )}

//           {activeTab === 'history' && <HistoryView />}
//           {activeTab === 'sleep' && <SleepTracker />}
//           {activeTab === 'activities' && <ActivitiesTracker />}
//           {activeTab === 'data' && <FileManager />}
//         </div>
//       </div>
//     </HealthDataProvider>
//   )
// }

// export default App















import { useState } from 'react'
import { HealthDataProvider } from './context/HealthDataContext'
import MoodTracker from './modules/MoodTracker'
import SleepTracker from './modules/SleepTracker'
import ActivitiesTracker from './modules/ActivitiesTracker'
import DailyGraph from './components/DailyGraph'
import WeeklyGraph from './components/WeeklyGraph'
import SleepGraphs from './components/SleepGraphs'
import ActivityGraphs from './components/ActivityGraphs'
import HistoryView from './components/HistoryView'
import FileManager from './components/FileManager'

import InsightsView from './components/InsightsView'


function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  )

  const toggleDarkMode = () => {
    setDarkMode(current => {
      localStorage.setItem('darkMode', String(!current))
      return !current
    })
  }

  return (
    <HealthDataProvider>
      <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Mood Tracking App
              </h1>
              <p className="text-gray-600">
                Track how you feel over time with a simple 1–5 mood scale
              </p>
            </div>

            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-lg bg-white text-gray-800 shadow hover:bg-gray-100"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </header>

          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                ['dashboard', 'Dashboard'],
                ['sleep', 'Sleep'],
                ['activities', 'Activities'],
                ['insights', 'Insights'],
                ['history', 'History'],
                ['data', 'Data Management']
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodTracker />
              <DailyGraph />
              <WeeklyGraph />
              <SleepGraphs />
              <ActivityGraphs />
            </div>
          )}

          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'insights' && <InsightsView />}
          {activeTab === 'sleep' && <SleepTracker />}
          {activeTab === 'activities' && <ActivitiesTracker />}
          {activeTab === 'data' && <FileManager />}
        </div>
      </div>
    </HealthDataProvider>
  )
}

export default App
