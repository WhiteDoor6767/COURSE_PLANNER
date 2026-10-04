# Course Prerequisite Planner

A full-stack web application that helps students plan the order in which to complete university courses based on prerequisite relationships.

The backend implements **Discrete Mathematics** concepts directly: directed graphs, relations, partial orders, topological sorting, cycle detection, and DAG traversal — all written from scratch without external graph libraries.

---

## Architecture

```
ayaan/
├── backend/           # Python FastAPI + SQLite
│   ├── main.py        # REST API (all endpoints)
│   ├── algorithms.py  # Custom graph algorithms (core DM logic)
│   ├── database.py    # SQLAlchemy + SQLite setup
│   ├── models.py      # Course, PrerequisiteLink models
│   ├── schemas.py     # Pydantic v2 schemas
│   ├── seed_data.py   # 12 demo courses + 15 prerequisites
│   └── requirements.txt
└── frontend/          # React + TypeScript + Tailwind + React Flow
    └── src/
        ├── pages/     # Dashboard, CourseManager, PrerequisiteManager,
        │              # GraphView, StudyPlan, AlgorithmsConcepts
        ├── components/ # Layout (sidebar)
        ├── api/        # Axios client
        └── types/      # TypeScript interfaces
```

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Python 3.10+, FastAPI   |
| Database | SQLite (via SQLAlchemy) |
| Frontend | React 18, TypeScript    |
| Styling  | Tailwind CSS v3         |
| Graph UI | React Flow (@xyflow)    |
| State    | TanStack Query          |
| HTTP     | Axios                   |

---

## Installation & Running

### 1. Clone / navigate to project
```bash
cd /home/larp/code/projects/ayaan
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
python seed_data.py          # Creates DB with demo data
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

### 3. Frontend setup (separate terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

### Courses
```
GET    /courses                          List all courses
POST   /courses                          Create course
PUT    /courses/{id}                     Update course
DELETE /courses/{id}                     Delete course + links
PATCH  /courses/{id}/complete            Toggle completion
```

### Prerequisites
```
GET    /courses/{id}/prerequisites       Direct prerequisites
POST   /courses/{id}/prerequisites       Add prerequisite (cycle-safe)
DELETE /courses/{id}/prerequisites/{pid} Remove prerequisite
```

### Graph Analysis
```
GET  /graph                              Full graph (nodes + edges)
GET  /study-plan?max_credits=18          Topological study plan
GET  /available-courses                  Currently available courses
GET  /courses/{id}/prerequisite-chain    Transitive prerequisites
GET  /courses/{id}/dependents            Transitive dependents
POST /validate-graph                     DAG validation
GET  /relation                           R ⊆ C × C as ordered pairs
GET  /stats                              Dashboard statistics
```

---

## Discrete Mathematics Concepts

### 1. Directed Graph G = (V, E)
- **V** = set of course IDs (vertices)  
- **E** = set of ordered pairs (u, v) meaning u must be completed before v  
- Represented as adjacency lists for O(1) neighbor access

### 2. Relation R ⊆ C × C
- The prerequisite relation is a binary relation on courses  
- `(a, b) ∈ R` means course a is a prerequisite of course b  
- Exposed via `GET /relation` — returns all pairs explicitly

### 3. Strict Partial Order
- R must be: **irreflexive** (no self-loops), **asymmetric** (no A→B and B→A), **transitive**  
- The application enforces this by rejecting edges that create cycles  
- Completed courses form a **downward-closed set** (order ideal)

### 4. DAG (Directed Acyclic Graph)
- A valid prerequisite graph must be a DAG  
- Enforced on every `POST /courses/{id}/prerequisites` call  
- Verified via `POST /validate-graph`

### 5. Topological Sorting (Kahn's Algorithm)
- Produces a linear extension of the partial order  
- Used to generate the study plan (each valid sequence of courses)  
- Time complexity: O(V + E)

### 6. Cycle Detection (DFS Three-Color Marking)
- WHITE = undiscovered, GRAY = on DFS stack, BLACK = done  
- A back edge (edge to a GRAY ancestor) = cycle  
- Invoked before any prerequisite is added  
- Time complexity: O(V + E)

---

## Demo Data

12 courses with realistic prerequisite chains:

```
CS101 Programming Fundamentals        (root)
MA101 Discrete Mathematics            (root)
MA102 Linear Algebra                  (root)
CS201 Data Structures                 (needs CS101)
CS202 Database Systems                (needs CS101)
CS203 Object-Oriented Programming     (needs CS101)
CS301 Algorithms                      (needs CS201, MA101)
CS302 Operating Systems               (needs CS201, CS203)
CS303 Computer Networks               (needs CS302)
AI301 Machine Learning                (needs CS301, MA101, MA102)
AI302 Deep Learning                   (needs AI301, MA102)
CS401 Software Engineering            (needs CS203, CS301)
```

**Study Plan (18 credits/semester):**
```
Semester 1: CS101, MA101, MA102         (9 credits — root courses)
Semester 2: CS201, CS202, CS203         (9 credits)
Semester 3: CS301, CS302               (6 credits)
Semester 4: CS303, AI301, CS401        (10 credits)
Semester 5: AI302                      (4 credits)
```

---

## Algorithm Source Files

All algorithms are in [`backend/algorithms.py`](backend/algorithms.py):

| Function                   | Algorithm         | Complexity |
|----------------------------|-------------------|------------|
| `detect_cycle()`           | DFS 3-color       | O(V + E)   |
| `topological_sort()`       | Kahn's BFS        | O(V + E)   |
| `get_available_courses()`  | Set intersection  | O(V + E)   |
| `get_prerequisite_chain()` | BFS (reverse)     | O(V + E)   |
| `get_all_dependents()`     | BFS (forward)     | O(V + E)   |
| `compute_levels()`         | Topo + propagate  | O(V + E)   |
| `generate_study_plan()`    | Level + credits   | O(V + E)   |
| `get_relation_set()`       | Edge enumeration  | O(E)       |

---

## Features

- ✅ Dashboard with stats, progress bar, and DAG validation status
- ✅ Course manager (add, edit, delete, mark complete)
- ✅ Prerequisite manager (add/remove, chain view, dependents view)
- ✅ Interactive graph visualization (React Flow — draggable nodes)
- ✅ Study plan with credit-limit controls
- ✅ Circular dependency prevention on every write
- ✅ Discrete Mathematics concepts page with complexity table
- ✅ Dark theme UI with animations
