<!--
  Auto History Wipe - Admin Dashboard Layout
  Copyright (c) 2026 by cs.baguosps@gmail.com
  All rights reserved.
-->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle ?? 'Auto History Wipe - Admin Dashboard', ENT_QUOTES, 'UTF-8') ?></title>
  <link rel="icon" type="image/png" href="<?= BASE_URL ?>/icons/icon32.png">
  <link rel="stylesheet" href="<?= BASE_URL ?>/public/css/admin.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Top Navigation Bar -->
  <header class="admin-topbar">
    <div class="topbar-inner">
      <div class="brand-group">
        <img src="<?= BASE_URL ?>/icons/icon48.png" alt="Logo" class="brand-logo">
        <div class="brand-text">
          <span class="brand-title">Auto History Wipe</span>
          <span class="brand-subtitle">Central Management Dashboard &bull; MVC</span>
        </div>
      </div>
      <div class="server-status-pill">
        <span class="live-dot"></span>
        <span class="server-name"><?= htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'Server Active', ENT_QUOTES, 'UTF-8') ?></span>
        <span class="version-tag">v<?= htmlspecialchars($settings['version'] ?? '1.0.0', ENT_QUOTES, 'UTF-8') ?></span>
      </div>
    </div>
  </header>

  <div class="admin-wrapper">
