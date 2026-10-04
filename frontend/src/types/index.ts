export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  description: string;
  completed: boolean;
}

export interface CourseCreate {
  code: string;
  name: string;
  credits: number;
  description: string;
}

export interface GraphNode {
  id: number;
  code: string;
  name: string;
  credits: number;
  completed: boolean;
}

export interface GraphEdge {
  source: number;
  target: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Semester {
  semester: number;
  courses: Course[];
  total_credits: number;
}

export interface StudyPlanData {
  semesters: Semester[];
  total_courses: number;
  total_credits: number;
  max_credits_per_semester: number;
}

export interface Stats {
  total_courses: number;
  completed_courses: number;
  available_courses: number;
  remaining_courses: number;
  total_prerequisites: number;
  completion_percentage: number;
}

export interface AvailableCoursesData {
  available: Course[];
  completed: Course[];
  remaining: Course[];
}

export interface ValidationResult {
  valid: boolean;
  has_cycle: boolean;
  cycle_courses: Course[];
  topological_order: Course[];
  message: string;
}

export interface PrerequisiteChain {
  course: Course;
  chain: Course[];
}

export interface DependentsResult {
  course: Course;
  dependents: Course[];
}

export interface RelationPair {
  from_course: Course;
  to_course: Course;
  notation: string;
}

export interface RelationData {
  relation: RelationPair[];
  cardinality: number;
  description: string;
}
