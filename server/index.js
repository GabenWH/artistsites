const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require("os");
const https = require("https");

const app = express();
const PORT = 3000;

// Serve static files (including fonts)
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));

// Log every request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static images with error handling
const IMAGES_DIR = path.join(__dirname, 'artfiles');
const ART_FILES_DIR = path.join(__dirname, 'artfiles'); // Define the directory for both art and images

// Function to get public IP address
function getPublicIP(callback) {
    https.get("https://api64.ipify.org?format=json", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
            const ip = JSON.parse(data).ip;
            callback(ip);
        });
    }).on("error", (err) => {
        console.error("🌐 Error fetching public IP:", err);
        callback(null);
    });
}

// Get Local Network IP (LAN)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === "IPv4" && !config.internal) {
                return config.address;
            }
        }
    }
    return "localhost"; // Fallback if no external IP is found
}

app.use('/images', (req, res, next) => {
    const filePath = path.join(IMAGES_DIR, req.url);

    console.log(`⚡ Request for image: ${filePath}`); // Debugging image request

    // Check if the file exists before sending it
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Image not found: ${filePath}`);
        return res.status(404).send('Image not found');
    }

    express.static(IMAGES_DIR)(req, res, next);
});

// Simple test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get("/api/art", (req, res) => {
    fs.readdir(ART_FILES_DIR, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading directory");
        }

        const txtFiles = files.filter(f => f.endsWith(".txt"));

        const allArt = txtFiles.map(file => {
            const filePath = path.join(ART_FILES_DIR, file);
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n").map(line => line.trim());

            const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

            let youtubeLink = null;
            let imageName = lines[0] || '';

            // 🔹 Check if the first line is a YouTube link
            if (youtubePattern.test(lines[0])) {
                youtubeLink = lines[0].replace("watch?v=", "embed/");
                imageName = ''; // Clear imageName since it's a video
            }

            const tags = lines[1] || '';
            const date = parseInt(lines[3]) || 1970;
            const price = lines[5] && lines[5].trim() !== '' ? lines[5] : 'Not for Sale';

            // 🔹 Dynamically determine the server URL
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const imageUrl = imageName ? `${baseUrl}/images/${encodeURIComponent(imageName)}` : '';

            return {
                imageName,
                imageUrl, // 🔹 Dynamically set based on the server address
                youtubeLink, // 🔹 Contains YouTube embed URL if applicable
                tags,
                date,
                price,
                displayLines: [...lines],
            };
        });

        allArt.sort((a, b) => b.date - a.date); // 🔹 Sort by most recent first
        res.json(allArt);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`🔥 ERROR: ${err.message}`);
    res.status(500).send('Internal Server Error');
});

// Start server and fetch public IP
app.listen(PORT, () => {
    const localIP = getLocalIP();

    console.log(`🚀 Server running at:`);
    console.log(`   ▶ Local:   http://localhost:${PORT}`);
    console.log(`   ▶ Network: http://${localIP}:${PORT}`);

    console.log(`📂 Serving images from: ${IMAGES_DIR}`);
    console.log(`📡 Serving metadata from: ${ART_FILES_DIR}`);

    // Fetch Public IP
    getPublicIP((publicIP) => {
        if (publicIP) {
            console.log(`🌍 Public (Internet): http://${publicIP}:${PORT}`);
            console.log(`⚠️ Ensure port forwarding is set up if hosting externally.`);
        } else {
            console.log(`🌍 Public IP could not be detected. Server may not be accessible externally.`);
        }
    });
});