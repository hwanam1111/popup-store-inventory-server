import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from '@src/common/common.constants';
import { FilesController } from '@src/files/files.controller';
import { FilesModuleOptions } from '@src/files/files.interfaces';
import { FilesService } from '@src/files/files.service';

@Module({
  controllers: [FilesController],
})
export class FilesModule {
  static forRoot(options: FilesModuleOptions): DynamicModule {
    return {
      module: FilesModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        FilesService,
      ],
      exports: [],
    };
  }
}
