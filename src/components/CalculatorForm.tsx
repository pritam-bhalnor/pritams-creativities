import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { FormData } from '../types';
import { LandShapePreview } from './LandShapePreview';
import { Maximize2, X, Settings2, Save, Pencil } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Switch } from './ui/switch';

interface CalculatorFormProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setMeasureFrom: (side: 'left' | 'right') => void;
  calculateCuts: () => void;
  loading: boolean;
  errors: Record<string, string>;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  formData,
  handleChange,
  setMeasureFrom,
  calculateCuts,
  loading,
  errors
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingLabels, setIsEditingLabels] = useState(false);
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [graphLabels, setGraphLabels] = useState({
    left: 'Left',
    right: 'Right',
    base: 'Base', // Internally 'bottom' in geometry, but 'Base' here for user
    top: 'Top'
  });

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    // Focus the first field with an error
    const fieldOrder = [
      'leftSideLength',
      'rightSideLength',
      'bottomBaseLength',
      'topSlantLength',
      'numberOfPartitions'
    ];
    
    const firstErrorField = fieldOrder.find(field => errors[field]);
    if (firstErrorField && inputRefs.current[firstErrorField]) {
      inputRefs.current[firstErrorField]?.focus();
    }
  }, [errors]);

  const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGraphLabels(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDimensionChange = (side: 'left' | 'right' | 'bottom' | 'top', value: string) => {
    // Map side to formData field name
    const fieldMap: Record<string, keyof FormData> = {
      left: 'leftSideLength',
      right: 'rightSideLength',
      bottom: 'bottomBaseLength',
      top: 'topSlantLength'
    };

    const fieldName = fieldMap[side];
    if (fieldName) {
      handleChange({
        target: {
          name: fieldName,
          value: value
        }
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <section className="lg:col-span-4 space-y-6">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">📐</span>
            Dimensions
          </h2>
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Preview Shape"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {[
            { label: `${graphLabels.left} Side (a)`, name: 'leftSideLength', placeholder: 'e.g. 220' },
            { label: `${graphLabels.right} Side (b)`, name: 'rightSideLength', placeholder: 'e.g. 170' },
            { label: `${graphLabels.base} (L)`, name: 'bottomBaseLength', placeholder: 'e.g. 180' },
            { label: `${graphLabels.top} Slant (l)`, name: 'topSlantLength', placeholder: 'e.g. 200' },
          ].map((field) => (
            <div key={field.name} className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 transition-colors">
                {field.label}
              </label>
              <input
                ref={(el) => { inputRefs.current[field.name] = el; }}
                type="number"
                name={field.name}
                value={(formData as any)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border ${errors[field.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'} outline-none transition-all font-medium focus:ring-4`}
              />
              {errors[field.name] && (
                 <p className="mt-1 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
          
            {/* Partitions Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-primary-600 transition-colors">
                Partitions (n)
              </label>
              <input
                ref={(el) => { inputRefs.current['numberOfPartitions'] = el; }}
                type="number"
                name="numberOfPartitions"
                value={formData.numberOfPartitions}
                onChange={handleChange}
                placeholder="e.g. 4"
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border ${errors.numberOfPartitions ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'} outline-none transition-all font-medium focus:ring-4`}
              />
              {errors.numberOfPartitions && (
                 <p className="mt-1 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{errors.numberOfPartitions}</p>
              )}
            </div>

            {/* Measure From Switch */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Measure partition distance from">
                Measure From
              </label>
              <div className="flex items-center justify-between h-[50px] px-1">
                 <span 
                   onClick={() => setMeasureFrom('left')}
                   className={`text-sm font-medium cursor-pointer transition-colors ${formData.measureFrom === 'left' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-400'}`}
                 >
                   {graphLabels.left}
                 </span>
                 
                 <Switch 
                   checked={formData.measureFrom === 'right'}
                   onCheckedChange={(checked: boolean) => setMeasureFrom(checked ? 'right' : 'left')}
                 />
                 
                 <span 
                   onClick={() => setMeasureFrom('right')}
                   className={`text-sm font-medium cursor-pointer transition-colors ${formData.measureFrom === 'right' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-400'}`}
                 >
                   {graphLabels.right}
                 </span>
              </div>
            </div>
        </div>

          <button
            onClick={calculateCuts}
            disabled={loading}
            className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-2xl shadow-primary-500/20 transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Calculate Cuts ✨'}
          </button>
        </div>
      </div>


      <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl duration-200 border border-gray-100 dark:border-slate-800 p-0 overflow-hidden outline-none">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900">
              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditingLabels ? 'Edit Labels' : (isEditingDimensions ? 'Edit Dimensions' : 'Shape Preview')}
              </Dialog.Title>
              <div className="flex items-center gap-2">
                 {/* Edit Values Button */}
                 <button 
                  onClick={() => {
                    setIsEditingDimensions(!isEditingDimensions);
                    setIsEditingLabels(false); // Close label editor if open
                  }}
                  className={`p-2 rounded-full transition-colors ${isEditingDimensions ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  title={isEditingDimensions ? "Stop Editing" : "Edit Dimensions"}
                 >
                   <Pencil className="w-5 h-5" />
                 </button>

                 {/* Edit Labels Button */}
                 <button 
                  onClick={() => {
                    setIsEditingLabels(!isEditingLabels);
                    setIsEditingDimensions(false); // Close dimension editor if open
                  }}
                  className={`p-2 rounded-full transition-colors ${isEditingLabels ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  title={isEditingLabels ? "View Graph" : "Edit Labels"}
                 >
                   {isEditingLabels ? <Save className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
                 </button>

                 <button 
                   onClick={() => setIsPreviewOpen(false)}
                   className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
            </div>

            <div className="p-6">
               {isEditingLabels ? (
                 <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the names of the sides for your land plot.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Left Side</label>
                          <input 
                            type="text" name="left" value={graphLabels.left} onChange={handleLabelChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Right Side</label>
                          <input 
                            type="text" name="right" value={graphLabels.right} onChange={handleLabelChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Bottom Side</label>
                          <input 
                            type="text" name="base" value={graphLabels.base} onChange={handleLabelChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Top Side</label>
                          <input 
                            type="text" name="top" value={graphLabels.top} onChange={handleLabelChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                       </div>
                    </div>
                    <button 
                       onClick={() => setIsEditingLabels(false)}
                       className="w-full mt-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                       <Save className="w-4 h-4" /> Save Labels
                    </button>
                 </div>
               ) : (
                 <>
                   <LandShapePreview 
                     left={parseFloat(formData.leftSideLength) || 0}
                     right={parseFloat(formData.rightSideLength) || 0}
                     bottom={parseFloat(formData.bottomBaseLength) || 0}
                     top={parseFloat(formData.topSlantLength) || 0}
                     labels={graphLabels}
                     isEditing={isEditingDimensions}
                     onDimensionChange={handleDimensionChange}
                   />
                   <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                     {isEditingDimensions ? 'Edit dimensions directly on the graph.' : 'This is an approximation of the land shape based on the dimensions provided.'}
                   </p>
                 </>
               )}
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </section>
  );
};
