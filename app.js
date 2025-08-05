const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const imageUpload = document.getElementById("image-upload");

let conversation = JSON.parse(localStorage.getItem("conversation") || "[]");

// Afficher les anciens messages
conversation.forEach(msg => {
  addMessage(msg.content, msg.isImage);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text !== "") {
    addMessage(text);
    saveMessage(text);
    input.value = "";
  }
});

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      addMessage(event.target.result, true);
      saveMessage(event.target.result, true);
    };
    reader.readAsDataURL(file);
  }
});

function addMessage(content, isImage = false) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message");

  if (isImage) {
    const img = document.createElement("img");
    img.src = content;
    img.style.maxWidth = "220px";
    messageEl.appendChild(img);
  } else {
    messageEl.textContent = content;
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = "×";
  deleteBtn.addEventListener("click", () => {
    messageEl.remove();
    conversation = conversation.filter(m => !(m.content === content && m.isImage === isImage));
    localStorage.setItem("conversation", JSON.stringify(conversation));
  });

  messageEl.appendChild(deleteBtn);
  messages.appendChild(messageEl);
  messageEl.scrollIntoView({ behavior: "smooth" });
}

function saveMessage(content, isImage = false) {
  conversation.push({ content, isImage });
  localStorage.setItem("conversation", JSON.stringify(conversation));
}
