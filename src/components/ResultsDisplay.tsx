import React, { useState } from 'react';
import { Results, FormData } from '../types';
import { ChangeEvent } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { PieChart, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { LandShapePreview } from './LandShapePreview';

interface ResultsDisplayProps {
  results: Results | null;
  formData?: FormData;
  onUpdateDimensions?: (e: ChangeEvent<HTMLInputElement>) => void;
  onRecalculate?: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  formData,
}) => {
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

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
            

            {/* Partitions Breakdown Accordion */}
            <AccordionItem value="partitions" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex flex-wrap items-center justify-between w-full gap-3 pr-2 sm:pr-4">
                   <div className="flex items-center gap-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Partitions Breakdown</h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
                        {results.partitions.length} Sections
                      </span>
                   </div>
                   
                   <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGraphOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsGraphOpen(true);
                      }
                    }}
                    className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold border border-primary-100 dark:border-primary-800/30 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="View Partition Graph"
                   >
                     <PieChart className="w-4 h-4" />
                     <span>View Graph</span>
                   </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {results.partitions.map((part) => (
                    <div key={part.partitionIndex} className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-lg">
                      {/* Decorative gradient header bar */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                           {/* Index Badge */}
                           <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Partition</span>
                              <span className="text-2xl font-black text-gray-800 dark:text-white leading-none">#{part.partitionIndex}</span>
                           </div>
                           
                           {/* Area Pill */}
                           <div className="text-right">
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                                  <span className="text-lg font-bold">{part.area.sqFt}</span> <span className="text-xs font-normal opacity-80">sq ft</span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1 font-medium">{part.area.guntha} Guntha</div>
                           </div>
                        </div>

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Sides */}
                            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3 border border-gray-100 dark:border-slate-800">
                               <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Sides (L/R)</div>
                               <div className="font-mono font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                  {part.leftSide} <span className="text-gray-300 dark:text-gray-600">/</span> {part.rightSide}
                               </div>
                            </div>
                            
                            {/* Base/Top */}
                            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3 border border-gray-100 dark:border-slate-800">
                               <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Base / Top</div>
                               <div className="font-mono font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                  {part.bottomSide} <span className="text-gray-300 dark:text-gray-600">/</span> {part.topSide}
                               </div>
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

          </Accordion>
          
          {/* Partition Graph Modal */}
          <Dialog.Root open={isGraphOpen} onOpenChange={setIsGraphOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-200" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl duration-200 border border-gray-100 dark:border-slate-800 p-0 overflow-hidden outline-none">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900">
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Partition Layout
                  </Dialog.Title>
                  
                  <div className="flex items-center gap-4">
                      {/* Zoom Controls */}
                      <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-1">
                          <button 
                            onClick={handleZoomOut}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-mono w-12 text-center text-gray-500 dark:text-gray-400 select-none">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <button 
                            onClick={handleZoomIn}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                          <button 
                            onClick={handleResetZoom}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Reset View"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                      </div>

                      <button 
                        onClick={() => setIsGraphOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                  </div>
                </div>

                <div className="p-6 overflow-auto max-h-[70vh] flex flex-col items-center bg-gray-50/30 dark:bg-slate-900/30 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">

                   {formData && (
                     <div style={{ width: `${640 * zoomLevel}px`, transition: 'width 0.2s ease-out' }} className="mb-4">
                       <LandShapePreview 
                         left={parseFloat(formData.leftSideLength) || 0}
                         right={parseFloat(formData.rightSideLength) || 0}
                         bottom={parseFloat(formData.bottomBaseLength) || 0}
                         top={parseFloat(formData.topSlantLength) || 0}
                         cuts={results.cuts}
                         partitions={results.partitions}
                         measureFrom={formData.measureFrom}
                       />
                     </div>
                   )}
                   <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 border-t border-dashed border-gray-200 dark:border-slate-800 pt-4 w-full">
                     Dashed lines indicate the calculated cut positions.
                   </p>
                </div>

              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

        </div>
      )}
    </section>
  );
};
