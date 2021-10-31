from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    shortcode = Column(String, unique=True, index=True)  # ZHAW Shortcode e.g. "albreaus"
    characters = relationship("Character", back_populates="owner")


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    owner = Column(String, ForeignKey("users.id"), index=True)
    nickname = Column(String, index=True)
    points = Column(Integer)
    current_room = Column(String)  # RoomID
    room_completions = relationship("RoomCompletion", back_populates="character")


class RoomCompletion(Base):
    __tablename__ = "room_completions"

    character = Column(Integer, ForeignKey("characters.id"), primary_key=True, index=True)
    room_id = Column(String, primary_key=True)
