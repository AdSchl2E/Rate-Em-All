"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./polyfills");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [process.env.FRONTEND_URL],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const configService = app.get(config_1.ConfigService);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', process.env.PORT);
    if (process.env.NODE_ENV !== 'production') {
        console.log('JWT_SECRET:', configService.get('JWT_SECRET'));
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend running on port ${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map