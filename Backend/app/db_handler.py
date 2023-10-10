from app import db
from flask_login import UserMixin
from datetime import datetime

import pytz
pt_timezone = pytz.timezone('US/Pacific')


class Users(UserMixin, db.Model):
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


class Files(db.Model):
    __tablename__ = 'files'
    file_id = db.Column(db.Integer, primary_key=True,
                        unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    url = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.user_id'), nullable=False)
    creation_time = db.Column(db.DateTime, default=datetime.now(pt_timezone))
    updated_time = db.Column(db.DateTime, default=datetime.now(
        pt_timezone), onupdate=datetime.now(pt_timezone))

    def __init__(self, filename, desc, url, user_id, creation_time=None, update_time=datetime.now(pt_timezone)):
        self.name = filename
        self.description = desc
        self.url = url
        self.user_id = user_id
        self.updated_time = update_time
        if creation_time is not None:
            self.creation_time = creation_time
