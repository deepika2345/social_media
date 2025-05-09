let displayPost=()=>{
    document.getElementById("upLoadPost").style.display="flex"
}
document.getElementById('closePost').addEventListener('click',()=>{
  document.getElementById("upLoadPost").style.display="none"
})
// let previewImage=(event)=>{
//     const reader=new FileReader()
//     reader.onload=function(){
//         document.getElementById('imgPreview').src=reader.result;
//     };
//     reader.readAsDataURL(event.target.files[0]);
// }

// let likeButton=document.getElementById('likeButton')
// let clickcount=0
// likeButton.addEventListener('click',(e)=>{
//     e.preventDefault();
//     let likeNumber=document.getElementById('like')
//     let likeNo=parseInt(likeNumber.textContent)
//     clickcount++;
//     if(clickcount%2==1){
//         likeNumber.innerHTML=`${likeNo+1}`
//         likeNo++;
//     }
//     else{
//         likeNumber.innerHTML=`${likeNo-1}`
//         likeNo--;
//     }
//     document.getElementById('hlike').value=likeNo;
//     console.log(clickcount);
// })

// document.getElementById("commentButton").addEventListener('click',(e)=>{
//     e.preventDefault()
//     let commentText=document.getElementById('comment').value
//     console.log("comment text",commentText)
//     if(commentText){
//         let commentElement=document.createElement("p");
//         commentElement.textContent=commentText
//         document.getElementById('commentsList').appendChild(commentElement)
//         document.getElementById('comment').value=""
//         document.getElementById('fcomment').style.display="none"
//     }
// })
// let shareCount=0
// document.getElementById("shareButton").addEventListener('click',(e)=>{
//     // e.preventDefault()
//     shareCount++
//     document.getElementById('sharecount').value=shareCount;
//     console.log(document.getElementById('sharecount').value)
//     document.getElementById('shareurl').style.display="block"

// })

// document.getElementById('crossShare').addEventListener('click',()=>{
//     document.getElementById('shareurl').style.display="none"
// })


async function fetchUserProfile() {
  const res = await fetch(`http://localhost:5000/userProfile`);
  const profile = await res.json();
  // Display profile data including followers and following
}

// const token = localStorage.getItem("token"); // assuming user is logged in
// console.log(token)
async function fetchPosts() {
  const res = await fetch("http://localhost:5000/posts");
  const posts = await res.json();
  let current_user=document.getElementById('currentUser').textContent
  // const current_user="{{name}}"
  current_user=current_user.trim()
  console.log(current_user,typeof current_user);
  
  const container = document.getElementById("posts");
  container.innerHTML = "";
  posts.forEach((post, index) => {
    console.log(post,post.username);
    
    const div = document.createElement("div");
div.innerHTML = `
  <p><strong>${post.username}</strong></p>
  <img src="${post.image}" width="200" />
  <p>${post.caption}</p>
  <p>Likes: <span id="likeCount-${post.username}-${post.index}">${post.likes}</span> | Shares: ${post.shares || 0}</p>
  <button id="likeButton-${post.username}-${post.index}" onclick="likePost('${post.username}','${current_user}', ${post.index})">Like</button>
  <button onclick="sharePost('${post.username}', ${post.index})">Share</button>

  <div>
    <strong>Comments:</strong>
    <ul>
      ${(post.comments || []).map(c => `<li>${c.text}</li>`).join("")}
    </ul>
    <textarea id="commentText-${post.username}-${post.index}" placeholder="Write a comment"></textarea>
    <button onclick="submitComment('${post.username}', ${post.index})">Submit</button>
  </div>
  <hr/>
`;

container.appendChild(div);


    // container.appendChild(div);
  });
  
}

async function likePost(username, current_user,index) {
  console.log("likes");
  
  const res = await fetch(`http://localhost:5000/posts/${username}/${current_user}/${index}/like`, {
      method: "POST",
  });
  console.log(res)
  fetchPosts()
  // const data = await res.json();
  // if (data.message === "Like added") {
  //     // Increment like count in the UI
  //     const likeButton = document.getElementById(`likeButton-${username}-${index}`);
  //     const likeCount = document.getElementById(`likeCount-${username}-${index}`);
  //     likeCount.textContent = parseInt(likeCount.textContent) + 1;
  // } else if (data.message === "Like removed") {
  //     // Decrement like count in the UI
  //     const likeButton = document.getElementById(`likeButton-${username}-${index}`);
  //     const likeCount = document.getElementById(`likeCount-${username}-${index}`);
  //     likeCount.textContent = parseInt(likeCount.textContent) - 1;
  // }
}



async function submitComment(username, index) {
  const textarea = document.getElementById(`commentText-${username}-${index}`);
  const text = textarea.value.trim();
  if (!text) return;

  await fetch(`http://localhost:5000/posts/${username}/${index}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  textarea.value = "";
  fetchPosts();
}


async function sharePost(username, index) {
  await fetch(`http://localhost:5000/posts/${username}/${index}/share`, {
    method: "POST"
  });
  fetchPosts();
}

document.getElementById('userButton').addEventListener('click',()=>{
  document.getElementById('userDisplay').style.display="block";
  document.getElementById('userButton').style.display="none"
  document.getElementById('closeUsers').style.display="block"
  displayUsers()
})
document.getElementById('closeUsers').addEventListener('click',()=>{
  document.getElementById('userDisplay').innerHTML="";
  document.getElementById('userButton').style.display="block"
  document.getElementById('closeUsers').style.display="none"
})
async function displayUsers() {
    try {
      let response=await fetch(`http://127.0.0.1:5000/getAllUsers`,{
        method:"GET"
      })
      // console.log(response)
      let result=await response.json()
      // console.log(result)
      let viewUser=document.getElementById('userDisplay')
      let current_user=document.getElementById('currentUser').textContent
      current_user=current_user.trim()
      result.forEach((ele,index)=>{
        console.log(ele,index)
        // console.log(ele['followers'],"ele")
        // let followers=Array.from(ele['followers'])
        console.log(ele['followers'])
        let f=ele['followers']
        if (ele['username']!=current_user && !(f.includes(current_user)) ){
          const div = document.createElement("div");
          div.innerHTML=`
        UserName:${ele['username']}
        <button id="${ele['username']}FollowButton" type="button" onclick="followAdd('${ele['username']}')">Follow</button>
        <button id="${ele['username']}UnFollowButton" type="button" onclick="followRemove('${ele['username']}')" disabled>UnFollow</button>`
        viewUser.appendChild(div)
        }
        else if (ele['username']!=current_user) {
          console.log("it is else if")
          const div = document.createElement("div");
          div.innerHTML=`
        UserName:${ele['username']}
        <button id="${ele['username']}FollowButton" type="button" onclick="followAdd('${ele['username']}')" disabled>Follow</button>
        <button id="${ele['username']}UnFollowButton" type="button" onclick="followRemove('${ele['username']}')">UnFollow</button>`
        viewUser.appendChild(div)
        } 
        
      })
    } catch (error) {
      console.log(error)
    }
}
async function followAdd(userClickFollow) {
  console.log("hi")
  let current_user=document.getElementById('currentUser').textContent
  current_user=current_user.trim()
  text={'fuser':userClickFollow,'cuser':current_user}
  try {
    let response=await fetch(`http://127.0.0.1:5000/followAdd`,{
      method:"POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    })
  } catch (error) {
    console.log(error)
  }
  document.getElementById(`${userClickFollow}FollowButton`).disabled=true;
  document.getElementById(`${userClickFollow}UnFollowButton`).disabled=false;


}


async function followRemove(userClickUnFollow) {
  console.log("hi")
  let current_user=document.getElementById('currentUser').textContent
  current_user=current_user.trim()
  text={'fuser':userClickUnFollow,'cuser':current_user}
  try {
    let response=await fetch(`http://127.0.0.1:5000/followRemove`,{
      method:"POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    })
  } catch (error) {
    console.log(error)
  }
  document.getElementById(`${userClickUnFollow}FollowButton`).disabled=false;
  document.getElementById(`${userClickUnFollow}UnFollowButton`).disabled=true;
}

document.getElementById('getFollowers').addEventListener('click',()=>{
  document.getElementById('followers').style.display="block"
  document.getElementById('hfollower').style.display="block"
  document.getElementById('followersCloseButton').style.display="block"
  document.getElementById('getFollowers').style.display="none"
  getFollowers()
})
let getFollowers=async () => {
  let current_user=document.getElementById('currentUser').textContent
  current_user=current_user.trim()
  // data={"cuser":current_user}
  try {
    let response=await fetch(`http://127.0.0.1:5000/getFollowers`,{
      method:'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({current_user})
    })
    let followerdiv=document.getElementById('followers')
    let result= await response.json()
    console.log(result[0]['followers'])
    let followers=result[0]['followers']
    followers.forEach((follower)=>{
      p=document.createElement('p')
      p.innerHTML=`${follower}`
      followerdiv.appendChild(p)

    })
  } catch (error) {
    console.log("error",error)
  }
}
document.getElementById('followersCloseButton').addEventListener('click',()=>{
  document.getElementById('followers').innerHTML=""
  document.getElementById('followers').style.display="none"
  document.getElementById('hfollower').style.display="none"
  document.getElementById('followersCloseButton').style.display="none"
  document.getElementById('getFollowers').style.display="block"
})

document.getElementById('getFollowing').addEventListener('click',()=>{
  document.getElementById('following').style.display="block"
  document.getElementById('hfollowing').style.display="block"
  document.getElementById('followingCloseButton').style.display="block"
  document.getElementById('getFollowing').style.display="none"
  getFollowing()
})

let getFollowing=async () => {
  let current_user=document.getElementById('currentUser').textContent
  current_user=current_user.trim()
  // data={"cuser":current_user}
  try {
    let response=await fetch(`http://127.0.0.1:5000/getFollowing`,{
      method:'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({current_user})
    })
    let followingdiv=document.getElementById('following')
    let result= await response.json()
    console.log(result[0]['following'])
    let following=result[0]['following']
    following.forEach((following)=>{
      p=document.createElement('p')
      p.innerHTML=`${following}`
      followingdiv.appendChild(p)

    })
  } catch (error) {
    console.log("error",error)
  }
}
document.getElementById('followingCloseButton').addEventListener('click',()=>{
  document.getElementById('following').innerHTML=""
  document.getElementById('following').style.display="none"
  document.getElementById('hfollowing').style.display="none"
  document.getElementById('followingCloseButton').style.display="none"
  document.getElementById('getFollowing').style.display="block"
})

// // Load posts on page load
window.onload = fetchPosts;
