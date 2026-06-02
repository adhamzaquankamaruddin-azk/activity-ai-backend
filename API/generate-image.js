export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan method POST" });
  }

  const { activities } = req.body;

  if (!activities) {
    return res.status(400).json({ error: "Data aktivitas kosong" });
  }

  try {
    const prompt = `
Berdasarkan aktivitas berikut:

${activities}

Analisis kondisi mental dan tingkat stimulasi digital pengguna.

Kemudian buat satu gambar ilustrasi abstrak yang menggambarkan "bentuk pikiran" pengguna hari ini.

Interpretasi visual:

- Jika aktivitas didominasi media sosial / game / scrolling:
  gambarkan otak atau pikiran sebagai kondisi OVERSTIMULATED
  (contoh: kabel kusut, glitch digital, cahaya berlebihan, noise visual, layar bertumpuk)

- Jika aktivitas seimbang:
  gambarkan kondisi NEUTRAL BALANCE
  (contoh: pola geometris stabil, cahaya lembut, ruang modern tenang)

- Jika dominan meditasi / baca / olahraga ringan:
  gambarkan RECOVERY / CALM MIND
  (contoh: taman zen, air tenang, awan lembut, cahaya hangat, otak lebih terorganisir)

Ketentuan visual:

- gaya ilustrasi: digital art, semi-surreal, modern, atmosferik
- fokus pada satu komposisi utama (bukan banyak scene)
- tidak boleh ada teks di dalam gambar
- tidak boleh ada karakter manusia realistis
- bentuk boleh abstrak (otak, energi, ruang mental, simbol)
- gunakan warna sesuai kondisi mental:
  - overstimulated = merah, neon, glitch, kontras tinggi
  - neutral = biru, abu, soft tone
  - recovery = hijau, emas lembut, pastel
`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gagal membuat gambar"
      });
    }

    return res.status(200).json({
      image: data.data[0].b64_json
    });

  } catch (error) {
    return res.status(500).json({
      error: "Gagal menghubungi image API"
    });
  }
}
