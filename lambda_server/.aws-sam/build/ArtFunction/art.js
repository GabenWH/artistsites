require('dotenv').config(); // Load environment variables
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const S3_BUCKET = process.env.IMAGE_BUCKET || "my-local-bucket";

const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT || "http://localhost:4566",
    s3ForcePathStyle: true,  // Forces LocalStack to work
    region: "us-east-1",  // Must be set to a region LocalStack recognizes
    accessKeyId: "test",  // LocalStack accepts any credentials
    secretAccessKey: "test" // LocalStack accepts any credentials
});

async function debugS3() {
    try {
        console.log(S3_BUCKET);
        const data = await s3.listObjectsV2({ Bucket: S3_BUCKET }).promise();
        console.log("🟢 S3 Objects:", data.Contents);
    } catch (error) {
        console.error("❌ S3 Access Error:", error);
    }
}

exports.handler = async function (event) {
    try {
        console.log(`📡 Fetching files from ${S3_BUCKET}`);

        //  Debugging S3 before fetching files
        await debugS3();

        // Read metadata files from local disk (for now)
        const ART_FILES_DIR = path.join(__dirname, "artfiles");
        const files = fs.readdirSync(ART_FILES_DIR);
        const txtFiles = files.filter(f => f.endsWith(".txt"));

        const allArt = txtFiles.map(file => {
            const filePath = path.join(ART_FILES_DIR, file);
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n").map(line => line.trim());

            let imageName = lines[0] || '';
            let imageUrl = imageName ? `${process.env.S3_ENDPOINT}/images/${encodeURIComponent(imageName)}` : '';

            return {
                imageName,
                imageUrl,
                displayLines: [...lines]
            };
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(allArt),
        };
    } catch (error) {
        console.error("❌ Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch art data" }),
        };
    }
};
