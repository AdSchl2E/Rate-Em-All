"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("./polyfills");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [process.env.FRONTEND_URL],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.init();
    return app;
}
async function bootstrap() {
    const app = await createApp();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend running on port ${port}`);
}
let cachedServer;
async function handler(req, res) {
    if (!cachedServer) {
        const app = await createApp();
        cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer(req, res);
}
if (!process.env.VERCEL) {
    void bootstrap();
}
//# sourceMappingURL=main.js.map