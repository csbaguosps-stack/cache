<?php
/**
 * AdminController.php - Controller for Admin Dashboard
 * MVC Architecture (No Login Required)
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

require_once APP_PATH . '/Models/SettingsModel.php';

class AdminController {
    private SettingsModel $model;

    public function __construct() {
        $this->model = new SettingsModel();
    }

    /**
     * Render Admin Dashboard
     */
    public function index(string $message = '', string $messageType = 'success'): void {
        $settings = $this->model->getAll();
        $pageTitle = 'Dashboard Admin - Auto History Wipe';
        
        require APP_PATH . '/Views/layouts/header.php';
        require APP_PATH . '/Views/admin/dashboard.php';
        require APP_PATH . '/Views/layouts/footer.php';
    }

    /**
     * Handle Settings Update Form Submission
     */
    public function save(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: ' . BASE_URL . '/index.php');
            exit;
        }

        $dataTypes = [
            'history' => !empty($_POST['dtype_history']),
            'downloads' => !empty($_POST['dtype_downloads']),
            'cache' => !empty($_POST['dtype_cache']),
            'cookies' => !empty($_POST['dtype_cookies']),
            'localStorage' => !empty($_POST['dtype_localStorage']),
            'passwords' => !empty($_POST['dtype_passwords']),
            'formData' => !empty($_POST['dtype_formData'])
        ];

        $payload = [
            'extensionEnabled' => !empty($_POST['extensionEnabled']),
            'timeRange' => $_POST['timeRange'] ?? 'all',
            'customDays' => max(1, (int)($_POST['customDays'] ?? 1)),
            'dataTypes' => $dataTypes,
            'autoClearOnClose' => !empty($_POST['autoClearOnClose']),
            'enableTimed' => !empty($_POST['enableTimed']),
            'timedInterval' => max(1, (int)($_POST['timedInterval'] ?? 5)),
            'timedUnit' => $_POST['timedUnit'] ?? 'minutes',
            'version' => trim($_POST['version'] ?? '1.0.0'),
            'announcement' => trim($_POST['announcement'] ?? ''),
            'serverUrl' => trim($_POST['serverUrl'] ?? 'https://cache.app.winseeoptik.com')
        ];

        $this->model->save($payload);

        // Also sync manifest.json version if changed
        $this->syncManifestVersion($payload['version']);

        $this->index('Pengaturan berhasil disimpan! Ekstensi akan otomatis tersinkronisasi.', 'success');
    }

    /**
     * Trigger immediate remote force wipe for all connected extensions
     */
    public function forceWipe(): void {
        $timestamp = $this->model->triggerForceWipe();
        $timeStr = date('H:i:s d-m-Y', (int)($timestamp / 1000));
        $this->index("Perintah Wipe Riwayat Jarak Jauh (Remote Wipe) berhasil dikirim pada {$timeStr}! Semua ekstensi yang terhubung akan segera membersihkan data.", 'warning');
    }

    /**
     * Download Extension as ZIP package
     */
    public function downloadZip(): void {
        if (!class_exists('ZipArchive')) {
            die('ZipArchive extension is not available in PHP.');
        }

        $zip = new ZipArchive();
        $zipFileName = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'auto_history_wipe_' . time() . '.zip';

        if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            die('Cannot create zip file.');
        }

        $filesToInclude = [
            'manifest.json',
            'background.js',
            'README.md',
            'icons/icon16.png',
            'icons/icon32.png',
            'icons/icon48.png',
            'icons/icon128.png',
            'icons/icon.svg',
            'options/options.html',
            'options/options.css',
            'options/options.js',
            'popup/popup.html',
            'popup/popup.css',
            'popup/popup.js',
            'html/options.html'
        ];

        foreach ($filesToInclude as $relPath) {
            $absPath = ROOT_PATH . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
            if (file_exists($absPath)) {
                $zip->addFile($absPath, $relPath);
            }
        }

        $zip->close();

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="auto-history-wipe-extension.zip"');
        header('Content-Length: ' . filesize($zipFileName));
        readfile($zipFileName);
        @unlink($zipFileName);
        exit;
    }

    /**
     * Helper to keep manifest.json version in sync
     */
    private function syncManifestVersion(string $version): void {
        $manifestPath = ROOT_PATH . '/manifest.json';
        if (file_exists($manifestPath)) {
            $content = file_get_contents($manifestPath);
            $json = json_decode($content, true);
            if (is_array($json)) {
                $json['version'] = $version;
                file_put_contents($manifestPath, json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            }
        }
    }
}
