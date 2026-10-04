import axios from 'axios';
import type { Course, CourseCreate, GraphData, StudyPlanData, Stats, AvailableCoursesData, ValidationResult, PrerequisiteChain, DependentsResult, RelationData } from '../types';

const api = axios.create({ baseURL: 'http://localhost:8000', headers: { 'Content-Type': 'application/json' } });

export const getCourses = () => api.get<Course[]>('/courses').then(r => r.data);
export const createCourse = (data: CourseCreate) => api.post<Course>('/courses', data).then(r => r.data);
export const updateCourse = (id: number, data: CourseCreate) => api.put<Course>(`/courses/${id}`, data).then(r => r.data);
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`);
export const toggleComplete = (id: number) => api.patch<Course>(`/courses/${id}/complete`).then(r => r.data);
export const getPrerequisites = (id: number) => api.get<Course[]>(`/courses/${id}/prerequisites`).then(r => r.data);
export const addPrerequisite = (courseId: number, prerequisiteId: number) => api.post(`/courses/${courseId}/prerequisites`, { prerequisite_id: prerequisiteId });
export const removePrerequisite = (courseId: number, prerequisiteId: number) => api.delete(`/courses/${courseId}/prerequisites/${prerequisiteId}`);
export const getGraph = () => api.get<GraphData>('/graph').then(r => r.data);
export const getStudyPlan = (maxCredits: number = 18) => api.get<StudyPlanData>(`/study-plan?max_credits=${maxCredits}`).then(r => r.data);
export const getStats = () => api.get<Stats>('/stats').then(r => r.data);
export const getAvailableCourses = () => api.get<AvailableCoursesData>('/available-courses').then(r => r.data);
export const getPrerequisiteChain = (id: number) => api.get<PrerequisiteChain>(`/courses/${id}/prerequisite-chain`).then(r => r.data);
export const getDependents = (id: number) => api.get<DependentsResult>(`/courses/${id}/dependents`).then(r => r.data);
export const validateGraph = () => api.post<ValidationResult>('/validate-graph').then(r => r.data);
export const getRelation = () => api.get<RelationData>('/relation').then(r => r.data);
export default api;
