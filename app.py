from flask import Flask,render_template,request,redirect,url_for,session,send_file,Response,jsonify
from PIL import Image
from config import db
import gridfs
from bson.objectid import ObjectId
import io
from flask_cors import CORS

app=Flask(__name__)
CORS(app, supports_credentials=True,origins="*")
app.secret_key="hloo"
fs = gridfs.GridFS(db)
users_collection = db["userDetails"]

@app.route('/',methods=['GET','POST'])
def login():
    print("hloo",request.method,flush=True)
    if request.method=="POST":
        uname=request.form.get('suname')
        print(uname,"login",flush=True)
        # password=request.form.get('spassword')
        # login_collection=db["userDetails"]
        # l=login_collection.find_one({"uname":uname,"password":password})
        # print(l,flush=True)
        session['uname']=uname
        print(session['uname'],"session",flush=True)
        return redirect(url_for("home"))

    return render_template('login.html')

@app.route('/home',methods=['GET','POST'])
def home():
    if request.method == 'POST':
        
        username = session['uname']
        print(username,"home",flush=True)
        caption = request.form.get('caption')
        image = request.files.get('postimage')
        if not username:
            return "uname"
        if not caption:
            return "caption"
        if not image:
            return f"image {image}"
        if  image.filename=="":
            return f"fimage {image.filename}"
        if not username or not caption or not image or image.filename == '':
            return "Missing username, caption, or image!", 400

        # Save image to GridFS
        image_id = fs.put(image, filename=image.filename)

        # Find or create user
        user = users_collection.find_one({'username': username})
        if not user:
            user = {'username': username, 'posts': []}
            users_collection.insert_one(user)
        
        # Update user's image list
        # Update user's image list
        users_collection.update_one(
            {'username': username},
            {'$push': {'posts': {
                'image_id': image_id,
                'caption': caption,
                'likes': 0,
                'comments': [],
                'shares': 0,
                'liked_by':[]
            }}}
        )


        return f"Image uploaded and linked to user '{username}' with caption: '{caption}'. Image ID: {image_id}"

    return render_template('home.html',name=session['uname'])

@app.route('/image/<imageid>')
def get_image(imageid):
    try:
        print("hi",flush=True)
        file=fs.get(ObjectId(imageid))
        return Response(file.read(),mimetype="image/jpeg")
    except:
        return "image not found",404
@app.route('/posts')
def get_posts():
    all_posts = users_collection.find()
    result = []
    for post in all_posts:
        for i, p in enumerate(post.get('posts', [])):
            result.append({
                "username": post['username'],
                "image": f"http://127.0.0.1:5000/image/{p['image_id']}",
                "caption": p.get('caption', ''),
                "likes": p.get('likes', 0),
                "shares": p.get('shares', 0),
                "comments": p.get('comments', []),
                "index": i
            })
    return jsonify(result)


@app.route('/posts/<username>/<currentUser>/<int:post_index>/like', methods=['POST'])
def like_post(username, currentUser,post_index):
    post = users_collection.find_one({'username': username})
    if not post:
        return {"error": "User not found"}, 404

    # Get the post the user is interacting with
    post_data = post['posts'][post_index]

    # Check if the user has already liked this post
    if currentUser in post_data.get('liked_by', []):
        # If the user already liked it, unlike it (decrement like count)
        users_collection.update_one(
            {'username': username},
            {'$pull': {f'posts.{post_index}.liked_by': username},
             '$inc': {f'posts.{post_index}.likes': -1}}
        )
        return {"message": "Like removed"}, 200
    else:
        # If the user hasn't liked it yet, add the like (increment like count)
        users_collection.update_one(
            {'username': username},
            {'$push': {f'posts.{post_index}.liked_by': username},
             '$inc': {f'posts.{post_index}.likes': 1}}
        )
        return {"message": "Like added"}, 200


@app.route('/posts/<username>/<int:post_index>/comment', methods=['POST'])
def comment_post(username, post_index):
    comment = request.json.get('text')
    if not comment:
        return {"error": "Empty comment"}, 400
    users_collection.update_one(
        {'username': username},
        {'$push': {f'posts.{post_index}.comments': {'text': comment}}}
    )
    return {"message": "Comment added"}, 200

@app.route('/posts/<username>/<int:post_index>/share', methods=['POST'])
def share_post(username, post_index):
    users_collection.update_one(
        {'username': username},
        {'$inc': {f'posts.{post_index}.shares': 1}}
    )
    return {"message": "Post shared"}, 200

@app.route('/getAllUsers',methods=['GET'])
def getAllUsers():
    users=users_collection.find({},{"username":1,"_id":0,"following":1,"followers":1})
    print(users,flush=True)
    l=list(users)
    print(l,flush=True)
    return jsonify(l)

@app.route('/followAdd',methods=['POST'])
def followAdd():
    data=request.get_json()
    # d=dict(data)
    fuser=data['text']['fuser']
    cuser=data['text']['cuser']
    users_collection.update_one({'username':cuser},{"$addToSet":{"following":fuser}})
    users_collection.update_one({'username':fuser},{"$addToSet":{"followers":cuser}})

    a={}
    return jsonify(a)

@app.route('/followRemove',methods=['POST'])
def followRemove():
    data=request.get_json()
    # d=dict(data)
    fuser=data['text']['fuser']
    cuser=data['text']['cuser']
    users_collection.update_one({'username':cuser},{"$pull":{"following":fuser}})
    users_collection.update_one({'username':fuser},{"$pull":{"followers":cuser}})

    a={}
    return jsonify(a)

@app.route('/getFollowers',methods=['POST'])
def getFollowers():
    data=request.get_json()
    print(data,"getFollowers",flush=True)
    result=[]
    followers=users_collection.find({'username':data['current_user']},{'followers':1,"_id":0})
    # print(followers,flush=True)
    for follower in followers:
        print(follower,flush=True)
        result.append(follower)
    print(result)
    return jsonify(result)

@app.route('/getFollowing',methods=['POST'])
def getFollowing():
    data=request.get_json()
    # print(data,"getFollowing",flush=True)
    result=[]
    followings=users_collection.find({'username':data['current_user']},{'following':1,"_id":0})
    print(followings,flush=True)
    for following in followings:
        print(following,flush=True)
        result.append(following)
    print(result)
    return jsonify(result)

if __name__=="__main__":
    app.run(debug=True)
