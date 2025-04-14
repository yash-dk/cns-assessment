from app.db.database import Base, engine
from app.models import notebook, user, block

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

def drop_db():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)