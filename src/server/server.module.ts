import { Module } from '@nestjs/common';

import { ServerController } from '@src/server/server.controller';

@Module({
  imports: [],
  controllers: [ServerController],
})
export class ServerModule {}
