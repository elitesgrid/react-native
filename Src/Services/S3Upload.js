import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import FeedService from "./apis/FeedService";
import axios from 'axios';


  
export const S3Upload = (imageUri,filePath, filename) => {
    return new Promise(async(resolve, reject) => {
        const fileName = filePath+'/'+filename+`-${Date.now()}.jpg`;
        let payload = {
            key_path: filePath,
            name: fileName
        }
        let data = await FeedService.generate_presigned_ul(payload);
        if(data.status){
            data = data.data;

            let presigned_url = atob(data.presigned_url);
            // console.log(presigned_url);

            const fileUri = imageUri.uri;
            const filePath = fileUri.replace('file://', '');

            const fileData = await RNFS.readFile(filePath, 'base64');
            const blob = Buffer.from(fileData, 'base64');

            const response = await axios.put(presigned_url, blob, {
                // headers: {
                //     'Content-Type': 'image/jpeg', // or your file type
                // },
            });
            // console.log(presigned_url, data);
            if (response.status === 200) {
                console.log('✅ Upload successful');
                resolve({Location: data.accessible_url});
            } else {
                console.error('⚠️ Upload failed with status:', response.status);
                resolve({});
            }
        }
    });
};