from  extensions import SQLAlchemy, bcrypt, db
from datetime import datetime, timezone




class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    likes = db.Column(db.Integer, default=0)
    cover_image_path = db.Column(db.String(200))
    steps = db.relationship('Step', backref='recipe', cascade='all, delete-orphan')

class Step(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(255))
    text = db.Column(db.Text)

class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)  # 정수/소수 모두 가능
    unit = db.Column(db.String(20), nullable=False) # 단위
    expiry_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    type = db.Column(db.String(20), nullable=False)  # 'fridge' or 'pantry'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit': self.unit,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
class CalendarEntry(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, nullable = False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    date = db.Column(db.Date, nullable = False)

    recipe = db.relationship('Recipe', backref='calendar_entries')

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'recipe_id': self.recipe_id,
            'date': self.date.isoformat(),
            'recipe_title': self.recipe.title if self.recipe else None
        }
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    