function HealthCheckController(app) {
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });
}

export default HealthCheckController;