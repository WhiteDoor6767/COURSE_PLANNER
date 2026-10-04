from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    credits = Column(Integer, default=3)
    description = Column(Text, default="")
    completed = Column(Boolean, default=False)


class PrerequisiteLink(Base):
    __tablename__ = "prerequisite_links"

    course_id = Column(
        Integer,
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True
    )
    prerequisite_id = Column(
        Integer,
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True
    )
