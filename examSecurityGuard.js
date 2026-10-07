/**
 * EXAM SECURITY GUARD - Client-Side Anti-Tampering & Integrity Engine
 * 
 * Modul keamanan tingkat lanjut untuk Mode Ujian Serentak:
 * 1. Prototype Freeze & Clean Iframe Sandbox Integrity Check
 * 2. Dynamic Telemetry & Anti-Passive Tab Drift Detection
 * 3. Behavioral Interaction Entropy (Mouse velocity std-dev, flight-time)
 * 4. Content Protection (DevTools shortcuts, contextmenu, honeytoken traps)
 * 5. Dynamic Canvas Watermark & Security HUD
 * 6. Real-time Violation Dispatcher to Firebase Realtime Database
 */

(function () {
  'use strict';

  // --- 1. EARLY NATIVE REPOSITORY SNAPSHOT ---
  // Ambil referensi murni sebelum skrip pihak ketiga / Tampermonkey sempat berjalan
  const _realFetch = window.fetch ? window.fetch.bind(window) : null;
  const _realAddEventListener = EventTarget.prototype.addEventListener.bind(window);
  const _realDocAddEventListener = EventTarget.prototype.addEventListener.bind(document);
  const _realGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  const _realToString = Function.prototype.toString;
  const _realPerformanceNow = window.performance && window.performance.now ? window.performance.now.bind(window.performance) : () => Date.now();
  const _realDateNow = Date.now.bind(Date);

  // Hidden clean sandbox iframe
  let cleanIframe = null;
  let cleanWindow = null;

  try {
    cleanIframe = document.createElement('iframe');
    cleanIframe.style.display = 'none';
    cleanIframe.setAttribute('sandbox', 'allow-same-origin');
    cleanIframe.src = 'about:blank';
    (document.head || document.documentElement).appendChild(cleanIframe);
    if (cleanIframe.contentWindow) {
      cleanWindow = cleanIframe.contentWindow;
    }
  } catch (e) {
    console.warn('[ExamGuard] Clean iframe sandbox initialization note:', e);
  }

  // --- 2. STATE & CONFIGURATION ---
  let isGuardRunning = false;
  let heartbeatTimer = null;
  let integrityAuditTimer = null;
  let lastHeartbeatPerf = _realPerformanceNow();
  let lastHeartbeatEpoch = _realDateNow();
  let violationCount = 0;
  let mouseVelocities = [];
  let lastMousePoint = { x: 0, y: 0, t: _realPerformanceNow() };
  let keyFlightTimes = [];
  let lastKeydownTime = 0;
  let hudContainer = null;
  let watermarkCanvas = null;
  let honeytokenElement = null;

  const REPORTED_VIOLATIONS = new Set();

  // Helper untuk mendapatkan identitas user saat ini
  function getUserIdentity() {
    let uid = 'anonymous';
    let email = 'unknown@student.id';
    let displayName = 'Siswa';

    try {
      if (window.auth && window.auth.currentUser) {
        uid = window.auth.currentUser.uid;
        email = window.auth.currentUser.email || email;
        displayName = window.auth.currentUser.displayName || window.currentUser || displayName;
      } else if (window.currentUser) {
        displayName = window.currentUser;
      }
    } catch (e) {}

    return { uid, email, displayName };
  }

  // --- 3. AUDIT INTEGRITAS LINGKUNGAN JAVASCRIPT ---
  function inspectJavaScriptIntegrity() {
    const issues = [];
    if (!cleanWindow && cleanIframe && cleanIframe.contentWindow) {
      cleanWindow = cleanIframe.contentWindow;
    }

    // 3a. Periksa keaslian window.fetch
    try {
      if (window.fetch) {
        const fetchStr = _realToString.call(window.fetch);
        if (!fetchStr.includes('[native code]') || fetchStr.length > 55) {
          issues.push({
            type: 'FETCH_MONKEYPATCH_DETECTED',
            details: 'window.fetch telah ditimpa atau dibungkus oleh skrip eksternal'
          });
        }
        if (cleanWindow && cleanWindow.fetch && window.fetch !== cleanWindow.fetch) {
          issues.push({
            type: 'FETCH_INSTANCE_DIVERGENCE',
            details: 'window.fetch tidak cocok dengan objek murni sandbox'
          });
        }
      }
    } catch (e) {}

    // 3b. Periksa EventTarget.prototype.addEventListener
    try {
      if (cleanWindow && cleanWindow.EventTarget) {
        if (EventTarget.prototype.addEventListener !== cleanWindow.EventTarget.prototype.addEventListener) {
          issues.push({
            type: 'ADD_EVENT_LISTENER_TAMPERED',
            details: 'EventTarget.prototype.addEventListener telah di-intercept'
          });
        }
      }
    } catch (e) {}

    // 3c. Periksa document.hidden & visibilityState spoofing
    try {
      const hiddenDesc = _realGetOwnPropertyDescriptor(Document.prototype, 'hidden');
      if (hiddenDesc && hiddenDesc.get) {
        const getStr = _realToString.call(hiddenDesc.get);
        if (!getStr.includes('[native code]')) {
          issues.push({
            type: 'DOCUMENT_HIDDEN_SPOOFED',
            details: 'Getter document.hidden dimanipulasi dengan fungsi tiruan'
          });
        }
      }
      const visDesc = _realGetOwnPropertyDescriptor(Document.prototype, 'visibilityState');
      if (visDesc && visDesc.get) {
        const getStr = _realToString.call(visDesc.get);
        if (!getStr.includes('[native code]')) {
          issues.push({
            type: 'VISIBILITY_STATE_SPOOFED',
            details: 'Getter document.visibilityState dimanipulasi dengan fungsi tiruan'
          });
        }
      }
    } catch (e) {}

    // 3d. Periksa manipulasi navigator.sendBeacon
    try {
      if (cleanWindow && cleanWindow.navigator && cleanWindow.navigator.sendBeacon) {
        if (navigator.sendBeacon !== cleanWindow.navigator.sendBeacon) {
          issues.push({
            type: 'SEND_BEACON_TAMPERED',
            details: 'navigator.sendBeacon telah diganti'
          });
        }
      }
    } catch (e) {}

    return issues;
  }

  // --- 4. TELEMETRI PELANGGARAN & INTEGRASI FIREBASE ---
  function dispatchViolation(violation) {
    const violationKey = `${violation.type}_${Math.floor(_realDateNow() / 15000)}`;
    if (REPORTED_VIOLATIONS.has(violationKey)) {
      return; // Hindari spam berulang dalam jendela 15 detik
    }
    REPORTED_VIOLATIONS.add(violationKey);
    violationCount++;

    const identity = getUserIdentity();
    const violationRecord = {
      uid: identity.uid,
      userName: identity.displayName,
      userEmail: identity.email,
      violationType: violation.type,
      details: violation.details,
      timestamp: _realDateNow(),
      perfTimestamp: Math.round(_realPerformanceNow()),
      status: 'TAINTED',
      resolved: false,
      userAgent: navigator.userAgent
    };

    console.warn(`[EXAM INTEGRITY BREACH] [${violation.type}]: ${violation.details}`);

    // Simpan ke Firebase Realtime Database jika tersedia
    try {
      if (window.db && window.dbRef && window.dbSet) {
        const violationId = `${identity.uid}_${_realDateNow()}`;
        const violationRef = window.dbRef(window.db, `system/exam_security_violations/${violationId}`);
        window.dbSet(violationRef, violationRecord);

        // Tandai status user menjadi TAINTED
        if (identity.uid && identity.uid !== 'anonymous') {
          const userSecRef = window.dbRef(window.db, `users/${identity.uid}/examSecurityStatus`);
          window.dbSet(userSecRef, {
            tainted: true,
            lastViolation: violation.type,
            lastViolationTime: _realDateNow(),
            violationCount: violationCount
          });
        }
      }
    } catch (e) {
      console.error('[ExamGuard] Gagal menyimpan log pelanggaran ke DB:', e);
    }

    // Tampilkan peringatan visual ketat di UI klien
    if (typeof window.showToast === 'function') {
      window.showToast(`🚨 SISTEM INTEGRITAS: Anomali [${violation.type}] terdeteksi & dicatat server!`, 'error');
    }

    // Bunyikan audio alert jika tersedia
    if (typeof window.playSuccessSound === 'function') {
      window.playSuccessSound('coin');
    }

    // Update status di HUD watermark
    updateHudStatus(`⚠️ TERDETEKSI: ${violation.type}`);
  }

  // --- 5. HEARTBEAT DUA ARAH & TIME-DRIFT DETECTION ---
  function executeHeartbeatTick() {
    if (!isGuardRunning) return;

    const currentPerf = _realPerformanceNow();
    const currentEpoch = _realDateNow();

    const expectedInterval = 1000; // 1 detik
    const actualPerfDelta = currentPerf - lastHeartbeatPerf;
    const actualEpochDelta = currentEpoch - lastHeartbeatEpoch;

    lastHeartbeatPerf = currentPerf;
    lastHeartbeatEpoch = currentEpoch;

    // Time-drift analysis: Browser membatasi (throttle) background tab dari 1000ms menjadi > 2500ms
    // Ini mengidentifikasi pengguna yang berpindah tab atau mem-freeze window meskipun document.hidden dispoof!
    if (actualPerfDelta > 2800) {
      dispatchViolation({
        type: 'BACKGROUND_TAB_THROTTLE_DRIFT',
        details: `Interval eksekusi melambat drastis (${Math.round(actualPerfDelta)}ms). Tab terindikasi berada di latar belakang atau dibekukan.`
      });
    }

    // Periksa anomali sinkronisasi jam sistem
    const clockSkew = Math.abs(actualEpochDelta - actualPerfDelta);
    if (clockSkew > 1500) {
      dispatchViolation({
        type: 'CLOCK_SKEW_DRIFT_ANOMALY',
        details: `Selisih waktu monotonic dan epoch tidak konsisten (${Math.round(clockSkew)}ms).`
      });
    }

    // Periksa integritas runtime secara periodik
    const envIssues = inspectJavaScriptIntegrity();
    if (envIssues.length > 0) {
      envIssues.forEach(dispatchViolation);
    }
  }

  // --- 6. ENTROPI INTERAKSI PENGGUNA (MOUSE & KEYSTROKE) ---
  function handleMouseMove(e) {
    if (!isGuardRunning) return;
    const now = _realPerformanceNow();
    const dt = now - lastMousePoint.t;
    if (dt >= 20) {
      const dx = e.clientX - lastMousePoint.x;
      const dy = e.clientY - lastMousePoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const velocity = dist / dt;

      mouseVelocities.push(velocity);
      if (mouseVelocities.length > 40) mouseVelocities.shift();

      lastMousePoint = { x: e.clientX, y: e.clientY, t: now };
    }
  }

  function handleKeydown(e) {
    if (!isGuardRunning) return;

    // 6a. Blokir tombol inspeksi DevTools & pintasan umum
    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    // F12
    if (key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      dispatchViolation({
        type: 'DEVTOOLS_SHORTCUT_ATTEMPT',
        details: 'Percobaan membuka DevTools melalui tombol F12 diblokir'
      });
      return false;
    }

    // Ctrl+Shift+I / J / C (DevTools Inspector)
    if (ctrl && shift && (key === 'I' || key === 'i' || key === 'J' || key === 'j' || key === 'C' || key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      dispatchViolation({
        type: 'DEVTOOLS_SHORTCUT_ATTEMPT',
        details: 'Percobaan membuka Developer Tools via Ctrl+Shift+I/J/C diblokir'
      });
      return false;
    }

    // Ctrl+U (View Source)
    if (ctrl && (key === 'U' || key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      dispatchViolation({
        type: 'VIEW_SOURCE_SHORTCUT_ATTEMPT',
        details: 'Percobaan melihat kode sumber via Ctrl+U diblokir'
      });
      return false;
    }

    // Ctrl+C / Ctrl+V / Ctrl+X (Clipboard misuse during exam)
    if (ctrl && (key === 'C' || key === 'c' || key === 'X' || key === 'x' || key === 'V' || key === 'v')) {
      e.preventDefault();
      e.stopPropagation();
      dispatchViolation({
        type: 'CLIPBOARD_HOTKEY_BLOCKED',
        details: `Pintasan clipboard Ctrl+${key.toUpperCase()} dimatikan selama Ujian Serentak`
      });
      return false;
    }

    lastKeydownTime = _realPerformanceNow();
  }

  function handleKeyup() {
    if (!isGuardRunning || lastKeydownTime === 0) return;
    const flight = _realPerformanceNow() - lastKeydownTime;
    keyFlightTimes.push(flight);
    if (keyFlightTimes.length > 25) keyFlightTimes.shift();
  }

  // --- 7. CONTENT & CLIPBOARD DEFENSE & HONEYTOKEN TRAP ---
  function setupContentProtection() {
    // 7a. Honeytoken Trap Node
    if (!honeytokenElement) {
      honeytokenElement = document.createElement('div');
      honeytokenElement.id = 'exam-secret-honeytoken-trap';
      honeytokenElement.setAttribute('aria-hidden', 'true');
      honeytokenElement.style.position = 'fixed';
      honeytokenElement.style.left = '-9999px';
      honeytokenElement.style.top = '-9999px';
      honeytokenElement.style.opacity = '0.001';
      honeytokenElement.innerText = 'HONEYTOKEN_SECRET_EXAM_INTEGRITY_TOKEN_#9021';
      document.body.appendChild(honeytokenElement);
    }

    // 7b. Blokir & Deteksi Scraping Clipboard
    _realDocAddEventListener('copy', (e) => {
      if (!isGuardRunning) return;
      const selection = window.getSelection() ? window.getSelection().toString() : '';
      if (selection.includes('HONEYTOKEN_SECRET_EXAM')) {
        dispatchViolation({
          type: 'HONEYTOKEN_DOM_SCRAPED',
          details: 'Deteksi ekstraksi otomatis teks soal via skrip DOM scraper / crawler'
        });
      } else {
        dispatchViolation({
          type: 'UNAUTHORIZED_COPY_ATTEMPT',
          details: 'Percobaan menyalin teks selama Mode Ujian Serentak diblokir'
        });
      }
      e.preventDefault();
    }, true);

    _realDocAddEventListener('paste', (e) => {
      if (!isGuardRunning) return;
      e.preventDefault();
      dispatchViolation({
        type: 'UNAUTHORIZED_PASTE_ATTEMPT',
        details: 'Percobaan menempelkan teks jawaban eksternal diblokir'
      });
    }, true);

    // 7c. Blokir Klik Kanan
    _realDocAddEventListener('contextmenu', (e) => {
      if (!isGuardRunning) return;
      e.preventDefault();
      dispatchViolation({
        type: 'CONTEXT_MENU_BLOCKED',
        details: 'Menu klik kanan diblokir selama Mode Ujian Serentak'
      });
    }, true);
  }

  // --- 8. DYNAMIC CANVAS WATERMARK & SECURITY HUD ---
  function setupWatermarkAndHud() {
    // 8a. Canvas Watermark (Cegah foto HP / screen capture tanpa jejak)
    if (!watermarkCanvas) {
      watermarkCanvas = document.createElement('canvas');
      watermarkCanvas.id = 'examWatermarkCanvas';
      watermarkCanvas.style.position = 'fixed';
      watermarkCanvas.style.top = '0';
      watermarkCanvas.style.left = '0';
      watermarkCanvas.style.width = '100vw';
      watermarkCanvas.style.height = '100vh';
      watermarkCanvas.style.pointerEvents = 'none';
      watermarkCanvas.style.zIndex = '999998';
      watermarkCanvas.style.opacity = '0.45';
      document.body.appendChild(watermarkCanvas);
    }

    renderWatermark();

    // 8b. Security HUD Banner
    if (!hudContainer) {
      hudContainer = document.createElement('div');
      hudContainer.id = 'examSecurityHud';
      hudContainer.style.position = 'fixed';
      hudContainer.style.top = '12px';
      hudContainer.style.right = '16px';
      hudContainer.style.zIndex = '999999';
      hudContainer.style.background = 'rgba(15, 23, 42, 0.88)';
      hudContainer.style.backdropFilter = 'blur(10px)';
      hudContainer.style.border = '1px solid rgba(99, 102, 241, 0.4)';
      hudContainer.style.borderRadius = '12px';
      hudContainer.style.padding = '8px 16px';
      hudContainer.style.color = '#ffffff';
      hudContainer.style.fontSize = '0.78rem';
      hudContainer.style.fontWeight = '600';
      hudContainer.style.display = 'flex';
      hudContainer.style.alignItems = 'center';
      hudContainer.style.gap = '10px';
      hudContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      hudContainer.style.transition = 'all 0.3s ease';

      hudContainer.innerHTML = `
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981;" id="examHudDot"></span>
        <span id="examHudText">🛡️ MODE UJIAN SERENTAK AKTIF</span>
        <span style="font-size:0.7rem; opacity:0.65; border-left:1px solid rgba(255,255,255,0.2); padding-left:8px;" id="examHudSession">INTEGRITY: OK</span>
      `;

      document.body.appendChild(hudContainer);
    }
  }

  function renderWatermark() {
    if (!watermarkCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    watermarkCanvas.width = w * dpr;
    watermarkCanvas.height = h * dpr;

    const ctx = watermarkCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const identity = getUserIdentity();
    const markText = `${identity.displayName} (${identity.email}) • EXAM SESSION • ${new Date().toLocaleTimeString('id-ID')}`;

    ctx.font = '13px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.textAlign = 'center';

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-22 * Math.PI / 180);
    ctx.translate(-w / 2, -h / 2);

    const stepX = 320;
    const stepY = 160;

    for (let x = -w; x < w * 2; x += stepX) {
      for (let y = -h; y < h * 2; y += stepY) {
        ctx.fillText(markText, x, y);
      }
    }
    ctx.restore();
  }

  function updateHudStatus(statusText) {
    const textEl = document.getElementById('examHudSession');
    const dotEl = document.getElementById('examHudDot');
    if (textEl) textEl.innerText = statusText;
    if (dotEl) {
      dotEl.style.background = '#ef4444';
      dotEl.style.boxShadow = '0 0 12px #ef4444';
    }
  }

  // --- 9. PUBLIC API CONTROLLER ---
  const ExamSecurityGuard = {
    /**
     * Memulai guard saat Mode Ujian Serentak Aktif
     */
    startExamGuard: function (options) {
      if (isGuardRunning) return;
      isGuardRunning = true;
      violationCount = 0;
      lastHeartbeatPerf = _realPerformanceNow();
      lastHeartbeatEpoch = _realDateNow();

      console.log('%c[ExamSecurityGuard] Sistem Anti-Tamper & Integritas Ujian Serentak DIAKTIFKAN', 'background:#4f46e5; color:#fff; padding:4px 8px; border-radius:4px; font-weight:bold;');

      // Pasang listener interaksi
      _realDocAddEventListener('mousemove', handleMouseMove, { passive: true });
      _realDocAddEventListener('keydown', handleKeydown, true);
      _realDocAddEventListener('keyup', handleKeyup, { passive: true });
      window.addEventListener('resize', renderWatermark);

      setupContentProtection();
      setupWatermarkAndHud();

      // Jalankan audit pertama kali
      const initialIssues = inspectJavaScriptIntegrity();
      if (initialIssues.length > 0) {
        initialIssues.forEach(dispatchViolation);
      }

      // Jadwalkan Heartbeat loop (1000ms)
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(executeHeartbeatTick, 1000);

      // Jadwalkan audit berkala acak (setiap 4-8 detik)
      if (integrityAuditTimer) clearInterval(integrityAuditTimer);
      integrityAuditTimer = setInterval(() => {
        const issues = inspectJavaScriptIntegrity();
        if (issues.length > 0) {
          issues.forEach(dispatchViolation);
        }
      }, 5000);

      // Update identitas jika diberikan
      if (options && options.currentUser) {
        renderWatermark();
      }
    },

    /**
     * Menonaktifkan guard saat Mode Ujian Serentak Berakhir
     */
    stopExamGuard: function () {
      if (!isGuardRunning) return;
      isGuardRunning = false;

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (integrityAuditTimer) {
        clearInterval(integrityAuditTimer);
        integrityAuditTimer = null;
      }

      if (hudContainer && hudContainer.parentNode) {
        hudContainer.parentNode.removeChild(hudContainer);
        hudContainer = null;
      }
      if (watermarkCanvas && watermarkCanvas.parentNode) {
        watermarkCanvas.parentNode.removeChild(watermarkCanvas);
        watermarkCanvas = null;
      }
      if (honeytokenElement && honeytokenElement.parentNode) {
        honeytokenElement.parentNode.removeChild(honeytokenElement);
        honeytokenElement = null;
      }

      console.log('[ExamSecurityGuard] Sistem Anti-Tamper Ujian dinonaktifkan.');
    },

    isGuardActive: function () {
      return isGuardRunning;
    },

    checkIntegrityNow: function () {
      return inspectJavaScriptIntegrity();
    },

    getMetrics: function () {
      return {
        isRunning: isGuardRunning,
        violationCount,
        mouseVelocitySamples: mouseVelocities.length,
        keyFlightSamples: keyFlightTimes.length,
        lastHeartbeatPerf
      };
    }
  };

  // Export ke window
  window.__ExamSecurityGuard = ExamSecurityGuard;

})();
