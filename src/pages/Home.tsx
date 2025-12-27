import { useState, ChangeEvent } from 'react';
import { CalculatorForm } from '../components/CalculatorForm';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { FormData, Results } from '../types';

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
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeasureFromChange = (side: 'left' | 'right') => {
    setFormData(prev => ({ ...prev, measureFrom: side }));
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
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/calculate-cuts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      const data: Results & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
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
        error={error}
      />
      <ResultsDisplay results={results} />
    </div>
  );
};
