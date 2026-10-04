(() => {
  const departure = Date.parse('2026-07-20T06:40:00+08:00');
  const tripEnd = Date.parse('2026-07-30T00:00:00+09:00');
  const japanDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const days = [...document.querySelectorAll('.day-card[data-date]')];
  const select = document.getElementById('day-select');
  const status = document.querySelector('.trip-status');
  const titles = [
    '抵達大阪 + USJ Day 1', 'USJ Day 2', '難波八阪神社 + 道頓堀',
    '海遊館 + 道頓堀燒肉', '唐吉訶德 + KidZania', '移動京都 + 祇園',
    '武士忍者體驗 + 伏見稻荷', '嵐山 + 金閣寺', '清水寺 + 京都站購物', '返回台灣'
  ];

  if (select) {
    days.forEach((day, index) => {
      select.add(new Option(`7/${20 + index} · ${titles[index]}`, day.id));
      const badge = document.createElement('span');
      badge.className = 'today-label';
      badge.textContent = '今天';
      badge.hidden = true;
      day.querySelector('.day-aside').append(badge);
    });
    select.addEventListener('change', () => {
      if (select.value) window.location.hash = select.value;
    });
    const syncSelection = () => {
      const id = window.location.hash.slice(1);
      select.value = days.some(day => day.id === id) ? id : '';
    };
    window.addEventListener('hashchange', syncSelection);
    syncSelection();
  }

  function updateTrip(now = new Date()) {
    const time = now.getTime();
    const phase = time < departure ? 'before' : time < tripEnd ? 'during' : 'after';
    // Use the destination's calendar date regardless of the viewer's time zone.
    const parts = Object.fromEntries(japanDate.formatToParts(now).map(p => [p.type, p.value]));
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    const dayIndex = Number(parts.day) - 20;
    const today = days.find(day => day.dataset.date === date);
    document.body.dataset.tripPhase = phase;
    if (status) {
      status.querySelector('[data-status-label]').textContent = {
        before: '出發倒數', during: `旅程第 ${dayIndex + 1} 天 · 日本時間`, after: '旅程回顧'
      }[phase];
      status.querySelector('[data-status-title]').textContent = {
        before: '準備出發，關西見！', during: titles[dayIndex], after: '2026 關西親子遊'
      }[phase];
      status.querySelector('[data-status-note]').textContent = {
        before: '2026/7/20 06:40（台灣時間）出發 · 10 天 9 夜',
        during: dayIndex < 9 ? `明日安排：${titles[dayIndex + 1]}` : '今天是回程日，航班與交通資訊在詳細頁。',
        after: '2026/7/20–7/29 · 已平安返台。實際行程、旅後統計與支出紀錄都保留在下方。'
      }[phase];
      const action = status.querySelector('[data-status-action]');
      action.textContent = { before: '查看行前提醒', during: '查看今日行程', after: '回顧每日行程' }[phase];
      const onHome = days.length > 0;
      action.href = phase === 'during' ? `${onHome ? '' : './'}#day-${date}` :
        phase === 'before' ? (onHome ? '#reminders' : './#reminders') : (onHome ? '#osaka' : './#osaka');
      const countdown = status.querySelector('.trip-countdown');
      countdown.hidden = phase !== 'before';
      const minutes = Math.max(0, Math.ceil((departure - time) / 60000));
      status.querySelector('[data-cd-days]').textContent = Math.floor(minutes / 1440);
      status.querySelector('[data-cd-hours]').textContent = Math.floor(minutes % 1440 / 60);
      status.querySelector('[data-cd-minutes]').textContent = minutes % 60;
    }
    days.forEach(day => {
      const active = phase === 'during' && day === today;
      day.classList.toggle('is-today', active);
      day.querySelector('.today-label').hidden = !active;
    });
    const todayLink = document.getElementById('today-link');
    if (todayLink) {
      todayLink.hidden = phase !== 'during';
      if (today) todayLink.href = `#${today.id}`;
    }
    document.querySelectorAll('[data-archive-note]').forEach(el => { el.hidden = phase !== 'after'; });
    document.querySelectorAll('[data-phase-heading]').forEach(el => {
      el.textContent = phase === 'after' ? el.dataset.archiveHeading : el.dataset.phaseHeading;
    });
  }

  const nav = document.querySelector('.nav-tabs, .sticky-nav');
  const quickNav = document.querySelector('.day-jump');
  if (quickNav) quickNav.hidden = false;
  function measureNav() {
    const height = nav ? nav.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--nav-height', `${height}px`);
    document.documentElement.style.setProperty('--sticky-height', `${height + (quickNav?.getBoundingClientRect().height || 0)}px`);
  }
  measureNav();
  if (nav && 'ResizeObserver' in window) new ResizeObserver(measureNav).observe(nav);
  window.addEventListener('resize', measureNav);
  updateTrip();
  setInterval(updateTrip, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateTrip(); });
})();
