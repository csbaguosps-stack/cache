<?php
/**
 * Dashboard View
 * MVC Architecture - No Login Required
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */
$types = $settings['dataTypes'] ?? [];
?>

<div class="dashboard-container">
  <!-- Flash Notification -->
  <?php if (!empty($message)): ?>
    <div class="alert-box alert-<?= htmlspecialchars($messageType, ENT_QUOTES, 'UTF-8') ?>">
      <span class="alert-icon"><?= $messageType === 'warning' ? '⚠️' : '✓' ?></span>
      <div class="alert-content">
        <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?>
      </div>
    </div>
  <?php endif; ?>

  <!-- Top Hero Banner -->
  <div class="hero-card">
    <div class="hero-left">
      <h2>Pusat Kontrol Ekstensi Auto History Wipe</h2>
      <p>Kelola pengaturan pembersihan riwayat browser untuk seluruh pengguna ekstensi dari satu dashboard terpusat tanpa perlu login.</p>
    </div>
    <div class="hero-actions">
      <a href="<?= BASE_URL ?>/index.php?route=api/config" target="_blank" class="btn btn-outline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-svg"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        Lihat JSON API
      </a>
      <a href="<?= BASE_URL ?>/index.php?route=admin/download-zip" class="btn btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Download Extension (.ZIP)
      </a>
    </div>
  </div>

  <!-- Status Cards Grid -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon-wrapper bg-blue-soft">🛡️</div>
      <div class="stat-info">
        <span class="stat-label">Status Ekstensi</span>
        <span class="stat-value text-primary"><?= !empty($settings['extensionEnabled']) ? 'AKTIF (ON)' : 'NONAKTIF (OFF)' ?></span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper bg-indigo-soft">⏱️</div>
      <div class="stat-info">
        <span class="stat-label">Interval Otomatis</span>
        <span class="stat-value"><?= !empty($settings['enableTimed']) ? 'Tiap ' . (int)($settings['timedInterval'] ?? 5) . ' ' . htmlspecialchars($settings['timedUnit'] ?? 'minutes') : 'Dinonaktifkan' ?></span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper bg-purple-soft">📅</div>
      <div class="stat-info">
        <span class="stat-label">Rentang Waktu</span>
        <span class="stat-value">
          <?php
            $r = $settings['timeRange'] ?? 'all';
            echo ($r === 'all') ? 'All Time' : (($r === 'custom') ? 'Kustom (' . ($settings['customDays'] ?? 1) . ' Hari)' : strtoupper($r));
          ?>
        </span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper bg-emerald-soft">⚡</div>
      <div class="stat-info">
        <span class="stat-label">Remote Force Wipe</span>
        <span class="stat-value text-emerald"><?= !empty($settings['forceWipeTimestamp']) ? date('H:i:s', (int)($settings['forceWipeTimestamp'] / 1000)) : 'Belum Ada' ?></span>
      </div>
    </div>
  </div>

  <!-- Main Settings Form -->
  <form action="<?= BASE_URL ?>/index.php?route=admin/save" method="POST" id="adminSettingsForm" class="main-form">
    
    <!-- Section 1: Master Status & Time Range -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-step-badge">1</span>
          <div>
            <h3>Status Ekstensi &amp; Rentang Waktu Pembersihan</h3>
            <p class="card-desc">Atur apakah ekstensi aktif secara global dan seberapa jauh riwayat yang akan dibersihkan.</p>
          </div>
        </div>
        <label class="master-switch">
          <input type="checkbox" name="extensionEnabled" value="1" <?= !empty($settings['extensionEnabled']) ? 'checked' : '' ?>>
          <span class="master-slider"></span>
          <span class="switch-label">Aktifkan Ekstensi</span>
        </label>
      </div>

      <div class="card-body">
        <label class="form-section-label">Pilih Rentang Waktu (Time Range):</label>
        <div class="time-pills-row">
          <?php
            $ranges = [
              '1day' => '1 Day',
              '3days' => '3 Days',
              '1week' => '1 Week',
              '1month' => '1 Month',
              'all' => 'All Time',
              'custom' => 'Custom days'
            ];
            $currentRange = $settings['timeRange'] ?? 'all';
            foreach ($ranges as $key => $title):
          ?>
            <label class="pill-radio <?= $currentRange === $key ? 'active' : '' ?>">
              <input type="radio" name="timeRange" value="<?= $key ?>" <?= $currentRange === $key ? 'checked' : '' ?>>
              <span><?= $title ?></span>
            </label>
          <?php endforeach; ?>
        </div>

        <div class="custom-days-box" id="customDaysBox" style="<?= $currentRange === 'custom' ? '' : 'display:none;' ?>">
          <label for="customDays">Masukkan Jumlah Hari Kustom:</label>
          <div class="input-inline">
            <input type="number" name="customDays" id="customDays" class="form-control input-sm" min="1" max="3650" value="<?= htmlspecialchars($settings['customDays'] ?? 1, ENT_QUOTES, 'UTF-8') ?>">
            <span class="unit-text">Hari</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Data Types to Clear -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-step-badge">2</span>
          <div>
            <h3>Jenis Data yang Dihapus (Data Types)</h3>
            <p class="card-desc">Tentukan komponen privasi browser yang akan dibersihkan oleh ekstensi.</p>
          </div>
        </div>
        <div class="quick-toggle-actions">
          <button type="button" class="btn-text" id="btnSelectAllTypes">Pilih Semua</button>
          <span class="dot-sep">&bull;</span>
          <button type="button" class="btn-text" id="btnDeselectAllTypes">Batalkan Semua</button>
        </div>
      </div>

      <div class="card-body">
        <div class="data-types-grid">
          <label class="checkbox-card">
            <input type="checkbox" name="dtype_history" value="1" <?= !empty($types['history']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Browsing History</span>
              <span class="cb-desc">Riwayat pencarian &amp; situs yang dikunjungi</span>
            </div>
          </label>

          <label class="checkbox-card">
            <input type="checkbox" name="dtype_downloads" value="1" <?= !empty($types['downloads']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Download History</span>
              <span class="cb-desc">Daftar riwayat file yang telah diunduh</span>
            </div>
          </label>

          <label class="checkbox-card">
            <input type="checkbox" name="dtype_cache" value="1" <?= !empty($types['cache']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Cache Storage</span>
              <span class="cb-desc">Gambar dan berkas web sementara</span>
            </div>
          </label>

          <label class="checkbox-card">
            <input type="checkbox" name="dtype_cookies" value="1" <?= !empty($types['cookies']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Cookies</span>
              <span class="cb-desc">Sesi login &amp; cookie pelacak situs</span>
            </div>
          </label>

          <label class="checkbox-card">
            <input type="checkbox" name="dtype_localStorage" value="1" <?= !empty($types['localStorage']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Local Storage</span>
              <span class="cb-desc">Data penyimpanan lokal HTML5 aplikasi</span>
            </div>
          </label>

          <label class="checkbox-card">
            <input type="checkbox" name="dtype_passwords" value="1" <?= !empty($types['passwords']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Saved Passwords</span>
              <span class="cb-desc">Kata sandi akun yang tersimpan</span>
            </div>
          </label>

          <label class="checkbox-card">
            <input type="checkbox" name="dtype_formData" value="1" <?= !empty($types['formData']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div class="cb-text">
              <span class="cb-title">Form Data / Autofill</span>
              <span class="cb-desc">Data saran otomatis isian formulir</span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Section 3: Auto Clear Rules -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-step-badge">3</span>
          <div>
            <h3>Aturan Pembersihan Otomatis (Auto Clear Settings)</h3>
            <p class="card-desc">Atur kapan pembersihan otomatis dieksekusi di latar belakang browser pengguna.</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Close Browser Rule -->
        <div class="rule-box">
          <label class="checkbox-line">
            <input type="checkbox" name="autoClearOnClose" value="1" <?= !empty($settings['autoClearOnClose']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div>
              <span class="rule-title">Enable Auto Clear saat Browser Ditutup</span>
              <span class="privacy-tag">💡 Recommended for better privacy!</span>
              <p class="rule-desc">Data yang dipilih akan otomatis dibersihkan setiap kali semua jendela browser ditutup oleh pengguna.</p>
            </div>
          </label>
        </div>

        <!-- Timed Interval Rule -->
        <div class="rule-box">
          <label class="checkbox-line">
            <input type="checkbox" name="enableTimed" id="enableTimedCheckbox" value="1" <?= !empty($settings['enableTimed']) ? 'checked' : '' ?>>
            <span class="cb-custom"></span>
            <div>
              <span class="rule-title">Enable Timed Auto-Clear (Pembersihan Berkala di Latar Belakang)</span>
              <p class="rule-desc">Otomatis membersihkan data secara periodik sesuai interval waktu yang Anda tentukan.</p>
            </div>
          </label>

          <div class="timed-inputs-row" id="timedInputsRow">
            <span class="timed-label">Bersihkan Setiap:</span>
            <input type="number" name="timedInterval" class="form-control interval-box" min="1" max="999" value="<?= htmlspecialchars($settings['timedInterval'] ?? 5, ENT_QUOTES, 'UTF-8') ?>">
            <select name="timedUnit" class="form-control select-box">
              <option value="minutes" <?= ($settings['timedUnit'] ?? 'minutes') === 'minutes' ? 'selected' : '' ?>>Menit (minutes)</option>
              <option value="hours" <?= ($settings['timedUnit'] ?? '') === 'hours' ? 'selected' : '' ?>>Jam (hours)</option>
              <option value="days" <?= ($settings['timedUnit'] ?? '') === 'days' ? 'selected' : '' ?>>Hari (days)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Server & Version Metadata -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-step-badge">4</span>
          <div>
            <h3>Server Sync &amp; Informasi Versi</h3>
            <p class="card-desc">Konfigurasi alamat server sinkronisasi dan nomor versi ekstensi.</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="form-two-cols">
          <div class="form-group">
            <label for="serverUrl" class="form-label">Domain Server Sinkronisasi:</label>
            <input type="text" name="serverUrl" id="serverUrl" class="form-control" value="<?= htmlspecialchars($settings['serverUrl'] ?? BASE_URL, ENT_QUOTES, 'UTF-8') ?>" placeholder="https://domain-anda.com atau http://localhost/chace">
            <small class="form-help">Domain yang akan dihubungi oleh ekstensi untuk menarik konfigurasi otomatis.</small>
          </div>

          <div class="form-group">
            <label for="version" class="form-label">Nomor Versi Ekstensi:</label>
            <input type="text" name="version" id="version" class="form-control" value="<?= htmlspecialchars($settings['version'] ?? '1.0.0', ENT_QUOTES, 'UTF-8') ?>">
            <small class="form-help">Ubah versi ini (misal: 1.0.1) untuk memicu pembaruan pada browser client.</small>
          </div>
        </div>

        <div class="form-group mt-3">
          <label for="announcement" class="form-label">Pesan / Notifikasi Admin:</label>
          <input type="text" name="announcement" id="announcement" class="form-control" value="<?= htmlspecialchars($settings['announcement'] ?? '', ENT_QUOTES, 'UTF-8') ?>" placeholder="Contoh: Pembaruan aturan privasi otomatis aktif.">
        </div>
      </div>
    </div>

    <!-- Bottom Actions Bar -->
    <div class="form-actions-bar">
      <div class="actions-left">
        <button type="submit" class="btn btn-primary btn-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-svg"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          Simpan Semua Pengaturan
        </button>
      </div>

      <div class="actions-right">
        <a href="<?= BASE_URL ?>/index.php?route=admin/force-wipe" class="btn btn-danger" onclick="return confirm('Apakah Anda yakin ingin memicu pembersihan data secara paksa pada SEMUA browser pengguna yang terhubung saat ini?');">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          ⚡ Pemicu Wipe Jarak Jauh (Force Wipe Now)
        </a>
      </div>
    </div>
  </form>
</div>
