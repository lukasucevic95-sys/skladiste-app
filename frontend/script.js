const API_URL = "https://skladiste-app-production.up.railway.app"; // tvoj backend URL

const barkodInput = document.getElementById("barkodInput");
const scanBtn = document.getElementById("scanBtn");
const productInfo = document.getElementById("productInfo");
const nazivEl = document.getElementById("naziv");
const kolicinaEl = document.getElementById("kolicina");
const addBtn = document.getElementById("addBtn");
const removeBtn = document.getElementById("removeBtn");
const messageEl = document.getElementById("message");

let currentBarkod = "";

scanBtn.addEventListener("click", async () => {
  const barkod = barkodInput.value.trim();
  if (!barkod) return;

  const res = await fetch(`${API_URL}/product/${barkod}`, {
    headers: { Authorization: "Bearer tvoj-token" } // kasnije postaviti login token
  });
  const data = await res.json();

  if (!data.postoji) {
    productInfo.classList.add("hidden");
    messageEl.innerText = "Proizvod ne postoji!";
    return;
  }

  currentBarkod = barkod;
  nazivEl.innerText = data.naziv || "N/A";
  kolicinaEl.innerText = data.kolicina;
  productInfo.classList.remove("hidden");
  messageEl.innerText = "";
});

addBtn.addEventListener("click", async () => {
  if (!currentBarkod) return;
  const res = await fetch(`${API_URL}/move`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: "Bearer tvoj-token"
    },
    body: JSON.stringify({ barkod: currentBarkod, delta: 1 })
  });
  const data = await res.json();
  kolicinaEl.innerText = data.kolicina;
});

removeBtn.addEventListener("click", async () => {
  if (!currentBarkod) return;
  const res = await fetch(`${API_URL}/move`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: "Bearer tvoj-token"
    },
    body: JSON.stringify({ barkod: currentBarkod, delta: -1 })
  });
  const data = await res.json();
  kolicinaEl.innerText = data.kolicina;
});
