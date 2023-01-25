import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import * as path from 'path';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';

import { CommonModule } from '@src/common/common.module';

import { ServerModule } from '@src/server/server.module';

import { JwtModule } from '@src/jwt/jwt.module';
import { JwtMiddleware } from '@src/jwt/jwt.middleware';

import { FilesModule } from '@src/files/files.module';

import { AuthModule } from '@src/auth/auth.module';

import { User } from '@src/users/entities/user.entity';
import { UsersModule } from '@src/users/users.module';

import { Product } from '@src/products/entities/product.entity';
import { ProductForward } from '@src/products/entities/product-forward-history.entity';
import { ProductEditHistory } from '@src/products/entities/product-edit-history.entity';
import { ProductDeleteHistory } from '@src/products/entities/product-delete-history.entity';
import { ProductsModule } from '@src/products/products.module';

import { StatisticsModule } from '@src/statistics/statistics.module';

import { TimezoneModule } from '@src/timezone/timezone.module';
import { Timezone } from '@src/timezone/entities/timezone.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        SERVER_PORT: Joi.string().required(),
        WEB_FRONT_URL: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        AWS_S3_URL: Joi.string().required(),
        AWS_S3_ACCESS_KEY: Joi.string().required(),
        AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),
        AWS_CLOUD_FRONT_RES_URL: Joi.string().required(),
        OXR_APP_ID: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      bigNumberStrings: false,
      logging: true,
      charset: 'utf8mb4',
      entities: [
        User,
        Product,
        ProductForward,
        ProductEditHistory,
        ProductDeleteHistory,
        Timezone,
      ],
    }),
    ScheduleModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en-US',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-user-lang'])],
    }),
    JwtModule.forRoot({
      privateKey: process.env.JWT_PRIVATE_KEY,
    }),
    FilesModule.forRoot({
      awsS3Url: process.env.AWS_S3_URL,
      awsS3AccessKey: process.env.AWS_S3_ACCESS_KEY,
      awsS3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
      awsS3Region: process.env.AWS_S3_REGION,
      awsCloudFrontResUrl: process.env.AWS_CLOUD_FRONT_RES_URL,
    }),
    CommonModule,
    ServerModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    StatisticsModule,
    TimezoneModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
