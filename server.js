/**
 * Pranaya E-commerce - Secure Backend Server Engine (RajaOngkir Starter Edition)
 */

console.log("=== SERVER PRANAYA SEDANG BERUSAHA NYALA ===");

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

// TEMPELKAN API KEY RAJAONGKIR STARTER BARU ANDA DI SINI
const RAJAONGKIR_API_KEY = "bcATUID3ade76fc3b2958746lpezepgF"; 

app.use(express.json());
app.use(cors()); // Mengizinkan domain web Anda (seperti GitHub Pages) mengakses backend ini

// 1. Endpoint GET: Mengambil daftar seluruh kota dari seluruh provinsi di Indonesia
app.get('/api/daftar-kota', async (req, res) => {
    try {
        const response = await fetch("https://api.rajaongkir.com/starter/city", {
            method: "GET",
            headers: { "key": RAJAONGKIR_API_KEY }
        });
        const data = await response.json();
        
        // Log monitor untuk melihat respon langsung dari server RajaOngkir di terminal
        console.log("Respon Daftar Kota:", data.rajaongkir.status);

        if (data.rajaongkir && data.rajaongkir.status.code === 200) {
            res.json({ success: true, results: data.rajaongkir.results });
        } else {
            res.json({ success: false, message: data.rajaongkir.status.description });
        }
    } catch (error) {
        console.error("Error Terminal Daftar Kota:", error);
        res.status(500).json({ success: false, error: "Gagal mengambil daftar kota dari RajaOngkir" });
    }
});

// 2. Endpoint POST: Menghitung ongkos kirim domestik JNE berdasarkan ID Kota tujuan & berat total
app.post('/api/cek-ongkir-domestik', async (req, res) => {
    const { destinationCityId, totalWeightGram } = req.body;

    try {
        const response = await fetch("https://api.rajaongkir.com/starter/cost", {
            method: "POST",
            headers: {
                "key": RAJAONGKIR_API_KEY,
                "content-type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                'origin': '501',              // ID Kabupaten Klungkung, Bali (Pusat Pengiriman Pranaya)
                'destination': destinationCityId,
                'weight': totalWeightGram,
                'courier': 'jne'              // Akun starter mendukung: jne, pos, atau tiki
            })
        });

        const data = await response.json();
        
        console.log("Respon Hitung Ongkir:", data.rajaongkir.status);
        
        if (data.rajaongkir && data.rajaongkir.status.code === 200) {
            // Ambil nilai nominal tarif dari opsi paket pertama yang muncul (JNE REG atau OKE)
            const tarifRupiah = data.rajaongkir.results[0].costs[0].cost[0].value;
            res.json({ success: true, ongkirRupiah: tarifRupiah });
        } else {
            res.json({ success: false, message: data.rajaongkir.status.description });
        }
    } catch (error) {
        console.error("Error Terminal Hitung Ongkir:", error);
        res.status(500).json({ success: false, error: "Gagal menghitung biaya ongkir" });
    }
});

// Jalankan aplikasi backend di port 3000
app.listen(PORT, () => {
    console.log(`Server Pranaya berjalan aktif di http://localhost:${PORT}`);
});