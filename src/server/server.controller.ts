import { Controller, Get } from '@nestjs/common';

@Controller('v1/server')
export class ServerController {
  @Get('/health')
  healthCheck(): boolean {
    return true;
  }
}
