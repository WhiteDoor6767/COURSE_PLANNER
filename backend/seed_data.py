import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import engine, SessionLocal, Base
import models

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    if db.query(models.Course).count() > 0:
        print("Database already seeded.")
        db.close()
        return
    courses = [
        models.Course(code="CS101", name="Programming Fundamentals", credits=3, description="Introduction to programming: variables, control flow, functions, and basic data types."),
        models.Course(code="MA101", name="Discrete Mathematics", credits=3, description="Sets, relations, functions, graph theory, propositional logic, and combinatorics."),
        models.Course(code="MA102", name="Linear Algebra", credits=3, description="Vectors, matrices, systems of equations, linear transformations, and eigenvalues."),
        models.Course(code="CS201", name="Data Structures", credits=3, description="Arrays, linked lists, stacks, queues, trees, heaps, hash tables, and graphs."),
        models.Course(code="CS202", name="Database Systems", credits=3, description="Relational model, SQL, normalization, transactions, and query optimization."),
        models.Course(code="CS203", name="Object-Oriented Programming", credits=3, description="Classes, inheritance, polymorphism, encapsulation, and design patterns."),
        models.Course(code="CS301", name="Algorithms", credits=3, description="Algorithm design, asymptotic analysis, sorting, searching, dynamic programming, graph algorithms."),
        models.Course(code="CS302", name="Operating Systems", credits=3, description="Process management, scheduling, memory management, file systems, and concurrency."),
        models.Course(code="CS303", name="Computer Networks", credits=3, description="Network protocols, TCP/IP model, routing algorithms, and network security."),
        models.Course(code="AI301", name="Machine Learning", credits=4, description="Supervised/unsupervised learning, regression, classification, model evaluation."),
        models.Course(code="AI302", name="Deep Learning", credits=4, description="Neural networks, CNNs, RNNs, transformers, and modern deep learning architectures."),
        models.Course(code="CS401", name="Software Engineering", credits=3, description="SDLC, requirements engineering, design patterns, testing, and agile methodologies."),
    ]
    db.add_all(courses)
    db.flush()
    code_to_id = {c.code: c.id for c in courses}
    prerequisites = [
        ("CS201", "CS101"),
        ("CS202", "CS101"),
        ("CS203", "CS101"),
        ("CS301", "CS201"),
        ("CS301", "MA101"),
        ("CS302", "CS201"),
        ("CS302", "CS203"),
        ("CS303", "CS302"),
        ("AI301", "CS301"),
        ("AI301", "MA101"),
        ("AI301", "MA102"),
        ("AI302", "AI301"),
        ("AI302", "MA102"),
        ("CS401", "CS203"),
        ("CS401", "CS301"),
    ]
    for course_code, prereq_code in prerequisites:
        link = models.PrerequisiteLink(course_id=code_to_id[course_code], prerequisite_id=code_to_id[prereq_code])
        db.add(link)
    db.commit()
    db.close()
    print("Database seeded with 12 courses and 15 prerequisite relationships.")

if __name__ == "__main__":
    seed()
