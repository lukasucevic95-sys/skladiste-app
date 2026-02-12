const API_URL = "https://skladiste-app-production.up.railway.app";

const barkodInput = document.getElementById("barkodInput");
const scanBtn = document.getElementById("scanBtn");
const productInfo = document.getElementById("productInfo");
const nazivEl = document.getElementById("naziv");
const kolicinaEl = document.getElementById("kolicina");
const addBtn = document.getElementById("addBtn");
const removeBtn = document.getElementById("removeBtn");
const messageEl = document.getElementById("message");

const newBarkod = document.getElementById("newBarkod");
const newNaziv = document.getElementById("newNaziv");
const newKolicina = document.getElementById("newKolicina");
const addProductBtn = document.getElementById("addProductBtn");

let currentBarkod = "";

const html5QrCode = new Html5Qrcode("video");

Html5Qrcode.getCameras().then(cameras => {
  if (cameras && cameras.length) {
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      decodedText => {
        barkodInput.value = decodedText;
        scanBtn.click();
      },
      errorMessage => {}
    );
  }
}).catch(err => console.error(err));

scanBtn.addEventListener("click", async () => {
  const barkod = barkodInput.value.trim();
  if (!barkod) return;

  const res = await fetch(`${API_URL}/product/${barkod}`, {
    headers: { Authorization: "Bearer tvoj-token" }
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

addProductBtn.addEventListener("click", async () => {
  const barkod = newBarkod.value.trim();
  const naziv = newNaziv.value.trim();
  const kolicina = parseInt(newKolicina.value);

  if (!barkod || !naziv || isNaN(kolicina)) {
    messageEl.innerText = "Popuni sve podatke!";
    return;
  }

  const res = await fetch(`${API_URL}/product`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: "Bearer tvoj-token"
    },
    body: JSON.stringify({ barkod, naziv, kolicina })
  });

  const data = await res.json();
  if (data.uspjeh) {
    messageEl.innerText = "Proizvod dodan!";
    newBarkod.value = "";
    newNaziv.value = "";
    newKolicina.value = "";
  } else {
    messageEl.innerText = "Greška pri dodavanju!";
  }
});
