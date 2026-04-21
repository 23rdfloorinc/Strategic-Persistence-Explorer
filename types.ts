
export interface Strategy {
  id: string;
  title: string;
  concept: string;
  implementation: string;
  rawCodeLanguage?: string; // e.g. 'javascript'
  category: 'Persistence' | 'Authentication' | 'Infiltration' | 'Redundancy';
  connections: string[]; // IDs of related strategies
}
