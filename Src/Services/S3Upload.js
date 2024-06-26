import S3 from "aws-sdk/clients/s3";
import AWS from "aws-sdk/global";
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

const identityPool = `ap-south-1:9744b1f3-2b0a-462c-94bc-47e80b1ff198`;
AWS.config.update({
    region: "ap-south-1",
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPool,
    }),
});

  
export const S3Upload = (imageUri,filePath, filename) => {
    return new Promise(async(resolve, reject) => {
        await AWS.config.credentials.getPromise();
        const S3Client = new S3();

        const fileUri = imageUri.uri;
        const fileName = filePath+'/'+filename+`-${Date.now()}.jpg`;
        const fileType = 'image/jpeg';
        filePath = fileUri.replace('file://', '');

        const file = await RNFS.readFile(filePath, 'base64');
        const buffer = Buffer.from(file, 'base64');

        const params = {
            Bucket: 'elites-grid-prod',
            Key: fileName,
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: fileType,
        };

        S3Client.upload(params, function(err, data) {
            if (err) {
                console.error("Error uploading file:", err);
                return reject(err);
            }
            resolve(data);
        });
    });
};