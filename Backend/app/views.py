from app import app, db
from flask import request, jsonify, session
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from app.db_handler import Users, Files
from app import utils
from datetime import datetime
from passlib.apps import custom_app_context as pwd_context


import pytz
import re

pt_timezone = pytz.timezone('US/Pacific')
S3_BUCKET = "YOUR_BUCKT_NAME"

login_manager = LoginManager()
login_manager.init_app(app)


@app.route('/')
def hello():
    return 'Welcome to the Home Page'


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))


@app.route('/login', methods=['POST'])
def login():
    """
    Perform login based on the user name and password provided
    password is encrypted and stored in the database
    """
    if request.method == 'POST':
        req = request.json
        _email_id = req['email_id']
        _password = req['password']

        user = Users.query.filter_by(email_id=_email_id).first()
        if user is None:
            status = False
            return jsonify({'message': 'Email ID not registered!', 'code': '201', 'success': status})            
        if pwd_context.verify(_password, user.password):
            login_user(user)
            status = True
            session["id"] = _email_id
            is_admin = (user.user_role == 'admin')
            return jsonify({'message': 'Login Successful!', 'code': '200', 'success': status, 'user': current_user.first_name, 'is_admin': is_admin})
        else:
            status = False
            return jsonify({'message': 'Entered wrong Password!', 'code': '201', 'success': status})


@app.route("/logout", methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out Successful', 'code': '200', 'success': True})


@app.route('/register', methods=['POST'])
def register_user():
    if request.method == 'POST':
        req = request.json
        print("Received data:", req)
        email = req['email_id']
        password = req['password']
        firstname = req['firstname']
        lastname = req['lastname']
        user_role = req['user_role']
        existing_user = Users.query.filter_by(email_id=email).first()

        if existing_user:
            print(existing_user)
            status = False
            return jsonify({'message': 'User already exists', 'code': '201', 'success': status})
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            status = False
            return jsonify({'message': 'Invalid format for an email address', 'code': '201', 'success': status})
        else:
            print(email, password, firstname, user_role)
            password_hash = pwd_context.encrypt(password)
            new_user = Users(email, password_hash, firstname, lastname, user_role)
            db.session.add(new_user)
            db.session.commit()
            status = True
            return jsonify({'message': 'User created Successfully!', 'code': '200', 'success': status})


@app.route('/add_file', methods=['POST'])
@login_required
def upload_file():
    if request.method != 'POST':
        return
    file = request.files.get('file', None)
    _desc = request.form.get('description', '')

    _current_user_id = current_user.user_id 
    status = False

    if file is None or file.filename == '':
        return jsonify({'message': 'No file selected', 'code': '201', 'success': status})

    if file.content_length > app.config['MAX_CONTENT_LENGTH']:
        return jsonify({'message': 'File Content exceeded the Max allowed', 'code': '201', 'success': status})

    is_allowed_ext = utils.allowed_file(file.filename)
    if not is_allowed_ext:
        return jsonify({'message': 'File extension is not accepted', 'code': '201', 'success': status})

    try:
        file_url = utils.upload_file_to_aws(file)
    except Exception as ex:
        msg = "Error in uploading file to S3: {}".format(ex)
        return jsonify({'message': msg, 'code': '201', 'success': status})

    _filename = utils.secure_filename(file.filename)
    new_file = Files(_filename, _desc, file_url,
                     _current_user_id, datetime.now(pt_timezone))
    try:
        db.session.add(new_file)
        db.session.commit()
        status = True
        return jsonify({'message': 'File uploaded successfully', 'code': '200', 'success': status})
    except Exception as ex:
        return jsonify({'success': False, 'message': str(ex)})

@app.route('/view_file/<int:file_id>', methods=['GET'])
@login_required
def view_file(file_id):
    current_user_id = current_user.user_id
    file = Files.query.filter_by(user_id=current_user_id, file_id = file_id).first()
    if file is None:
        return jsonify({'file': {}})
    file_cdn_url =  "{}/{}".format(app.config['CLOUDFRONT_URL'], file.name)
    file_info = {
        'file_id': file.file_id,
        'filename': file.name,
        'description': file.description,
        'file_url': file_cdn_url,
        'creation_time': file.creation_time.strftime('%Y-%m-%d %H:%M:%S'),
        'updated_time': file.updated_time.strftime('%Y-%m-%d %H:%M:%S')
    }
    return jsonify({'file': file_info})


@app.route('/view_files', methods=['GET'])
@login_required
def view_all_files():
    is_admin = current_user.user_role == 'admin'
    current_user_id = current_user.user_id
    print("Current User: ", current_user_id)

    if is_admin:
        # all_files = Files.query.join(Users).all()
        all_files = db.session.query(Files, Users).join(Users).all()
    else:
        all_files = db.session.query(Files, Users).join(Users).filter_by(user_id=current_user_id).all()
    
    print(all_files);
    

    files_data = []
    for file, user in all_files:
        print(file);
        file_cdn_url =  "{}/{}".format(app.config['CLOUDFRONT_URL'], file.name)
        file_info = {
            'file_id': file.file_id,
            'filename': file.name,
            'description': file.description,
            'file_url': file_cdn_url,
            'uploaded_by': user.last_name + ', ' + user.first_name,
            'creation_time': file.creation_time.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_time': file.updated_time.strftime('%Y-%m-%d %H:%M:%S')
        }
        files_data.append(file_info)
    return jsonify({'files': files_data})


@app.route('/update_file', methods=['POST'])
@login_required
def update_file():
    if request.method != 'POST':
        return
    updated_file = request.files.get('file', None)
    desc = request.form.get('description', '')
    file_id = request.form.get('file_id', '')
    current_user_id = current_user.user_id
    status = False

    file = Files.query.get(file_id)
    if file is None:
        return jsonify({'message': "File ID Not Found", 'code': '201', 'status': status})

    if desc == file.description and updated_file is None:
        return jsonify({'message': "Nothing to Update", 'code': '201', 'status': True})
    print(desc);
    print(file.description);
    if desc != file.description and updated_file is None:
        # only change in desc
        try:
            file.description = desc
            file.updated_time = datetime.now(pt_timezone)
            db.session.commit()
            status = True
            return jsonify({'message': 'Description updated successfully', 'code': '200', 'success': status})
        except Exception as ex:
            return jsonify({'success': False, 'message': str(ex)})        

    # below code file is updated here
    file_url = file.url
    file_name = file.name

    if updated_file is None or updated_file.filename == '':
        return jsonify({'message': 'No file selected', 'code': '201', 'sucess': status})
    if updated_file.content_length > app.config['MAX_CONTENT_LENGTH']:
        return jsonify({'message': 'File Content exceeded the Max allowed', 'code': '201', 'success': status})

    is_allowed_ext = utils.allowed_file(updated_file.filename)
    if not is_allowed_ext:
        return jsonify({'message': 'File extension is not accepted', 'code': '201', 'success': status})

    if file.name != updated_file.name:
        # file was updated and need to get the new file url
        # and delete the old file from the s3 bucket
        file_name = updated_file.filename
        try:
            file_url = utils.upload_file_to_aws(updated_file)
            utils.delete_file_from_aws(file.name)
        except Exception as ex:
            msg = "Error in uploading file to S3: {}".format(ex)
            return jsonify({'message': msg, 'code': '201', 'sucess': status})

    try:
        file.name = file_name
        file.description = desc
        file.url = file_url
        file.updated_time = datetime.now(pt_timezone)
        db.session.commit()
        status = True
        return jsonify({'message': 'File updated successfully', 'code': '200', 'success': status})
    except Exception as ex:
        return jsonify({'success': False, 'message': str(ex)})


@app.route('/delete_file/<int:file_id>', methods=['DELETE'])
@login_required
def delete_file(file_id):
    file = Files.query.get(file_id)
    if file is None:
        return jsonify({'message': "File Not Found", 'code': '201', 'status': False})

    file_user_id = file.user_id
    try:
        utils.delete_file_from_aws(file.name)
    except Exception as ex:
        msg = "Error in deleting the file from S3: {}".format(ex)
        return jsonify({'message': msg, 'code': '201', 'sucess': False})
    try:
        db.session.delete(file)
        db.session.commit()
    except Exception as ex:
        return jsonify({'success': False, 'message': str(ex)})

    if current_user.user_id != file_user_id:
        print("got here")
        # maybe trigger SNS

    return jsonify({'message': 'File deleted successfully', 'code': '200', 'success': True})
