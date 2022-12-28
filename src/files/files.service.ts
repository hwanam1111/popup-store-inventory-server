import { Inject, Injectable, HttpException } from '@nestjs/common';

import { CONFIG_OPTIONS } from '@src/common/common.constants';

import s3CopyObject from '@src/libs/aws-s3.copy-object';
import s3RemoveObject from '@src/libs/aws-s3.remove-object';

import { FilesModuleOptions } from '@src/files/files.interfaces';

import {
  ImageUploadInput,
  ImageUploadOutput,
} from '@src/files/dtos/image-upload.dto';
import {
  ImagesUploadInput,
  ImagesUploadOutput,
} from '@src/files/dtos/images-upload.dto';

@Injectable()
export class FilesService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: FilesModuleOptions,
  ) {}

  async imageUpload({
    file,
    directory,
  }: ImageUploadInput): Promise<ImageUploadOutput> {
    try {
      if (!file) {
        return {
          ok: false,
          error: {
            statusCode: 403,
            statusType: 'FORBIDDEN',
            message: 'file-not-found',
          },
        };
      }

      const moveDirectoryLocation = `popup-store-admin/${directory}`;

      const fileKey = file.key;
      const fileName = fileKey.split('/').reverse()[0];
      const originalFileName = file.originalname;

      await s3CopyObject(fileKey, fileName, moveDirectoryLocation);
      await s3RemoveObject(fileKey);

      return {
        ok: true,
        image: {
          url: `${this.options.awsCloudFrontResUrl}/${moveDirectoryLocation}/${fileName}`,
          originalFileName,
          convertFileName: fileName,
        },
      };
    } catch (err) {
      throw new HttpException(
        {
          ok: false,
          serverError: err,
        },
        500,
      );
    }
  }

  async imagesUpload({
    files,
    directory,
  }: ImagesUploadInput): Promise<ImagesUploadOutput> {
    try {
      if (!files || files.length === 0) {
        return {
          ok: false,
          error: {
            statusCode: 403,
            statusType: 'FORBIDDEN',
            message: 'file-not-found',
          },
        };
      }

      const moveDirectoryLocation = `popup-store-admin/${directory}`;
      const images = [];
      for (const file of files) {
        const fileKey = file.key;
        const fileName = fileKey.split('/').reverse()[0];
        const originalFileName = file.originalname;

        await s3CopyObject(fileKey, fileName, moveDirectoryLocation);
        await s3RemoveObject(fileKey);

        images.push({
          url: `${this.options.awsCloudFrontResUrl}/${moveDirectoryLocation}/${fileName}`,
          originalFileName,
          convertFileName: fileName,
        });
      }

      return {
        ok: true,
        images,
      };
    } catch (err) {
      throw new HttpException(
        {
          ok: false,
          serverError: err,
        },
        500,
      );
    }
  }
}
