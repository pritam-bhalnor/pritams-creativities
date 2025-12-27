import { useState, useEffect } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    leftSideLength: '',
    rightSideLength: '',
    bottomBaseLength: '',
    topSlantLength: '',
    numberOfPartitions: '',
    measureFrom: 'left'
  });
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check system preference or local storage
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateCuts = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    // Basic validation
    const inputs = {
      leftSideLength: parseFloat(formData.leftSideLength),
      rightSideLength: parseFloat(formData.rightSideLength),
      bottomBaseLength: parseFloat(formData.bottomBaseLength),
      topSlantLength: parseFloat(formData.topSlantLength),
      numberOfPartitions: parseInt(formData.numberOfPartitions),
      measureFrom: formData.measureFrom
    };

    try {
      const response = await fetch('http://localhost:5000/calculate-cuts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans selection:bg-primary-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Pritam's Creativities
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">
              Advanced Geometric Partitioning Tool
            </p>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-slate-700 text-2xl"
            aria-label="Toggle Theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">📐</span>
                Dimensions
              </h2>
              
              <div className="space-y-5">
                {[
                  { label: 'Left Side (a)', name: 'leftSideLength', placeholder: 'e.g. 220' },
                  { label: 'Right Side (b)', name: 'rightSideLength', placeholder: 'e.g. 170' },
                  { label: 'Bottom Base (L)', name: 'bottomBaseLength', placeholder: 'e.g. 180' },
                  { label: 'Top Slant (l)', name: 'topSlantLength', placeholder: 'e.g. 200' },
                  { label: 'Partitions (n)', name: 'numberOfPartitions', placeholder: 'e.g. 4' },
                ].map((field) => (
                  <div key={field.name} className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 transition-colors">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                ))}

                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Measure From
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['left', 'right'].map((side) => (
                        <button
                          key={side}
                          onClick={() => setFormData({ ...formData, measureFrom: side })}
                          className={`py-3 px-4 rounded-xl font-medium capitalize transition-all ${
                            formData.measureFrom === side
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                              : 'bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {side} Side
                        </button>
                      ))}
                    </div>
                </div>

                <button
                  onClick={calculateCuts}
                  disabled={loading}
                  className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-2xl shadow-primary-500/20 transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Calculate Cuts ✨'}
                </button>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400 dark:text-slate-600 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl min-h-[400px]">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-medium">Enter dimensions to see results</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
                    <p className="opacity-80 font-medium mb-1">Total Area</p>
                    <div className="text-3xl font-bold tracking-tight">
                      {results.totalArea.sqFt} <span className="text-lg opacity-80 font-normal">sq ft</span>
                    </div>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur-sm">
                      {results.totalArea.guntha} Guntha
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                    <p className="opacity-80 font-medium mb-1">Partition Area</p>
                    <div className="text-3xl font-bold tracking-tight">
                       {results.partitions[0].area.sqFt} <span className="text-lg opacity-80 font-normal">sq ft</span>
                    </div>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur-sm">
                       {results.partitions[0].area.guntha} Guntha
                    </div>
                  </div>
                </div>

                {/* Partitions Table */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Partitions Breakdown</h3>
                    <span className="text-sm px-3 py-1 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium">{results.partitions.length} Sections</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                          <th className="px-8 py-4 font-semibold">#</th>
                          <th className="px-8 py-4 font-semibold">Left Side</th>
                          <th className="px-8 py-4 font-semibold">Right Side</th>
                          <th className="px-8 py-4 font-semibold">Bottom</th>
                          <th className="px-8 py-4 font-semibold">Top</th>
                          <th className="px-8 py-4 font-semibold text-right">Area (sq ft)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {results.partitions.map((part) => (
                          <tr key={part.partitionIndex} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-8 py-5 font-bold text-primary-600 dark:text-primary-400">
                              {part.partitionIndex}
                            </td>
                            <td className="px-8 py-5 text-gray-700 dark:text-gray-300">{part.leftSide}</td>
                            <td className="px-8 py-5 text-gray-700 dark:text-gray-300">{part.rightSide}</td>
                            <td className="px-8 py-5 text-gray-700 dark:text-gray-300">{part.bottomSide}</td>
                            <td className="px-8 py-5 text-gray-700 dark:text-gray-300">{part.topSide}</td>
                            <td className="px-8 py-5 text-right font-medium text-gray-900 dark:text-white">
                              {part.area.sqFt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cuts Details */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Cut Line Coordinates</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                          <th className="px-8 py-4 font-semibold">Cut #</th>
                          <th className="px-8 py-4 font-semibold">Length</th>
                          <th className="px-8 py-4 font-semibold">Dist from Start (x)</th>
                          <th className="px-8 py-4 font-semibold">Dist on Top (y)</th>
                          <th className="px-8 py-4 font-semibold text-right">Initiated From</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {results.cuts.map((cut) => (
                          <tr key={cut.k} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-8 py-5 font-bold text-purple-600 dark:text-purple-400">
                              {cut.k}
                            </td>
                            <td className="px-8 py-5 font-mono text-gray-700 dark:text-gray-300">{cut.length}</td>
                            <td className="px-8 py-5 text-gray-600 dark:text-gray-400">{cut.x}</td>
                            <td className="px-8 py-5 text-gray-600 dark:text-gray-400">{cut.y}</td>
                            <td className="px-8 py-5 text-right text-gray-500 dark:text-gray-400">
                              {cut.initiatedFrom}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
