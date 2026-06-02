let data = [];

/* -----------------------------
   KLASIFIKASI DASAR (NON-AI)
------------------------------*/

function classify(activity) {
  const a = activity.toLowerCase();

  const highDopamine = ["tiktok", "reels", "instagram", "game", "youtube shorts", "scroll"];
  const recovery = ["meditasi", "reading", "baca", "olahraga", "journaling", "jalan"];
  
  for (let h of highDopamine) {
    if (a.includes(h)) return "HIGH";
  }

  for (let r of recovery) {
    if (a.includes(r)) return "RECOVERY";
  }

  return "NEUTRAL";
}

/* -----------------------------
   UI RENDER
------------------------------*/

function render() {
  let total = 0;
  let text = "";

  data.forEach((d, i) => {
    total += d.m;
    text += `${i + 1}. ${d.a} - ${d.m} menit [${d.type}]\n`;
  });

  document.getElementById("total").innerText = "Total: " + total + " menit";
  document.getElementById("list").innerText = text || "Belum ada data";
}

function tambah() {
  const a = document.getElementById("act").value.trim();
  const m = Number(document.getElementById("min").value);

  if (!a || !m) return alert("Isi aktivitas dan durasi dengan benar");

  const type = classify(a);

  data.push({ a, m, type });

  document.getElementById("act").value = "";
  document.getElementById("min").value = "";

  render();
}

/* -----------------------------
   ANALISIS AI (BACKEND)
------------------------------*/

async function analisis() {
  if (data.length === 0) return;

  document.getElementById("result").innerText = "Menganalisis kondisi mental...";

  const daftar = data.map((d, i) =>
    `${i + 1}. ${d.a} - ${d.m} menit (${d.type})`
  ).join("\n");

  try {
    const res = await fetch("https://activity-ai-backend.vercel.app/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activities: daftar })
    });

    const json = await res.json();

    document.getElementById("result").innerText =
      json.result || json.error || "Tidak ada hasil";
  } catch {
    document.getElementById("result").innerText = "Gagal koneksi ke AI";
  }
}

/* -----------------------------
   GENERATE IMAGE AI
------------------------------*/

async function generateImage() {
  if (data.length === 0) {
    document.getElementById("status").innerText = "Tambahkan aktivitas terlebih dahulu";
    return;
  }

  document.getElementById("status").innerText = "Membuat visual otak...";
  document.getElementById("img").style.display = "none";

  const daftar = data.map((d, i) =>
    `${i + 1}. ${d.a} - ${d.m} menit (${d.type})`
  ).join("\n");

  try {
    const res = await fetch("https://activity-ai-backend.vercel.app/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activities: daftar })
    });

    const json = await res.json();

    if (json.image) {
      document.getElementById("img").src = "data:image/png;base64," + json.image;
      document.getElementById("img").style.display = "block";
      document.getElementById("status").innerText = "Visualisasi berhasil dibuat";
    } else {
      document.getElementById("status").innerText = json.error || "Gagal membuat gambar";
    }

  } catch {
    document.getElementById("status").innerText = "Gagal menghubungi server";
  }
}

render();
