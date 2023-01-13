import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { apiResult } from '@src/api-result';

import { CONFIG_OPTIONS } from '@src/common/common.constants';

import { FilesModuleOptions } from '@src/files/files.interfaces';

import { FilesService } from '@src/files/files.service';

import {
  imagesUploadMaxFiles,
  imagesUploadOptions,
  imageUploadOptions,
} from '@src/files/files.upload-options';

import {
  ImageUploadInput,
  ImageUploadOutput,
} from '@src/files/dtos/image-upload.dto';
import {
  ImagesUploadInput,
  ImagesUploadOutput,
} from '@src/files/dtos/images-upload.dto';

@Controller('v1/files')
export class FilesController {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: FilesModuleOptions,
    private readonly filesService: FilesService,
  ) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async imageUpload(
    @UploadedFile() file: ImageUploadInput['file'],
    @Body('directory') directory: ImageUploadInput['directory'],
  ): Promise<ImageUploadOutput> {
    return apiResult(await this.filesService.imageUpload({ file, directory }));
  }

  @Post('upload/images')
  @UseInterceptors(
    FilesInterceptor('images', imagesUploadMaxFiles, imagesUploadOptions),
  )
  async imageUploads(
    @UploadedFiles() files: ImagesUploadInput['files'],
    @Body('directory') directory: ImagesUploadInput['directory'],
  ): Promise<ImagesUploadOutput> {
    return apiResult(
      await this.filesService.imagesUpload({ files, directory }),
    );
  }
}
