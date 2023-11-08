import 'dotenv/config'
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3'

// Create an S3 client
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
    },
});

// Define your S3 bucket name
const bucketName = process.env.S3_BUCKET_NAME;

// Define the date range for filtering objects
const startDate = new Date('2023-10-01');
const endDate = new Date('2023-10-31');

// Initialize a count for matching objects
let objectCount = 0;

// Define a function to list objects and count them based on creation date
async function countObjectsByCreationDate(params) {
    try {
        const response = await s3Client.send(new ListObjectsCommand(params));
        const objects = response.Contents;

        objects.forEach((object) => {
            const creationDate = object.LastModified;

            // Check if the object's creation date falls within the specified date range
            if (creationDate >= startDate && creationDate <= endDate) {
                objectCount++;
            }
        });

        // Check if there are more objects to retrieve
        if (response.IsTruncated) {
            // Make another request with the marker to fetch the next set of objects
            params.Marker = objects[objects.length - 1].Key;
            await countObjectsByCreationDate(params);
        } else {
            console.log(`Number of objects created in the specified date range: ${objectCount}`);
        }
    } catch (err) {
        console.error('Error listing S3 objects:', err);
    }
}

// Initial parameters for listing objects
const initialParams = {
    Bucket: bucketName, Prefix: 'OCR/2_', // nid back
    // Bucket: bucketName, Prefix: 'OCR/1_', // nid front 
};

// Call the function to list and count objects based on creation date
countObjectsByCreationDate(initialParams);
