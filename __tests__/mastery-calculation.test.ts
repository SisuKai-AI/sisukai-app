// __tests__/mastery-calculation.test.ts

// --- Function to be Tested (based on our pseudocode) ---
const calculateNewMasteryLevel = (currentMastery: number, isCorrect: boolean): number => {
  const learningRate = 0.1;
  let newMastery: number;

  if (isCorrect) {
    // Positive reinforcement: approach mastery asymptotically
    newMastery = currentMastery + (learningRate * (1 - currentMastery));
  } else {
    // Negative reinforcement: penalty is less severe to encourage continued learning
    newMastery = currentMastery - (learningRate * currentMastery * 0.5);
  }

  // Clamp the value between 0 and 1
  return Math.max(0, Math.min(1, newMastery));
};

// --- Advanced mastery calculation with multiple factors ---
interface MasteryFactors {
  currentMastery: number;
  isCorrect: boolean;
  responseTime?: number; // in seconds
  difficulty?: number; // 0.1 to 1.0
  consecutiveCorrect?: number;
  consecutiveIncorrect?: number;
}

const calculateAdvancedMasteryLevel = (factors: MasteryFactors): number => {
  const {
    currentMastery,
    isCorrect,
    responseTime = 30,
    difficulty = 0.5,
    consecutiveCorrect = 0,
    consecutiveIncorrect = 0
  } = factors;

  let baseLearningRate = 0.1;
  
  // Adjust learning rate based on difficulty
  const difficultyMultiplier = 0.5 + (difficulty * 0.5); // 0.5 to 1.0
  
  // Adjust for response time (faster response = better understanding)
  const timeMultiplier = responseTime <= 10 ? 1.2 : responseTime <= 30 ? 1.0 : 0.8;
  
  // Adjust for streaks
  const streakMultiplier = isCorrect 
    ? 1 + (consecutiveCorrect * 0.05) // Bonus for consecutive correct
    : 1 + (consecutiveIncorrect * 0.03); // Slightly higher penalty for consecutive wrong

  const adjustedLearningRate = baseLearningRate * difficultyMultiplier * timeMultiplier * streakMultiplier;

  let newMastery: number;

  if (isCorrect) {
    newMastery = currentMastery + (adjustedLearningRate * (1 - currentMastery));
  } else {
    newMastery = currentMastery - (adjustedLearningRate * currentMastery * 0.5);
  }

  return Math.max(0, Math.min(1, newMastery));
};

// --- Test Suite ---
describe('Mastery Calculation Logic', () => {
  describe('Basic Mastery Calculation', () => {
    it('should increase mastery level on a correct answer', () => {
      const initialMastery = 0.5;
      const newMastery = calculateNewMasteryLevel(initialMastery, true);
      expect(newMastery).toBeGreaterThan(initialMastery);
      expect(newMastery).toBe(0.55); // 0.5 + (0.1 * (1 - 0.5))
    });

    it('should decrease mastery level on an incorrect answer', () => {
      const initialMastery = 0.5;
      const newMastery = calculateNewMasteryLevel(initialMastery, false);
      expect(newMastery).toBeLessThan(initialMastery);
      expect(newMastery).toBe(0.475); // 0.5 - (0.1 * 0.5 * 0.5)
    });

    it('should not increase mastery above 1.0', () => {
      const initialMastery = 0.95;
      const newMastery = calculateNewMasteryLevel(initialMastery, true);
      expect(newMastery).toBeLessThanOrEqual(1.0);
      expect(newMastery).toBeCloseTo(0.955, 3); // 0.95 + (0.1 * 0.05)
    });

    it('should not decrease mastery below 0.0', () => {
      const initialMastery = 0.05;
      const newMastery = calculateNewMasteryLevel(initialMastery, false);
      expect(newMastery).toBeGreaterThanOrEqual(0.0);
      expect(newMastery).toBeCloseTo(0.0475, 3); // 0.05 - (0.1 * 0.05 * 0.5) = 0.0475
    });

    it('should handle perfect mastery (1.0) correctly', () => {
      const perfectMastery = 1.0;
      const newMastery = calculateNewMasteryLevel(perfectMastery, true);
      expect(newMastery).toBe(1.0); // Should remain at 1.0
    });

    it('should handle zero mastery (0.0) correctly', () => {
      const zeroMastery = 0.0;
      const correctMastery = calculateNewMasteryLevel(zeroMastery, true);
      const incorrectMastery = calculateNewMasteryLevel(zeroMastery, false);
      
      expect(correctMastery).toBe(0.1); // 0.0 + (0.1 * 1.0)
      expect(incorrectMastery).toBe(0.0); // Should remain at 0.0
    });

    it('should show diminishing returns at high mastery levels', () => {
      const highMastery = 0.8;
      const newMastery = calculateNewMasteryLevel(highMastery, true);
      const improvement = newMastery - highMastery;
      
      expect(improvement).toBeCloseTo(0.02, 3); // 0.1 * (1 - 0.8) = 0.02
      expect(improvement).toBeLessThan(0.1); // Less than full learning rate
    });
  });

  describe('Advanced Mastery Calculation', () => {
    it('should apply difficulty multiplier correctly', () => {
      const easyFactors: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        difficulty: 0.1 // Minimum difficulty
      };
      
      const hardFactors: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        difficulty: 1.0 // Maximum difficulty
      };
      
      const easyMastery = calculateAdvancedMasteryLevel(easyFactors);
      const hardMastery = calculateAdvancedMasteryLevel(hardFactors);
      
      // Hard questions should provide more mastery gain than easy questions
      expect(hardMastery).toBeGreaterThan(easyMastery);
      expect(hardMastery).toBeGreaterThan(0.5); // Should still increase for correct answer
    });

    it('should reward fast response times', () => {
      const fastResponse: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        responseTime: 5 // Fast response
      };
      
      const slowResponse: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        responseTime: 60 // Slow response
      };
      
      const fastMastery = calculateAdvancedMasteryLevel(fastResponse);
      const slowMastery = calculateAdvancedMasteryLevel(slowResponse);
      
      expect(fastMastery).toBeGreaterThan(slowMastery);
    });

    it('should apply consecutive correct streak bonus', () => {
      const withStreak: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        consecutiveCorrect: 5
      };
      
      const withoutStreak: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        consecutiveCorrect: 0
      };
      
      const streakMastery = calculateAdvancedMasteryLevel(withStreak);
      const normalMastery = calculateAdvancedMasteryLevel(withoutStreak);
      
      expect(streakMastery).toBeGreaterThan(normalMastery);
    });

    it('should apply consecutive incorrect penalty', () => {
      const withIncorrectStreak: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: false,
        consecutiveIncorrect: 3
      };
      
      const withoutStreak: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: false,
        consecutiveIncorrect: 0
      };
      
      const streakMastery = calculateAdvancedMasteryLevel(withIncorrectStreak);
      const normalMastery = calculateAdvancedMasteryLevel(withoutStreak);
      
      expect(streakMastery).toBeLessThan(normalMastery);
    });

    it('should handle all factors combined', () => {
      const complexFactors: MasteryFactors = {
        currentMastery: 0.6,
        isCorrect: true,
        responseTime: 8, // Fast
        difficulty: 0.8, // Hard
        consecutiveCorrect: 3
      };
      
      const newMastery = calculateAdvancedMasteryLevel(complexFactors);
      
      expect(newMastery).toBeGreaterThan(0.6);
      expect(newMastery).toBeLessThanOrEqual(1.0);
      expect(typeof newMastery).toBe('number');
    });

    it('should maintain bounds with extreme values', () => {
      const extremeFactors: MasteryFactors = {
        currentMastery: 0.95,
        isCorrect: true,
        responseTime: 1, // Very fast
        difficulty: 1.0, // Maximum difficulty
        consecutiveCorrect: 10 // Long streak
      };
      
      const newMastery = calculateAdvancedMasteryLevel(extremeFactors);
      
      expect(newMastery).toBeLessThanOrEqual(1.0);
      expect(newMastery).toBeGreaterThanOrEqual(0.0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative mastery input', () => {
      const newMastery = calculateNewMasteryLevel(-0.1, true);
      expect(newMastery).toBeGreaterThanOrEqual(0.0);
    });

    it('should handle mastery above 1.0 input', () => {
      const newMastery = calculateNewMasteryLevel(1.5, false);
      expect(newMastery).toBeLessThanOrEqual(1.0);
    });

    it('should handle invalid response times gracefully', () => {
      const factors: MasteryFactors = {
        currentMastery: 0.5,
        isCorrect: true,
        responseTime: -5 // Invalid negative time
      };
      
      const newMastery = calculateAdvancedMasteryLevel(factors);
      expect(typeof newMastery).toBe('number');
      expect(newMastery).toBeGreaterThanOrEqual(0.0);
      expect(newMastery).toBeLessThanOrEqual(1.0);
    });
  });
});

