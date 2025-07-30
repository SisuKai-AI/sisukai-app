// __tests__/adaptive-learning.test.ts

// --- Mock Data ---
const mockTopics = [
  { nodeId: 'topic-1', nodeName: 'Introduction' },
  { nodeId: 'topic-2', nodeName: 'Core Concepts' },
  { nodeId: 'topic-3', nodeName: 'Advanced Techniques' },
  { nodeId: 'topic-4', nodeName: 'Final Review' },
];

const mockUserMastery = [
  { nodeId: 'topic-1', masteryLevel: 0.9 },
  { nodeId: 'topic-2', masteryLevel: 0.2 },
  { nodeId: 'topic-3', masteryLevel: 0.6 },
  { nodeId: 'topic-4', masteryLevel: 0.1 },
];

// --- Types for better TypeScript support ---
interface Topic {
  nodeId: string;
  nodeName: string;
}

interface UserMastery {
  nodeId: string;
  masteryLevel: number;
}

interface TopicWithMastery extends Topic {
  masteryLevel: number;
}

// --- Function to be Tested (based on our pseudocode) ---
// This function simulates fetching and sorting the learning path.
const getAdaptiveLearningPath = (topics: Topic[], userMastery: UserMastery[]): TopicWithMastery[] => {
  const combined = topics.map(topic => {
    const mastery = userMastery.find(m => m.nodeId === topic.nodeId);
    return { ...topic, masteryLevel: mastery ? mastery.masteryLevel : 0.0 };
  });

  // The core logic to test: sorting by mastery level, ascending.
  combined.sort((a, b) => a.masteryLevel - b.masteryLevel);
  return combined;
};

// --- Test Suite ---
describe('Adaptive Learning Path Algorithm', () => {
  it('should sort topics by masteryLevel in ascending order', () => {
    const learningPath = getAdaptiveLearningPath(mockTopics, mockUserMastery);

    // Assertions
    expect(learningPath).toHaveLength(4);
    expect(learningPath[0].nodeId).toBe('topic-4'); // Lowest mastery (0.1)
    expect(learningPath[1].nodeId).toBe('topic-2'); // Second lowest (0.2)
    expect(learningPath[2].nodeId).toBe('topic-3'); // Second highest (0.6)
    expect(learningPath[3].nodeId).toBe('topic-1'); // Highest mastery (0.9)
  });

  it('should handle topics where the user has no mastery record', () => {
    const incompleteMastery = [
      { nodeId: 'topic-1', masteryLevel: 0.9 },
      { nodeId: 'topic-3', masteryLevel: 0.6 },
    ];
    const learningPath = getAdaptiveLearningPath(mockTopics, incompleteMastery);

    // Topics 2 and 4 should default to 0.0 mastery and appear first.
    expect(learningPath[0].masteryLevel).toBe(0.0);
    expect(learningPath[1].masteryLevel).toBe(0.0);
    expect(learningPath[2].nodeId).toBe('topic-3');
    expect(learningPath[3].nodeId).toBe('topic-1');
  });

  it('should handle empty topics array', () => {
    const learningPath = getAdaptiveLearningPath([], mockUserMastery);
    expect(learningPath).toHaveLength(0);
  });

  it('should handle empty mastery array', () => {
    const learningPath = getAdaptiveLearningPath(mockTopics, []);
    
    // All topics should have 0.0 mastery and maintain original order
    expect(learningPath).toHaveLength(4);
    learningPath.forEach(topic => {
      expect(topic.masteryLevel).toBe(0.0);
    });
  });

  it('should preserve topic names and IDs in the result', () => {
    const learningPath = getAdaptiveLearningPath(mockTopics, mockUserMastery);
    
    // Check that all original topic data is preserved
    const topic4 = learningPath.find(t => t.nodeId === 'topic-4');
    expect(topic4).toBeDefined();
    expect(topic4?.nodeName).toBe('Final Review');
    expect(topic4?.masteryLevel).toBe(0.1);
  });

  it('should handle duplicate mastery records by using the first match', () => {
    const duplicateMastery = [
      { nodeId: 'topic-1', masteryLevel: 0.9 },
      { nodeId: 'topic-1', masteryLevel: 0.5 }, // Duplicate - should be ignored
      { nodeId: 'topic-2', masteryLevel: 0.2 },
    ];
    
    const learningPath = getAdaptiveLearningPath(mockTopics, duplicateMastery);
    const topic1 = learningPath.find(t => t.nodeId === 'topic-1');
    
    expect(topic1?.masteryLevel).toBe(0.9); // Should use first occurrence
  });

  it('should handle mastery levels at boundary values (0.0 and 1.0)', () => {
    const boundaryMastery = [
      { nodeId: 'topic-1', masteryLevel: 0.0 },
      { nodeId: 'topic-2', masteryLevel: 1.0 },
      { nodeId: 'topic-3', masteryLevel: 0.5 },
    ];
    
    const learningPath = getAdaptiveLearningPath(mockTopics, boundaryMastery);
    
    // Should sort correctly with boundary values
    expect(learningPath[0].masteryLevel).toBe(0.0); // topic-1 or topic-4 (default)
    expect(learningPath[3].masteryLevel).toBe(1.0); // topic-2
  });
});

