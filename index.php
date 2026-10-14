<?php
/**
 * Auto History Wipe - Front Controller / Router (MVC)
 * Target Domain: cache.app.winseeoptik.com
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 * All rights reserved.
 */

require_once __DIR__ . '/config/config.php';
require_once APP_PATH . '/Controllers/AdminController.php';
require_once APP_PATH . '/Controllers/ApiController.php';

// Determine the requested route
$route = $_GET['route'] ?? '';

if (empty($route)) {
    // Try resolving from REQUEST_URI
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $baseDir = dirname($scriptName);

    // Remove base directory from URI
    if ($baseDir !== '/' && $baseDir !== '\\' && strpos($uri, $baseDir) === 0) {
        $uri = substr($uri, strlen($baseDir));
    }
    $route = trim($uri, '/');
    if ($route === 'index.php') {
        $route = '';
    }
}

// Normalize route
$route = strtolower(trim($route, '/'));

// Dispatch to Controller
switch ($route) {
    case '':
    case 'admin':
    case 'index':
        $controller = new AdminController();
        $controller->index();
        break;

    case 'admin/save':
        $controller = new AdminController();
        $controller->save();
        break;

    case 'admin/force-wipe':
        $controller = new AdminController();
        $controller->forceWipe();
        break;

    case 'admin/download-zip':
        $controller = new AdminController();
        $controller->downloadZip();
        break;

    case 'api/config':
    case 'api':
        $controller = new ApiController();
        $controller->getConfig();
        break;

    case 'updates.xml':
    case 'updates':
        $controller = new ApiController();
        $controller->getUpdateXml();
        break;

    default:
        // Default fallback to Admin Dashboard
        $controller = new AdminController();
        $controller->index();
        break;
}
