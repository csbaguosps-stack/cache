<?php
/**
 * SettingsModel.php - Model for managing configuration
 * MVC Architecture
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

class SettingsModel {
    private string $filePath;
    private array $defaultSettings = [
        'extensionEnabled' => true,
        'timeRange' => 'all',
        'customDays' => 1,
        'dataTypes' => [
            'history' => false,
            'downloads' => false,
            'cache' => true,
            'cookies' => false,
            'localStorage' => false,
            'passwords' => false,
            'formData' => false
        ],
        'autoClearOnClose' => false,
        'enableTimed' => true,
        'timedInterval' => 5,
        'timedUnit' => 'minutes',
        'version' => '1.0.0',
        'updatedAt' => 0,
        'forceWipeTimestamp' => null,
        'announcement' => 'Sistem Auto History Wipe aktif dan tersinkronisasi.',
        'serverUrl' => 'https://cache.app.winseeoptik.com'
    ];

    public function __construct(string $filePath = SETTINGS_FILE) {
        $this->filePath = $filePath;
        if (!file_exists($this->filePath)) {
            $this->save($this->defaultSettings);
        }
    }

    /**
     * Get all settings merged with defaults
     */
    public function getAll(): array {
        if (!file_exists($this->filePath)) {
            return $this->defaultSettings;
        }

        $content = @file_get_contents($this->filePath);
        if ($content === false) {
            return $this->defaultSettings;
        }

        $decoded = json_decode($content, true);
        if (!is_array($decoded)) {
            return $this->defaultSettings;
        }

        return array_replace_recursive($this->defaultSettings, $decoded);
    }

    /**
     * Save settings to JSON file
     */
    public function save(array $newSettings): bool {
        $current = $this->getAll();
        $merged = array_replace_recursive($current, $newSettings);
        $merged['updatedAt'] = (int)(microtime(true) * 1000);

        $json = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $tempFile = $this->filePath . '.tmp';

        if (file_put_contents($tempFile, $json) !== false) {
            return rename($tempFile, $this->filePath);
        }

        return file_put_contents($this->filePath, $json) !== false;
    }

    /**
     * Trigger immediate remote force wipe for all connected extensions
     */
    public function triggerForceWipe(): int {
        $timestamp = (int)(microtime(true) * 1000);
        $this->save(['forceWipeTimestamp' => $timestamp]);
        return $timestamp;
    }

    /**
     * Update extension version
     */
    public function updateVersion(string $version): bool {
        return $this->save(['version' => trim($version)]);
    }
}
