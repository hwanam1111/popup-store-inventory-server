import { HttpException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as multerS3 from 'multer-s3';
import * as dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
}).parsed;

AWS.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

const multerS3StorageConfig = multerS3({
  s3: new AWS.S3(),
  bucket: process.env.AWS_S3_BUCKET_NAME,
  key: function (
    req: Express.Request,
    file: Express.MulterS3.File,
    cb: (error: any, key?: string) => void,
  ) {
    const uploadDirectory = 'popup-store-admin';
    const uuid = uuidv4();
    const fileName = file.originalname.replace(/\s/g, '');
    const fileExt = extname(fileName);
    const uploadTime = new Date().getTime();

    cb(null, `${uploadDirectory}/${uuid}_${uploadTime}${fileExt}`);
  },
});

const fileFilterConfig =
  (filterType: RegExp) =>
  (
    req: Express.Request,
    file: Express.MulterS3.File,
    cb: (error: any, key: boolean) => void,
  ) => {
    if (file.mimetype.match(filterType)) {
      return cb(null, true);
    }

    return cb(
      new HttpException(
        {
          ok: false,
          error: {
            statusType: 'FORBIDDEN',
            statusCode: 403,
            message: 'unsupported-file-format',
          },
        },
        403,
      ),
      false,
    );
  };

export const imageUploadOptions = {
  fileFilter: fileFilterConfig(/\/(jpg|jpeg|png)$/),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  },
  storage: multerS3StorageConfig,
};

export const imagesUploadMaxFiles = 10;
export const imagesUploadOptions = {
  fileFilter: fileFilterConfig(/\/(jpg|jpeg|png)$/),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: imagesUploadMaxFiles,
  },
  storage: multerS3StorageConfig,
};
