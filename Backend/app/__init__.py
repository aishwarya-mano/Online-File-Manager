import os,sys
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from flask_login import LoginManager


print('Version: ',sys.version)
app = Flask(__name__)

CORS(app,supports_credentials=True)
app.secret_key = 'YOUR_APP_SECRET_KEY'
app.config.from_object('config')

# AWS RDS
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://admin:PROJECT_NAME.XXXXXXXX.us-east-1.rds.amazonaws.com/fileservice'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 

# AWS S3 Bucket Configs
S3_BUCKET = "YOUR_S3_BUCKET_NAME"
app.config['S3_BUCKET'] = S3_BUCKET
app.config['S3_KEY'] = "S3_KEY"
app.config['S3_SECRET'] = "XXX/S3_SECRET_KEY_VALUE"
app.config['S3_LOCATION'] = 'http://YOUR_S3_BUCKET_NAME.s3.amazonaws.com/'.format(S3_BUCKET)


db = SQLAlchemy(app)
# db.create_all()

from app import views
