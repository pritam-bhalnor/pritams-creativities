import React, { ChangeEvent } from 'react';
import { FormData } from '../types';

interface CalculatorFormProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setMeasureFrom: (side: 'left' | 'right') => void;
  calculateCuts: () => void;
  loading: boolean;
  error: string;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  formData,
  handleChange,
  setMeasureFrom,
  calculateCuts,
  loading,
  error
}) => {
  return (
    <section className="lg:col-span-4 space-y-6">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
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
                value={(formData as any)[field.name]}
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
                    onClick={() => setMeasureFrom(side as 'left' | 'right')}
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
  );
};
