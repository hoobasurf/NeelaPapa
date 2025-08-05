const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const imageUpload = document.getElementById("image-upload");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text !== "") {
    addMessage(text, true);
    input.value = "";
  }
});

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      addMessage(event.target.result, true, true);
    };
    reader.readAsDataURL(file);
  }
});

function addMessage(content, isMe = false, isImage = false) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message");
  if (isMe) messageEl.classList.add("me");

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
  });
  messageEl.appendChild(deleteBtn);

  messages.appendChild(messageEl);
  messageEl.scrollIntoView({ behavior: "smooth" });
}
