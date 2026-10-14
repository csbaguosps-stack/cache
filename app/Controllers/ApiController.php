<?php
/**
 * ApiController.php - API endpoints for Chrome Extension Auto-Sync and Auto-Update
 * MVC Architecture
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

require_once APP_PATH . '/Models/SettingsModel.php';

class ApiController {
    private SettingsModel $model;

    public function __construct() {
        $this->model = new SettingsModel();
    }

    /**
     * Send CORS headers to allow extension cross-origin requests
     */
    private function setCorsHeaders(): void {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * Endpoint: GET /api/config or ?route=api/config
     * Returns full configuration for Chrome Extension
     */
    public function getConfig(): void {
        $this->setCorsHeaders();
        header('Content-Type: application/json; charset=UTF-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');

        $settings = $this->model->getAll();
        echo json_encode([
            'status' => 'success',
            'server' => 'cache.app.winseeoptik.com',
            'timestamp' => (int)(microtime(true) * 1000),
            'config' => $settings
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Endpoint: GET /updates.xml or ?route=updates.xml
     * Google Chrome Extension Auto-Update Protocol XML
     */
    public function getUpdateXml(): void {
        $this->setCorsHeaders();
        header('Content-Type: application/xml; charset=UTF-8');

        $settings = $this->model->getAll();
        $version = htmlspecialchars($settings['version'] ?? '1.0.0', ENT_QUOTES, 'UTF-8');
        $codebaseUrl = rtrim($settings['serverUrl'] ?? BASE_URL, '/') . '/index.php?route=admin/download-zip';

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">' . "\n";
        echo '  <app appid="amndpakmdficmebaknminpdbgdccfkjn">' . "\n";
        echo '    <updatecheck codebase="' . $codebaseUrl . '" version="' . $version . '" />' . "\n";
        echo '  </app>' . "\n";
        echo '</gupdate>' . "\n";
        exit;
    }
}
