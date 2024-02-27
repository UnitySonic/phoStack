const { pool } = require('../db');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const AWS = require("aws-sdk")


const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
};
// Set up AWS SDK
const s3 = new AWS.S3(s3Config)





const getPictureFromDb = async (userData) => {
    let connection;
    try {
        const userId = userData;
        connection = await pool.getConnection();
        connection.beginTransaction();

        const [results] = await connection.execute(
            `SELECT picture FROM User WHERE userId = ?`,
            [userId]
        );

        await connection.commit();
        pictureURL = results[0].picture;

        return pictureURL;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


const savePictureToDb = async (pictureData) => {
    const userId = pictureData.body.userId;
    const file = pictureData.file;

    console.log("let's try printing to the console");

    console.log(file.path)
    let connection;

    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: file.originalname,
            Body: file.buffer,
        };

        s3.upload(params, async (err, data) => {
            if (err) {
                console.error(err);
                throw new Error("Failed to upload file");
            }

            // File uploaded successfully
            console.log('File uploaded successfully:', data.Location);

            try {
                connection = await pool.getConnection();
                connection.beginTransaction();

                // Update the User table to store the URL of the image
                await connection.execute(
                    `UPDATE User SET picture = ? WHERE userId = ?`,
                    [data.Location, userId]
                );

                await connection.commit();
                console.log("Picture URL saved to DB successfully");
            } catch (error) {
                if (connection) {
                    await connection.rollback();
                }
                throw error;
            } finally {
                if (connection) {
                    connection.release();
                }
            }
        });
    } catch (error) {
        throw error;
    }
};




module.exports = {
    getPictureFromDb,
    savePictureToDb,
};
