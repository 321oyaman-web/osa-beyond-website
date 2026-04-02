/* ========================================
   osA Beyond Inc. - 共通JavaScript
======================================== */

/* ハンバーガーメニューの開閉 */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  /* モバイルナビのリンクをクリックしたら閉じる */
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

/* FAQアコーディオン */
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    /* 他のFAQを閉じる */
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    /* クリックしたものを開閉 */
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

/* スクロールでヘッダーに影を追加 */
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
    } else {
      header.style.boxShadow = '';
    }
  }
});
