from typing import List

from pydantic import BaseModel


class RoomCompletion(BaseModel):
    character: int
    room_id: str

    class Config:
        orm_mode = True


class CharacterBase(BaseModel):
    id: int
    owner: str
    nickname: str


class CharacterCreate(CharacterBase):
    pass


class Character(CharacterBase):
    points: int
    current_room: str
    room_completions: List[RoomCompletion] = []

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    id: int
    shortcode: str
    characters: List[Character] = []

    class Config:
        orm_mode = True
