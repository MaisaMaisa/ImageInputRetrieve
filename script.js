// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
    // YOUR CONFIG DEETS BELOW

    // apiKey: "AIzaSyAYgXGtioxkS7dXtvbOup9gI---LEwZuMo",
    // authDomain: "datainputretrieve.firebaseapp.com",
    // databaseURL: "https://datainputretrieve-default-rtdb.firebaseio.com",
    // projectId: "datainputretrieve",
    // storageBucket: "datainputretrieve.appspot.com",
    // messagingSenderId: "667682354747",
    // appId: "1:667682354747:web:bc98c1b57e5e01fde58e1e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

var files = [];
var reader = new FileReader();

var namebox = document.getElementById('namebox');
var extlab = document.getElementById('extlab');
var myimg = document.getElementById('myImg');
var proglab = document.getElementById('proglab');
var SelBtn = document.getElementById('selbtn');
var UpBtn = document.getElementById('upbtn');
var DownBtn = document.getElementById('downbtn');

var input = document.createElement('input');
input.type = 'file';

input.onchange = e => {
    files = e.target.files;

    var extension = GetFileExt(files[0]);
    var name = GetFileName(files[0]);

    namebox.value = name;
    extlab.innerHTML = extension;

    reader.readAsDataURL(files[0]);
}

reader.onload = function(){
    myimg.src = reader.result;
}

//selection
SelBtn.onclick = function(){
    input.click();
}

function GetFileExt(file){
    var temp = file.name.split('.');
    var ext = temp.slice((temp.length-1), (temp.length));
    return '.' + ext[0];
}

function GetFileName(file){
    var temp = file.name.split('.');
    var fname = temp.slice(0,-1).join('.');
    return fname;
}

//upload process
async function UploadProcess(){
    var ImgToUpload = files[0];

    var ImgName = namebox.value + extlab.innerHTML;

    const metaData = {
        contentType:ImgToUpload.type
    }

    const storage = getStorage();

    const storageRef = sRef(storage, "Images/"+ImgName);

    const UploadTask = uploadBytesResumable(storageRef, ImgToUpload, metaData);

    UploadTask.on('state-changed', (snapshot)=>{
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        proglab.innerHTML = "Upload" + progress + "%";
    },
    (error) =>{
        alert("error: image not uploaded!");
    },
    ()=>{
        getDownloadURL(UploadTask.snapshot.ref).then((downloadURL) => {
            console.log(downloadURL);
        });
    }
    );
}

UpBtn.onclick = UploadProcess;

async function displayAllImages() {
    const storage = getStorage();
    const storageRef = sRef(storage, 'Images/');
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = ''; // Clear previous data

    try {
        const listResult = await listAll(storageRef);
        const urlPromises = listResult.items.map(itemRef => getDownloadURL(itemRef));

        const urls = await Promise.all(urlPromises);
        urls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            dataDisplay.appendChild(img);
        });
    } catch (error) {
        console.error('Error retrieving images:', error);
    }
}

DownBtn.addEventListener('click', displayAllImages);