/**
 * Static pose catalogue. The frontend has its own richer copy for now;
 * this endpoint exists for consumers that don't ship the data themselves.
 */
export const POSE_CATALOG = [
    { id: 'tadasana', name: 'Tadasana', en: 'Mountain', difficulty: 'beginner' },
    { id: 'vrikshasana', name: 'Vrikshasana', en: 'Tree', difficulty: 'beginner' },
    { id: 'warrior1', name: 'Virabhadrasana I', en: 'Warrior I', difficulty: 'intermediate' },
    { id: 'warrior2', name: 'Virabhadrasana II', en: 'Warrior II', difficulty: 'intermediate' },
    { id: 'goddess', name: 'Utkata Konasana', en: 'Goddess', difficulty: 'intermediate' },
    { id: 'downdog', name: 'Adho Mukha Svanasana', en: 'Downward Dog', difficulty: 'beginner' },
] as const
