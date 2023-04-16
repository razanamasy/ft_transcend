import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors : true});
	app.use(cookieParser());
	app.enableCors({
			  origin: "*",
			  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
			  preflightContinue: false,
			  optionsSuccessStatus: 204,
				credentials: true
	});

  await app.listen(3000);
}
bootstrap();
