import { IsString } from 'class-validator';
import { CoreOutput } from '@src/common/dtos/output.dto';

export class ImagesUploadInput {
  files: Express.MulterS3.File[];

  @IsString()
  directory: string;
}

export class ImagesUploadOutput extends CoreOutput {
  images?: Array<{
    url: string;
    originalFileName: string;
    convertFileName: string;
  }>;
}
