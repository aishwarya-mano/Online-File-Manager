from werkzeug.utils import secure_filename
from app import app

import boto3

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'py'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def delete_file_from_aws(filename): 
    s3 = boto3.client(
    "s3",
    aws_access_key_id=app.config['S3_KEY'],
    aws_secret_access_key=app.config['S3_SECRET']
    )
    
    s3.delete_object(Bucket=app.config['S3_BUCKET'], Key=filename)  
    return

def upload_file_to_aws(file):
    filename = secure_filename(file.filename)
    s3 = boto3.client(
    "s3",
    aws_access_key_id=app.config['S3_KEY'],
    aws_secret_access_key=app.config['S3_SECRET']
    )
    
    s3.upload_fileobj(file, app.config['S3_BUCKET'], filename)  
    return "{}{}".format(app.config["S3_LOCATION"], file.filename)
