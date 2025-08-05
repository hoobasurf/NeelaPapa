import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9un4-XugVTiP4pLlJ2P7pX_EddWQWjV4",
  authDomain: "neelapapa-e33a7.firebaseapp.com",
  databaseURL: "https://neelapapa-e33a7-default-rtdb.firebaseio.com",
  projectId: "neelapapa-e33a7",
  storageBucket: "neelapapa-e33a7.firebasestorage.app",
  messagingSenderId: "91492229900",
  appId: "1:91492229900:web:ec61b2592b19627f155f29",
  measurementId: "G-086NSRZF51"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const messagesRef = ref(db, "messages");

const statusEl = document.getElementById("status");
const messagesEl = document.getElementById("messages");
const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const imageInput = document.getElementById("image-upload");

signInAnonymously(auth).catch(console.error);

onAuthStateChanged(auth, user => {
  if (!user) {
    statusEl.textContent = "🔴 Déconnecté";
    return;
  }
  statusEl.textContent = "🟢 Connecté";

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      push(messagesRef, { text, uid: user.uid, time: Date.now() });
      input.value = "";
    }
  });

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("https://api.imgbb.com/1/upload?key=0df97650eaea3c785ca5c8ea0e37ac12", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data?.data?.url) {
      push(messagesRef, { imageUrl: data.data.url, uid: user.uid, time: Date.now() });
    }
  });

  onChildAdded(messagesRef, snapshot => {
    const msg = snapshot.val();
    const key = snapshot.key;
    const div = document.createElement("div");
    div.className = "message";
    if (msg.uid === user.uid) div.classList.add("me");

    // Contenu
    if (msg.text) {
      div.textContent = msg.text;
    } else if (msg.imageUrl) {
      const img = document.createElement("img");
      img.src = msg.imageUrl;
      img.alt = "Photo";
      div.appendChild(img);
    }

    // Ajout de la croix de suppression
    const del = document.createElement("span");
    del.className = "delete-btn";
    del.textContent = "✖";
    del.onclick = () => {
      remove(ref(db, `messages/${key}`)); // supprime aussi dans Firebase
      div.remove();
    };
    div.appendChild(del);

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
});
