<?php
/**
 * Application Configuration
 * Domain: cache.app.winseeoptik.com
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

define('APP_NAME', 'Auto History Wipe - Admin Dashboard');
define('APP_VERSION', '1.0.0');
define('APP_AUTHOR', 'cs.baguosps@gmail.com');

// Base Paths
define('ROOT_PATH', dirname(__DIR__));
define('APP_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'app');
define('CONFIG_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'config');
define('SETTINGS_FILE', CONFIG_PATH . DIRECTORY_SEPARATOR . 'settings.json');

// Base URL detection (supports localhost/chace/ and cache.app.winseeoptik.com)
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$protocol = $isHttps ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$basePath = ($scriptDir === '/' || $scriptDir === '\\') ? '' : $scriptDir;

define('BASE_URL', rtrim($protocol . $host . $basePath, '/'));
