import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://root:{os.environ.get('DB_PASSWORD')}@localhost/expense_tracker"
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
