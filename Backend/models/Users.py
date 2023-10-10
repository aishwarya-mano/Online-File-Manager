from app import db
from flask_login import UserMixin

class Users(UserMixin, db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email_id = db.Column(db.String(255))
    password = db.Column(db.String(255))
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    user_role = db.Column(db.String(255))
    files = db.relationship('Files', backref='user', lazy=True)

    def __init__(self, email_id, pwd, fname, lname, user_role):
        self.email_id = email_id
        self.password = pwd
        self.first_name = fname
        self.last_name = lname
        self.user_role = user_role

    def get_id(self):
        return str(self.user_id)
        
