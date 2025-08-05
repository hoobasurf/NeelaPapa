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

const status = document.getElementById("status");
const messagesContainer = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const imageUpload = document.getElementById("image-upload");

signInAnonymously(auth).catch(console.error);

onAuthStateChanged(auth, user => {
  if (!user) {
    status.textContent = "🔴 Déconnecté";
    return;
  }

  status.textContent = "🟢 Connecté";

  messageForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text) {
      push(messagesRef, { text, uid: user.uid, time: Date.now() });
      messageInput.value = "";
    }
  });

  imageUpload.addEventListener("change", async e => {
    const file = e.target.files[0];
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
    if (msg.uid === user.uid) div.classList.add("own");

    // Texte
    if (msg.text) {
      div.textContent = msg.text;
    }

    // Image
    if (msg.imageUrl) {
      const img = document.createElement("img");
      img.src = msg.imageUrl;
      img.alt = "Photo envoyée";
      div.appendChild(img);
    }

    // Petite croix rose
    if (msg.uid === user.uid) {
      const closeBtn = document.createElement("span");
      closeBtn.className = "delete-btn";
      closeBtn.textContent = "✖";

      let pressTimer;
      closeBtn.addEventListener("mousedown", () => {
        pressTimer = setTimeout(() => {
          remove(ref(db, `messages/${key}`));
          div.remove(); // en local aussi
        }, 3000);
      });
      closeBtn.addEventListener("mouseup", () => clearTimeout(pressTimer));
      closeBtn.addEventListener("mouseleave", () => clearTimeout(pressTimer));

      div.appendChild(closeBtn);
    }

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
});
