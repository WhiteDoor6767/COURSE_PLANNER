from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import engine, get_db, Base
from algorithms import (
    CourseGraph,
    detect_cycle,
    topological_sort,
    get_available_courses,
    get_prerequisite_chain,
    get_all_dependents,
    generate_study_plan,
    get_relation_set,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Course Prerequisite Planner API",
    description="Backend for course prerequisites using Discrete Mathematics",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_graph(db: Session) -> CourseGraph:
    graph = CourseGraph()
    for course in db.query(models.Course).all():
        graph.add_vertex(course.id)
    for link in db.query(models.PrerequisiteLink).all():
        graph.add_edge(link.prerequisite_id, link.course_id)
    return graph


def to_response(course: models.Course) -> schemas.CourseResponse:
    return schemas.CourseResponse(
        id=course.id,
        code=course.code,
        name=course.name,
        credits=course.credits,
        description=course.description,
        completed=course.completed,
    )


def get_course_or_404(course_id: int, db: Session) -> models.Course:
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    return course


@app.get("/courses", response_model=List[schemas.CourseResponse], tags=["Courses"])
def list_courses(db: Session = Depends(get_db)):
    return [
        to_response(c)
        for c in db.query(models.Course).order_by(models.Course.code).all()
    ]


@app.post("/courses", response_model=schemas.CourseResponse, status_code=201, tags=["Courses"])
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    if db.query(models.Course).filter(models.Course.code == course.code).first():
        raise HTTPException(status_code=400, detail=f"Course code '{course.code}' already exists")
    db_course = models.Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return to_response(db_course)


@app.put("/courses/{course_id}", response_model=schemas.CourseResponse, tags=["Courses"])
def update_course(course_id: int, course: schemas.CourseUpdate, db: Session = Depends(get_db)):
    db_course = get_course_or_404(course_id, db)
    existing = db.query(models.Course).filter(
        models.Course.code == course.code,
        models.Course.id != course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Course code '{course.code}' already exists")
    for key, value in course.model_dump().items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return to_response(db_course)


@app.delete("/courses/{course_id}", status_code=204, tags=["Courses"])
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = get_course_or_404(course_id, db)
    db.query(models.PrerequisiteLink).filter(
        (models.PrerequisiteLink.course_id == course_id)
        | (models.PrerequisiteLink.prerequisite_id == course_id)
    ).delete(synchronize_session=False)
    db.delete(db_course)
    db.commit()


@app.patch("/courses/{course_id}/complete", response_model=schemas.CourseResponse, tags=["Courses"])
def toggle_complete(course_id: int, db: Session = Depends(get_db)):
    db_course = get_course_or_404(course_id, db)
    db_course.completed = not db_course.completed
    db.commit()
    db.refresh(db_course)
    return to_response(db_course)


@app.get("/courses/{course_id}/prerequisites", response_model=List[schemas.CourseResponse], tags=["Prerequisites"])
def get_prerequisites(course_id: int, db: Session = Depends(get_db)):
    get_course_or_404(course_id, db)
    links = db.query(models.PrerequisiteLink).filter(
        models.PrerequisiteLink.course_id == course_id
    ).all()
    prereq_ids = [link.prerequisite_id for link in links]
    return [to_response(c) for c in db.query(models.Course).filter(models.Course.id.in_(prereq_ids)).all()]


@app.post("/courses/{course_id}/prerequisites", status_code=201, tags=["Prerequisites"])
def add_prerequisite(course_id: int, request: schemas.PrerequisiteRequest, db: Session = Depends(get_db)):
    if course_id == request.prerequisite_id:
        raise HTTPException(status_code=400, detail="A course cannot be its own prerequisite")
    get_course_or_404(course_id, db)
    get_course_or_404(request.prerequisite_id, db)
    existing = db.query(models.PrerequisiteLink).filter(
        models.PrerequisiteLink.course_id == course_id,
        models.PrerequisiteLink.prerequisite_id == request.prerequisite_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Prerequisite relationship already exists")
    graph = build_graph(db)
    graph.add_edge(request.prerequisite_id, course_id)
    has_cycle, cycle_ids = detect_cycle(graph)
    if has_cycle:
        course_map = {c.id: c for c in db.query(models.Course).all()}
        cycle_courses = [
            to_response(course_map[cid]).model_dump()
            for cid in cycle_ids
            if cid in course_map
        ]
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Adding this prerequisite would create a circular dependency",
                "cycle_courses": cycle_courses,
            },
        )
    link = models.PrerequisiteLink(course_id=course_id, prerequisite_id=request.prerequisite_id)
    db.add(link)
    db.commit()
    return {"message": "Prerequisite added successfully"}


@app.delete("/courses/{course_id}/prerequisites/{prerequisite_id}", status_code=204, tags=["Prerequisites"])
def remove_prerequisite(course_id: int, prerequisite_id: int, db: Session = Depends(get_db)):
    link = db.query(models.PrerequisiteLink).filter(
        models.PrerequisiteLink.course_id == course_id,
        models.PrerequisiteLink.prerequisite_id == prerequisite_id,
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Prerequisite relationship not found")
    db.delete(link)
    db.commit()


@app.get("/graph", response_model=schemas.GraphResponse, tags=["Graph"])
def get_graph(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    links = db.query(models.PrerequisiteLink).all()
    nodes = [schemas.GraphNode(id=c.id, code=c.code, name=c.name, credits=c.credits, completed=c.completed) for c in courses]
    edges = [schemas.GraphEdge(source=link.prerequisite_id, target=link.course_id) for link in links]
    return schemas.GraphResponse(nodes=nodes, edges=edges)


@app.get("/study-plan", tags=["Analysis"])
def get_study_plan(max_credits: int = Query(default=18, ge=1), db: Session = Depends(get_db)):
    graph = build_graph(db)
    courses = db.query(models.Course).all()
    course_map = {c.id: c for c in courses}
    credits_map = {c.id: c.credits for c in courses}
    semester_ids = generate_study_plan(graph, credits_map, max_credits)
    semesters = []
    for i, ids in enumerate(semester_ids):
        sem_courses = [to_response(course_map[cid]) for cid in ids if cid in course_map]
        semesters.append({"semester": i + 1, "courses": sem_courses, "total_credits": sum(c.credits for c in sem_courses)})
    return {"semesters": semesters, "total_courses": len(courses), "total_credits": sum(c.credits for c in courses), "max_credits_per_semester": max_credits}


@app.get("/available-courses", tags=["Analysis"])
def get_available(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    course_map = {c.id: c for c in courses}
    completed_ids = {c.id for c in courses if c.completed}
    all_ids = {c.id for c in courses}
    graph = build_graph(db)
    available_ids = get_available_courses(graph, completed_ids, all_ids)
    not_available = all_ids - completed_ids - set(available_ids)
    return {
        "available": [to_response(course_map[cid]) for cid in available_ids],
        "completed": [to_response(c) for c in courses if c.completed],
        "remaining": [to_response(course_map[cid]) for cid in not_available],
    }


@app.get("/courses/{course_id}/prerequisite-chain", tags=["Analysis"])
def get_prereq_chain(course_id: int, db: Session = Depends(get_db)):
    course = get_course_or_404(course_id, db)
    graph = build_graph(db)
    chain_ids = get_prerequisite_chain(graph, course_id)
    course_map = {c.id: c for c in db.query(models.Course).all()}
    return {"course": to_response(course), "chain": [to_response(course_map[cid]) for cid in chain_ids if cid in course_map]}


@app.get("/courses/{course_id}/dependents", tags=["Analysis"])
def get_dependents(course_id: int, db: Session = Depends(get_db)):
    course = get_course_or_404(course_id, db)
    graph = build_graph(db)
    dep_ids = get_all_dependents(graph, course_id)
    course_map = {c.id: c for c in db.query(models.Course).all()}
    return {"course": to_response(course), "dependents": [to_response(course_map[cid]) for cid in dep_ids if cid in course_map]}


@app.post("/validate-graph", tags=["Analysis"])
def validate_graph(db: Session = Depends(get_db)):
    graph = build_graph(db)
    has_cycle, cycle_ids = detect_cycle(graph)
    course_map = {c.id: c for c in db.query(models.Course).all()}
    cycle_courses = [to_response(course_map[cid]) for cid in cycle_ids if cid in course_map]
    topo_order = []
    if not has_cycle:
        _, order = topological_sort(graph)
        topo_order = [to_response(course_map[cid]) for cid in order if cid in course_map]
    return {
        "valid": not has_cycle,
        "has_cycle": has_cycle,
        "cycle_courses": cycle_courses,
        "topological_order": topo_order,
        "message": "Circular prerequisite detected" if has_cycle else "Graph is a valid DAG",
    }


@app.get("/relation", tags=["Analysis"])
def get_relation(db: Session = Depends(get_db)):
    graph = build_graph(db)
    pairs = get_relation_set(graph)
    course_map = {c.id: c for c in db.query(models.Course).all()}
    relation_list = []
    for a, b in pairs:
        if a in course_map and b in course_map:
            relation_list.append({"from_course": to_response(course_map[a]), "to_course": to_response(course_map[b]), "notation": f"({course_map[a].code}, {course_map[b].code})"})
    return {"relation": relation_list, "cardinality": len(relation_list), "description": "R subset C x C where (a, b) in R means course a must be completed before b"}


@app.get("/stats", tags=["Dashboard"])
def get_stats(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    links = db.query(models.PrerequisiteLink).all()
    graph = build_graph(db)
    completed_ids = {c.id for c in courses if c.completed}
    all_ids = {c.id for c in courses}
    available_ids = get_available_courses(graph, completed_ids, all_ids)
    total = len(courses)
    completed = len(completed_ids)
    available = len(available_ids)
    remaining = max(0, total - completed - available)
    return {
        "total_courses": total,
        "completed_courses": completed,
        "available_courses": available,
        "remaining_courses": remaining,
        "total_prerequisites": len(links),
        "completion_percentage": round((completed / total * 100) if total > 0 else 0, 1),
    }
