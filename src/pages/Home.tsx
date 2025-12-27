import { useState, ChangeEvent } from 'react';
import { CalculatorForm } from '../components/CalculatorForm';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { FormData, Results } from '../types';
import { calculatorSchema } from '../schemas/calculatorSchema';

export const Home = () => {
  const [formData, setFormData] = useState<FormData>({
    leftSideLength: '',
    rightSideLength: '',
    bottomBaseLength: '',
    topSlantLength: '',
    numberOfPartitions: '',
    measureFrom: 'left'
  });
  const [results, setResults] = useState<Results | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user types
    if (errors[name]) {
       setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
       });
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeasureFromChange = (side: 'left' | 'right') => {
    setFormData(prev => ({ ...prev, measureFrom: side }));
  };

  const calculateCuts = async () => {
    // 1. Validate Form Data using Zod
    const validationResult = calculatorSchema.safeParse(formData);

    if (!validationResult.success) {
       const newErrors: Record<string, string> = {};
       validationResult.error.issues.forEach(err => {
          if (err.path[0] && !newErrors[err.path[0] as string]) {
             newErrors[err.path[0] as string] = err.message;
          }
       });
       setErrors(newErrors);
       return;
    }

    setLoading(true);
    setErrors({}); // Clear global errors if any

    // Simulate API delay/Calculation time
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // 2. Perform Calculation (using valid data)
      const data = validationResult.data; // Typed data from Zod

      const inputs = {
        leftSideLength: parseFloat(data.leftSideLength),
        rightSideLength: parseFloat(data.rightSideLength),
        bottomBaseLength: parseFloat(data.bottomBaseLength),
        topSlantLength: parseFloat(data.topSlantLength),
        numberOfPartitions: parseInt(data.numberOfPartitions),
        measureFrom: data.measureFrom
      };

      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/calculate-cuts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const resultData = await response.json();
      setResults(resultData);
    } catch (err) {
      // General error handling (e.g., network error)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setErrors({ global: errorMessage }); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <CalculatorForm 
        formData={formData} 
        handleChange={handleChange} 
        setMeasureFrom={handleMeasureFromChange}
        calculateCuts={calculateCuts}
        loading={loading}
        errors={errors}
      />
      <ResultsDisplay 
        results={results} 
        formData={formData}
        onUpdateDimensions={handleChange}
        onRecalculate={calculateCuts}
      />
    </div>
  );
};
