import { IsString } from 'class-validator';
import { CoreOutput } from '@src/common/dtos/output.dto';

export class ImageUploadInput {
  file: Express.MulterS3.File;

  @IsString()
  directory: string;
}

export class ImageUploadOutput extends CoreOutput {
  image?: {
    url: string;
    originalFileName: string;
    convertFileName: string;
  };
}
