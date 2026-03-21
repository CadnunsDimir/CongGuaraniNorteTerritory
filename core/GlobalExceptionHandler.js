import Logger from "./Logger.js";

const GlobalExceptionHandler = (app) => {
    app.use((err, req, res, next) => {

        const status = err.status || 500;
        const mensagem = err.message || 'Erro interno no servidor';
        Logger.error("[GlobalExceptionHandler] "+ mensagem);

        res.status(status).json({
            status: status,
            message: mensagem,
        });
    });

    process.on('unhandledRejection', (reason, promise) => { 
        Logger.error('⚠️ [GlobalExceptionHandler][unhandledRejection] Rejeição não tratada em: '+ promise + ' razão: '+ reason);
    });

    process.on('uncaughtException', (error) => {
        Logger.error('🚨 [GlobalExceptionHandler][uncaughtException] ERRO CRÍTICO: '+ error);
    });
}

export default GlobalExceptionHandler;