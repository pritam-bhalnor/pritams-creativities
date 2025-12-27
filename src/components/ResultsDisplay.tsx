import React from 'react';
import { Results } from '../types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface ResultsDisplayProps {
  results: Results | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  return (
    <section className="lg:col-span-8 flex flex-col gap-6">
      {!results ? (
        <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400 dark:text-slate-600 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl min-h-[400px]">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl font-medium">Enter dimensions to see results</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-emerald-500/20">
              <p className="opacity-80 font-medium mb-1 text-xs sm:text-base">Total Area</p>
              <div className="text-xl sm:text-3xl font-bold tracking-tight">
                {results.totalArea.sqFt} <span className="text-sm sm:text-lg opacity-80 font-normal">sq ft</span>
              </div>
              <div className="mt-1 sm:mt-2 inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 text-xs sm:text-sm font-medium backdrop-blur-sm">
                {results.totalArea.guntha} Guntha
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-blue-500/20">
              <p className="opacity-80 font-medium mb-1 text-xs sm:text-base">Partition Area</p>
              <div className="text-xl sm:text-3xl font-bold tracking-tight">
                  {results.partitions[0].area.sqFt} <span className="text-sm sm:text-lg opacity-80 font-normal">sq ft</span>
              </div>
              <div className="mt-1 sm:mt-2 inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 text-xs sm:text-sm font-medium backdrop-blur-sm">
                  {results.partitions[0].area.guntha} Guntha
              </div>
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["cuts", "partitions"]} className="space-y-4">
            {/* Cuts Details Accordion */}
            <AccordionItem value="cuts" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white">Cut Line Coordinates</h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                 {/* Mobile Card View */}
                 <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {results.cuts.map((cut) => (
                    <div key={cut.k} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col gap-3">
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">Cut #{cut.k}</span>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-500">{cut.initiatedFrom}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl">
                          <div>
                             <div className="text-xs text-gray-500 uppercase">Bottom</div>
                             <div className="font-mono font-medium text-lg">{cut.x}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-500 uppercase">Top</div>
                             <div className="font-mono font-medium text-lg">{cut.y}</div>
                          </div>
                       </div>
                    </div>
                  ))}
                 </div>

                {/* Desktop Table */}
                <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/50">
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
              </AccordionContent>
            </AccordionItem>

            {/* Partitions Breakdown Accordion */}
            <AccordionItem value="partitions" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex items-center gap-3">
                   <h3 className="text-xl font-bold text-gray-800 dark:text-white">Partitions Breakdown</h3>
                   <span className="text-sm px-3 py-1 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium">{results.partitions.length} Sections</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {results.partitions.map((part) => (
                    <div key={part.partitionIndex} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 bg-primary-100 dark:bg-primary-900/30 rounded-bl-2xl text-primary-600 dark:text-primary-400 font-bold text-lg">
                        #{part.partitionIndex}
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Sides (L / R)</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{part.leftSide} / {part.rightSide}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Base (Bot / Top)</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{part.bottomSide} / {part.topSide}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Area</span>
                          <div className="text-right">
                            <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 block">{part.area.sqFt} <span className="text-xs font-normal text-gray-500">sq ft</span></span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{part.area.guntha} Guntha</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/50">
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      )}
    </section>
  );
};
