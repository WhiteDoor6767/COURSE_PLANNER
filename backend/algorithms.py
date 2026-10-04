from typing import Dict, List, Set, Tuple, Optional
from collections import defaultdict, deque


class CourseGraph:
    """
    Directed graph G = (V, E) representing the prerequisite system.
    V = set of all course IDs
    E = set of ordered pairs (u, v) where u must be completed before v
    Models the prerequisite relation R subset C x C.
    """

    def __init__(self):
        self.adjacency: Dict[int, Set[int]] = defaultdict(set)
        self.reverse_adjacency: Dict[int, Set[int]] = defaultdict(set)
        self.vertices: Set[int] = set()

    def add_vertex(self, course_id: int) -> None:
        self.vertices.add(course_id)
        if course_id not in self.adjacency:
            self.adjacency[course_id] = set()
        if course_id not in self.reverse_adjacency:
            self.reverse_adjacency[course_id] = set()

    def add_edge(self, from_id: int, to_id: int) -> None:
        """Add directed edge from_id -> to_id (from_id is a prerequisite of to_id)."""
        self.vertices.add(from_id)
        self.vertices.add(to_id)
        self.adjacency[from_id].add(to_id)
        self.reverse_adjacency[to_id].add(from_id)
        if from_id not in self.reverse_adjacency:
            self.reverse_adjacency[from_id] = set()
        if to_id not in self.adjacency:
            self.adjacency[to_id] = set()

    def remove_edge(self, from_id: int, to_id: int) -> None:
        self.adjacency[from_id].discard(to_id)
        self.reverse_adjacency[to_id].discard(from_id)

    def remove_vertex(self, course_id: int) -> None:
        self.vertices.discard(course_id)
        for dep in list(self.adjacency.get(course_id, set())):
            self.reverse_adjacency[dep].discard(course_id)
        for prereq in list(self.reverse_adjacency.get(course_id, set())):
            self.adjacency[prereq].discard(course_id)
        self.adjacency.pop(course_id, None)
        self.reverse_adjacency.pop(course_id, None)

    def get_predecessors(self, course_id: int) -> Set[int]:
        return self.reverse_adjacency.get(course_id, set()).copy()

    def get_successors(self, course_id: int) -> Set[int]:
        return self.adjacency.get(course_id, set()).copy()

    def in_degree(self, course_id: int) -> int:
        return len(self.reverse_adjacency.get(course_id, set()))


def detect_cycle(graph: CourseGraph) -> Tuple[bool, List[int]]:
    """
    Detect cycles using DFS with three-color vertex marking (CLRS).
    
    The prerequisite relation R must be a strict partial order:
    irreflexive, asymmetric, transitive.
    A cycle violates asymmetry.
    
    Colors: WHITE=0 (undiscovered), GRAY=1 (in DFS stack), BLACK=2 (done)
    A back edge to a GRAY node indicates a cycle.
    
    Time: O(V + E)
    Returns: (has_cycle, cycle_vertices)
    """
    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[int, int] = {v: WHITE for v in graph.vertices}
    parent: Dict[int, Optional[int]] = {v: None for v in graph.vertices}
    cycle_found: List[int] = []

    def dfs_visit(u: int) -> bool:
        color[u] = GRAY
        for v in graph.adjacency.get(u, set()):
            if color[v] == GRAY:
                cycle: List[int] = [v]
                curr = u
                while curr != v and curr is not None:
                    cycle.append(curr)
                    curr = parent.get(curr)
                cycle.append(v)
                cycle_found.extend(reversed(cycle))
                return True
            elif color[v] == WHITE:
                parent[v] = u
                if dfs_visit(v):
                    return True
        color[u] = BLACK
        return False

    for vertex in list(graph.vertices):
        if color[vertex] == WHITE:
            if dfs_visit(vertex):
                return True, cycle_found

    return False, []


def topological_sort(graph: CourseGraph) -> Tuple[bool, List[int]]:
    """
    Topological sort using Kahn's Algorithm (BFS-based).
    
    A topological ordering is a linear extension of the partial order R.
    For every edge (u,v) in R, u appears before v in the ordering.
    
    Kahn's Algorithm:
    1. Compute in-degree for all vertices
    2. Queue all vertices with in-degree 0 (minimal elements / no prerequisites)
    3. Repeatedly dequeue u, add to result, decrement in-degree of u's neighbors
    4. If neighbor in-degree hits 0, enqueue it
    5. If result length < |V|, there is a cycle
    
    Time: O(V + E)
    Returns: (success, order)
    """
    in_degree: Dict[int, int] = {v: 0 for v in graph.vertices}
    for v in graph.vertices:
        for neighbor in graph.adjacency.get(v, set()):
            in_degree[neighbor] = in_degree.get(neighbor, 0) + 1

    queue: deque = deque(
        sorted(v for v in graph.vertices if in_degree[v] == 0)
    )
    sorted_order: List[int] = []

    while queue:
        u = queue.popleft()
        sorted_order.append(u)
        for v in sorted(graph.adjacency.get(u, set())):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    if len(sorted_order) != len(graph.vertices):
        return False, []

    return True, sorted_order


def get_available_courses(
    graph: CourseGraph,
    completed: Set[int],
    all_courses: Set[int]
) -> List[int]:
    """
    Find courses currently available given completed courses.
    
    A course C is available iff:
    - C not in completed
    - all prerequisites of C are in completed (downward-closure condition)
    
    This implements the order ideal condition of poset theory.
    Time: O(V + E)
    """
    available: List[int] = []
    for course_id in all_courses:
        if course_id in completed:
            continue
        prerequisites = graph.get_predecessors(course_id)
        if prerequisites.issubset(completed):
            available.append(course_id)
    return sorted(available)


def get_prerequisite_chain(graph: CourseGraph, course_id: int) -> List[int]:
    """
    Find all transitive prerequisites (ancestors) of a course.
    
    Computes the downset of course_id in the poset:
    down(course_id) = {x in C | x <= course_id in the partial order}
    
    Algorithm: BFS on reverse graph, then topological sort the result.
    Time: O(V + E)
    """
    visited: Set[int] = {course_id}
    queue: deque = deque([course_id])
    ancestors: List[int] = []

    while queue:
        current = queue.popleft()
        for prereq in graph.reverse_adjacency.get(current, set()):
            if prereq not in visited:
                visited.add(prereq)
                ancestors.append(prereq)
                queue.append(prereq)

    if not ancestors:
        return []

    ancestor_set = set(ancestors)
    subgraph = CourseGraph()
    for v in ancestor_set:
        subgraph.add_vertex(v)
    for v in ancestor_set:
        for neighbor in graph.adjacency.get(v, set()):
            if neighbor in ancestor_set:
                subgraph.add_edge(v, neighbor)

    success, sorted_ancestors = topological_sort(subgraph)
    return sorted_ancestors if success else ancestors


def get_all_dependents(graph: CourseGraph, course_id: int) -> List[int]:
    """
    Find all courses that transitively depend on this course.
    
    Computes the upset of course_id in the poset:
    up(course_id) = {x in C | course_id <= x in the partial order}
    
    Algorithm: BFS on forward graph.
    Time: O(V + E)
    """
    visited: Set[int] = set()
    queue: deque = deque([course_id])
    dependents: List[int] = []

    while queue:
        current = queue.popleft()
        for dep in graph.adjacency.get(current, set()):
            if dep not in visited:
                visited.add(dep)
                dependents.append(dep)
                queue.append(dep)

    return dependents


def compute_levels(graph: CourseGraph) -> Dict[int, int]:
    """
    Compute the DAG level (layer) of each course.
    Level = longest path from any source vertex to this course.
    Level 0 = minimal elements (no prerequisites).
    Corresponds to height in the Hasse diagram.
    Time: O(V + E)
    """
    success, topo_order = topological_sort(graph)
    if not success:
        return {}

    level: Dict[int, int] = {v: 0 for v in graph.vertices}
    for v in topo_order:
        for neighbor in graph.adjacency.get(v, set()):
            if level[v] + 1 > level[neighbor]:
                level[neighbor] = level[v] + 1

    return level


def generate_study_plan(
    graph: CourseGraph,
    course_credits: Dict[int, int],
    max_credits_per_semester: int = 18
) -> List[List[int]]:
    """
    Generate a valid semester-by-semester study plan.
    
    Computes a minimum antichain cover of the poset respecting:
    1. The partial order (prerequisites before dependents)
    2. Credit limits per semester
    
    By Dilworth's theorem, the minimum number of semesters equals
    the maximum antichain width of the poset.
    
    Algorithm:
    1. Compute DAG levels (longest-path distances from sources)
    2. Group courses by level (initial semester assignment)
    3. Apply credit constraints: split overflowing semesters
    
    Time: O(V + E + V log V)
    Returns: List of semesters, each is a list of course IDs.
    """
    if not graph.vertices:
        return []

    levels = compute_levels(graph)
    if not levels:
        return []

    success, topo_order = topological_sort(graph)
    if not success:
        return []

    max_level = max(levels.values())
    raw_semesters: List[List[int]] = [[] for _ in range(max_level + 1)]
    for v in topo_order:
        raw_semesters[levels[v]].append(v)

    if max_credits_per_semester <= 0:
        return [s for s in raw_semesters if s]

    final_semesters: List[List[int]] = []
    for level_courses in raw_semesters:
        if not level_courses:
            continue
        current_semester: List[int] = []
        current_credits: int = 0
        for course_id in level_courses:
            credits = course_credits.get(course_id, 3)
            if current_credits + credits > max_credits_per_semester and current_semester:
                final_semesters.append(current_semester)
                current_semester = [course_id]
                current_credits = credits
            else:
                current_semester.append(course_id)
                current_credits += credits
        if current_semester:
            final_semesters.append(current_semester)

    return final_semesters


def get_relation_set(graph: CourseGraph) -> List[Tuple[int, int]]:
    """
    Return the prerequisite relation as ordered pairs R subset C x C.
    (a, b) in R means course a must be completed before course b.
    """
    relation: List[Tuple[int, int]] = []
    for v in sorted(graph.vertices):
        for neighbor in sorted(graph.adjacency.get(v, set())):
            relation.append((v, neighbor))
    return relation
