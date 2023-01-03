import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

import s3GetObject from '@src/libs/aws-s3.get-object';
import s3RemoveObject from '@src/libs/aws-s3.remove-object';

export const compressImage = async (fileKey: string) => {
  try {
    const compressedKey = `compressed_${fileKey}`;
    const s3 = new AWS.S3();

    const imageData = await s3GetObject(fileKey);
    const imageBuffer = await sharp(imageData.Body)
      .jpeg({
        quality: 50,
      })
      .toBuffer();

    const resizedConfig = {
      Bucket: 'create-jump-s3',
      Key: compressedKey,
      Body: imageBuffer,
    };

    await s3.putObject(resizedConfig).promise();
    await s3RemoveObject(fileKey);

    return compressedKey;
  } catch (error) {
    console.log('Get image by key from aws: ', error);
  }
};
