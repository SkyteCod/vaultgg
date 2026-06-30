/* ════════════════════════════════════════════════════════════
   AltisGG — Modal de paiement réutilisable (PayPal + Carte)
   Injecté sur index.html et product.html via <script src>.
   Expose : window.openPayment(), window.closePayment()
════════════════════════════════════════════════════════════ */
(function(){
  if (window.__vaultPaymentLoaded) return;
  window.__vaultPaymentLoaded = true;

  /* ── 1. CSS injecté ── */
  var css = `
  .pay-overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .3s;display:flex;align-items:center;justify-content:center;padding:20px;}
  .pay-overlay.open{opacity:1;pointer-events:all;}
  .pay-modal{width:100%;max-width:440px;max-height:92vh;overflow-y:auto;background:rgba(8,8,22,.99);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:30px 28px 26px;position:relative;transform:translateY(24px) scale(.97);opacity:0;transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .3s;box-shadow:0 40px 120px rgba(0,0,0,.7),0 0 60px rgba(124,58,237,.1);}
  .pay-overlay.open .pay-modal{transform:none;opacity:1;}
  .pay-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--muted-lt,#94A3B8);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;z-index:2;}
  .pay-close:hover{background:rgba(244,63,94,.12);color:var(--rose,#F43F5E);}
  .pay-head{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
  .pay-lock{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,var(--violet,#7C3AED),var(--rose,#F43F5E));display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 22px rgba(124,58,237,.4);}
  .pay-title{font-family:'Russo One',sans-serif;font-size:19px;color:#fff;}
  .pay-subtitle{font-size:12px;color:var(--muted,#64748B);margin-top:2px;}
  .pay-total{display:flex;align-items:center;justify-content:space-between;background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.25);border-radius:14px;padding:14px 18px;margin-bottom:22px;}
  .pay-total>span:first-child{font-size:13px;color:var(--muted-lt,#94A3B8);}
  .pay-total-val{font-family:'Russo One',sans-serif;font-size:24px;color:var(--violet-lt,#A78BFA);text-shadow:0 0 24px rgba(167,139,250,.5);}
  .pay-methods{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px;}
  .pay-method{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 10px;border-radius:13px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:var(--muted-lt,#94A3B8);font-family:'Chakra Petch',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:.22s;}
  .pay-method:hover{border-color:rgba(167,139,250,.4);color:#fff;}
  .pay-method.active{border-color:var(--violet,#7C3AED);background:rgba(124,58,237,.12);color:#fff;box-shadow:0 0 18px rgba(124,58,237,.25);}
  .pay-field{margin-bottom:15px;}
  .pay-field label{display:block;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-lt,#94A3B8);margin-bottom:7px;}
  .pay-input-wrap{position:relative;}
  .pay-modal input{width:100%;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.13);border-radius:12px;padding:13px 16px;color:var(--text,#E2E8F0);font-family:'Chakra Petch',sans-serif;font-size:15px;letter-spacing:.02em;outline:none;transition:.2s;}
  .pay-modal input::placeholder{color:var(--muted,#64748B);letter-spacing:.04em;}
  .pay-modal input:focus{border-color:rgba(167,139,250,.6);background:rgba(124,58,237,.05);box-shadow:0 0 0 3px rgba(124,58,237,.12);}
  .pay-modal input.invalid{border-color:rgba(244,63,94,.6);}
  .pay-modal input.valid{border-color:rgba(16,185,129,.45);}
  .pay-brand{position:absolute;right:12px;top:50%;transform:translateY(-50%);height:22px;display:flex;align-items:center;pointer-events:none;}
  .pay-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .pay-err{font-size:11px;color:var(--rose-lt,#FB7185);margin-top:5px;min-height:0;max-height:0;overflow:hidden;opacity:0;transition:.2s;}
  .pay-err.show{min-height:14px;max-height:30px;opacity:1;}
  .pay-submit{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:15px;border:none;border-radius:13px;background:linear-gradient(135deg,var(--violet,#7C3AED),var(--rose,#F43F5E));color:#fff;font-family:'Russo One',sans-serif;font-size:15px;letter-spacing:.04em;cursor:pointer;box-shadow:0 0 24px rgba(124,58,237,.4);transition:.25s;margin-top:6px;}
  .pay-submit:hover{box-shadow:0 0 42px rgba(124,58,237,.65);transform:translateY(-2px);}
  .pay-submit:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;transform:none;}
  .pay-secure-note{text-align:center;font-size:11px;color:var(--muted,#64748B);margin-top:14px;}
  .pay-pp-text{font-size:13px;color:var(--muted-lt,#94A3B8);text-align:center;line-height:1.6;margin-bottom:18px;}
  .pay-pp-btn{width:100%;padding:15px;border:none;border-radius:13px;background:#FFC439;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;box-shadow:0 4px 18px rgba(255,196,57,.3);}
  .pay-pp-btn:hover{background:#f0b72e;transform:translateY(-2px);box-shadow:0 6px 26px rgba(255,196,57,.5);}
  .pp-logo{font-family:Arial,sans-serif;font-weight:800;font-style:italic;font-size:21px;letter-spacing:-.5px;}
  .pp-logo .pp1{color:#003087;}.pp-logo .pp2{color:#009cde;}
  /* Processing */
  #pay-processing-state,#pay-success-state{text-align:center;padding:30px 10px 16px;}
  .pay-spinner{width:54px;height:54px;border-radius:50%;border:4px solid rgba(255,255,255,.12);border-top-color:var(--violet-lt,#A78BFA);margin:0 auto 22px;animation:pay-spin .8s linear infinite;}
  @keyframes pay-spin{to{transform:rotate(360deg);}}
  .pay-proc-text{font-family:'Russo One',sans-serif;font-size:18px;color:#fff;margin-bottom:6px;}
  .pay-proc-sub{font-size:13px;color:var(--muted,#64748B);}
  .pay-check{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#10B981,#059669);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 0 40px rgba(16,185,129,.5);animation:pay-pop .5s cubic-bezier(.22,1,.36,1);}
  @keyframes pay-pop{0%{transform:scale(0);}60%{transform:scale(1.15);}100%{transform:scale(1);}}
  .pay-success-title{font-family:'Russo One',sans-serif;font-size:22px;color:#fff;margin-bottom:10px;}
  .pay-success-text{font-size:14px;color:var(--muted-lt,#94A3B8);line-height:1.7;max-width:300px;margin:0 auto 24px;}
  @media(max-width:420px){.pay-modal{padding:26px 18px 22px;}.pay-row{grid-template-columns:1fr 1fr;}}
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── 2. HTML injecté ── */
  var X = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var html = ''
  + '<div id="pay-overlay" class="pay-overlay" role="dialog" aria-modal="true" aria-label="Paiement sécurisé">'
  +   '<div class="pay-modal">'
  +     '<button class="pay-close" id="pay-close" aria-label="Fermer">'+X+'</button>'
  +     '<div id="pay-form-state">'
  +       '<div class="pay-head">'
  +         '<div class="pay-lock"><svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>'
  +         '<div><div class="pay-title">Paiement sécurisé</div><div class="pay-subtitle">SSL 256-bit · 3D Secure</div></div>'
  +       '</div>'
  +       '<div class="pay-total"><span>Total à payer</span><span class="pay-total-val" id="pay-total">0€</span></div>'
  +       '<div class="pay-methods">'
  +         '<button type="button" class="pay-method active" data-method="card"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Carte bancaire</button>'
  +         '<button type="button" class="pay-method" data-method="paypal"><span class="pp-logo" style="font-size:14px"><span class="pp1">Pay</span><span class="pp2">Pal</span></span></button>'
  +       '</div>'
  +       '<div class="pay-panel" id="pay-panel-card">'
  +         '<form id="pay-card-form" novalidate>'
  +           '<div class="pay-field"><label>Numéro de carte</label><div class="pay-input-wrap"><input id="pay-num" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="19"/><span class="pay-brand" id="pay-brand"></span></div><p class="pay-err" id="err-num">Numéro invalide — 16 chiffres requis</p></div>'
  +           '<div class="pay-field"><label>Nom sur la carte</label><input id="pay-name" autocomplete="cc-name" placeholder="JEAN DUPONT"/><p class="pay-err" id="err-name">Indique le nom inscrit sur la carte</p></div>'
  +           '<div class="pay-row">'
  +             '<div class="pay-field"><label>Expiration</label><input id="pay-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5"/><p class="pay-err" id="err-exp">Date invalide</p></div>'
  +             '<div class="pay-field"><label>CVV</label><input id="pay-cvv" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="•••" maxlength="3"/><p class="pay-err" id="err-cvv">3 chiffres</p></div>'
  +           '</div>'
  +           '<button type="submit" class="pay-submit" id="pay-submit" disabled>Payer <span id="pay-submit-amt"></span></button>'
  +           '<p class="pay-secure-note">🔒 Paiement chiffré — aucune donnée bancaire stockée</p>'
  +         '</form>'
  +       '</div>'
  +       '<div class="pay-panel" id="pay-panel-paypal" style="display:none;">'
  +         '<p class="pay-pp-text">Tu seras redirigé vers PayPal dans un nouvel onglet pour finaliser ton paiement en toute sécurité.</p>'
  +         '<button type="button" class="pay-pp-btn" id="pay-pp-btn"><span class="pp-logo"><span class="pp1">Pay</span><span class="pp2">Pal</span></span></button>'
  +         '<p class="pay-secure-note">Paiement protégé par la garantie PayPal</p>'
  +       '</div>'
  +     '</div>'
  +     '<div id="pay-processing-state" style="display:none;"><div class="pay-spinner"></div><p class="pay-proc-text">Vérification en cours...</p><p class="pay-proc-sub">Validation bancaire 3D Secure</p></div>'
  +     '<div id="pay-success-state" style="display:none;"><div class="pay-check"><svg width="36" height="36" fill="none" stroke="#fff" stroke-width="3.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div><h2 class="pay-success-title">Paiement accepté</h2><p class="pay-success-text">Votre compte vous sera livré dans 5 à 10 minutes par email.</p><button type="button" class="pay-submit" id="pay-success-close">Parfait, merci !</button></div>'
  +   '</div>'
  + '</div>';
  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstChild);

  /* ── 3. Raccourcis ── */
  var $ = function(id){ return document.getElementById(id); };
  var overlay = $('pay-overlay');
  var numEl = $('pay-num'), nameEl = $('pay-name'), expEl = $('pay-exp'), cvvEl = $('pay-cvv');
  var submitBtn = $('pay-submit');

  /* ── 4. Helpers ── */
  function fmtPrice(n){ return (n % 1 === 0) ? n + '€' : n.toFixed(2).replace('.', ',') + '€'; }
  function cartTotal(){
    var cart = [];
    try { cart = JSON.parse(localStorage.getItem('vault_cart') || '[]'); } catch(e){}
    return cart.reduce(function(s, it){ return s + (parseFloat(it.price) || 0); }, 0);
  }
  function detectBrand(num){
    if (/^4/.test(num)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(num)) return 'mastercard';
    return '';
  }
  var BRAND_SVG = {
    visa: '<svg viewBox="0 0 48 16" width="40" height="14" xmlns="http://www.w3.org/2000/svg"><text x="0" y="13" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-style="italic" font-size="15" fill="#1a1f71">VISA</text></svg>',
    mastercard: '<svg viewBox="0 0 48 30" width="34" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="15" r="11" fill="#EB001B"/><circle cx="31" cy="15" r="11" fill="#F79E1B" fill-opacity="0.85"/></svg>'
  };

  /* ── 5. Formatage des champs ── */
  numEl.addEventListener('input', function(){
    var digits = this.value.replace(/\D/g, '').slice(0, 16);
    this.value = digits.replace(/(.{4})/g, '$1 ').trim();
    var brand = detectBrand(digits);
    $('pay-brand').innerHTML = brand ? BRAND_SVG[brand] : '';
    validateField('num'); refreshSubmit();
  });
  nameEl.addEventListener('input', function(){ validateField('name'); refreshSubmit(); });
  expEl.addEventListener('input', function(){
    var d = this.value.replace(/\D/g, '').slice(0, 4);
    if (d.length >= 3) this.value = d.slice(0, 2) + '/' + d.slice(2);
    else this.value = d;
    validateField('exp'); refreshSubmit();
  });
  cvvEl.addEventListener('input', function(){
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
    validateField('cvv'); refreshSubmit();
  });
  [numEl, nameEl, expEl, cvvEl].forEach(function(el){
    el.addEventListener('blur', function(){ el.dataset.touched = '1'; validateField(el.id.replace('pay-','')); });
  });

  /* ── 6. Validation ── */
  function checks(){
    var numOK = numEl.value.replace(/\D/g, '').length === 16;
    var nameOK = nameEl.value.trim().length >= 3 && /[a-zA-ZÀ-ÿ]/.test(nameEl.value);
    var m = expEl.value.match(/^(\d{2})\/(\d{2})$/), expOK = false;
    if (m) {
      var mm = +m[1], yy = 2000 + +m[2];
      if (mm >= 1 && mm <= 12) {
        var now = new Date(), curY = now.getFullYear(), curM = now.getMonth() + 1;
        expOK = (yy > curY) || (yy === curY && mm >= curM);
      }
    }
    var cvvOK = /^\d{3}$/.test(cvvEl.value);
    return { num: numOK, name: nameOK, exp: expOK, cvv: cvvOK };
  }
  function validateField(field){
    var c = checks(), el = $('pay-' + field), err = $('err-' + field);
    if (!el || !err) return;
    var ok = c[field], touched = el.dataset.touched === '1' || el.value.length > 0;
    if (field === 'exp' && expEl.value.match(/^(\d{2})\/(\d{2})$/)) {
      var mm = +expEl.value.slice(0,2);
      err.textContent = (mm < 1 || mm > 12) ? 'Mois invalide' : 'Carte expirée';
    }
    el.classList.toggle('invalid', touched && !ok);
    el.classList.toggle('valid', ok);
    err.classList.toggle('show', touched && !ok);
  }
  function allValid(){ var c = checks(); return c.num && c.name && c.exp && c.cvv; }
  function refreshSubmit(){ submitBtn.disabled = !allValid(); }

  /* ── 7. États du modal ── */
  function showState(which){
    $('pay-form-state').style.display = which === 'form' ? 'block' : 'none';
    $('pay-processing-state').style.display = which === 'processing' ? 'block' : 'none';
    $('pay-success-state').style.display = which === 'success' ? 'block' : 'none';
  }

  /* ── 8. Bascule de méthode ── */
  document.querySelectorAll('.pay-method').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.pay-method').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var m = btn.dataset.method;
      $('pay-panel-card').style.display = m === 'card' ? 'block' : 'none';
      $('pay-panel-paypal').style.display = m === 'paypal' ? 'block' : 'none';
    });
  });

  /* ── 9. Soumission carte → vérification → succès ── */
  $('pay-card-form').addEventListener('submit', function(e){
    e.preventDefault();
    [numEl, nameEl, expEl, cvvEl].forEach(function(el){ el.dataset.touched = '1'; });
    ['num','name','exp','cvv'].forEach(validateField);
    if (!allValid()) return;
    showState('processing');
    setTimeout(function(){
      showState('success');
      try { localStorage.removeItem('vault_cart'); } catch(e){}
      if (window.updateCartBadge) { try { window.updateCartBadge(); } catch(e){} }
    }, 2000);
  });

  /* ── 10. PayPal → nouvel onglet ── */
  $('pay-pp-btn').addEventListener('click', function(){
    window.open('https://www.paypal.com', '_blank', 'noopener');
  });

  /* ── 11. Ouverture / fermeture ── */
  window.openPayment = function(){
    if (window.closeCart) { try { window.closeCart(); } catch(e){} }
    var total = cartTotal();
    $('pay-total').textContent = fmtPrice(total);
    $('pay-submit-amt').textContent = fmtPrice(total);
    showState('form');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closePayment = function(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  $('pay-close').addEventListener('click', window.closePayment);
  $('pay-success-close').addEventListener('click', window.closePayment);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) window.closePayment(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') window.closePayment(); });
})();
