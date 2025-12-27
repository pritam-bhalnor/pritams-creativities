import { z } from 'zod';

export const calculatorSchema = z.object({
  leftSideLength: z.string().min(1, 'This field is required').regex(/^\d*\.?\d+$/, 'Must be a valid number').refine(val => parseFloat(val) > 0, 'Must be positive'),
  rightSideLength: z.string().min(1, 'This field is required').regex(/^\d*\.?\d+$/, 'Must be a valid number').refine(val => parseFloat(val) > 0, 'Must be positive'),
  bottomBaseLength: z.string().min(1, 'This field is required').regex(/^\d*\.?\d+$/, 'Must be a valid number').refine(val => parseFloat(val) > 0, 'Must be positive'),
  topSlantLength: z.string().min(1, 'This field is required').regex(/^\d*\.?\d+$/, 'Must be a valid number').refine(val => parseFloat(val) > 0, 'Must be positive'),
  numberOfPartitions: z.string().min(1, 'This field is required').regex(/^\d+$/, 'Must be an integer').refine(val => parseInt(val) > 1, 'Must be greater than 1'),
  measureFrom: z.enum(['left', 'right'])
});
