// public/js/writing-feedback.js
// Không phụ thuộc framework — dùng được với HTML thuần, React, Vue, Astro...
//
//   import { gradeWriting, renderResult } from '/js/writing-feedback.js';
//   const data = await gradeWriting({ taskType: 'task2', prompt, essay });
//   renderResult(document.getElementById('result'), data);

const CRITERIA = [
  { key: 'task_response', label: (t) => (t === 'task1' ? 'Task Achievement' : 'Task Response') },
  { key: 'coherence_cohesion', label: () => 'Coherence & Cohesion' },
  { key: 'lexical_resource', label: () => 'Lexical Resource' },
  { key: 'grammatical_range_accuracy', label: () => 'Grammatical Range & Accuracy' },
];

export async function gradeWriting({ taskType, prompt, essay }, endpoint = '/api/grade-writing') {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_type: taskType, prompt, essay }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Lỗi máy chủ (${res.status})`);
  return data;
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmt = (n) => Number(n).toFixed(1);

function bandWord(b) {
  if (b >= 8) return 'Rất tốt';
  if (b >= 7) return 'Tốt';
  if (b >= 6) return 'Khá';
  if (b >= 5) return 'Trung bình';
  if (b >= 4) return 'Hạn chế';
  return 'Còn yếu';
}

export function renderLoading(container) {
  container.innerHTML = `
    <div class="wf wf-loading" role="status" aria-live="polite">
      <div class="wf-spinner" aria-hidden="true"></div>
      <p>Đang chấm bài. Việc này mất khoảng 20–60 giây.</p>
    </div>`;
}

export function renderError(container, message) {
  container.innerHTML = `
    <div class="wf wf-error" role="alert">
      <strong>Không chấm được bài.</strong>
      <p>${esc(message)}</p>
    </div>`;
}

export function renderResult(container, data) {
  const taskType = data.meta?.task_type || 'task2';
  const overall = data.overall_band;

  const ticks = Array.from({ length: 10 }, (_, i) => `<span style="left:${(i / 9) * 100}%"><i>${i}</i></span>`).join('');

  const criteria = CRITERIA.map((c) => {
    const score = data.criteria_scores[c.key];
    return `
      <article class="wf-crit">
        <header>
          <h3>${esc(c.label(taskType))}</h3>
          <span class="wf-crit-band">${fmt(score)}</span>
        </header>
        <div class="wf-bar" role="img" aria-label="${fmt(score)} trên 9"><b style="width:${(score / 9) * 100}%"></b></div>
        <p>${esc(data.detailed_feedback[c.key])}</p>
      </article>`;
  }).join('');

  const labelOf = (key) => CRITERIA.find((c) => c.key === key)?.label(taskType);
  const errors = data.error_corrections.length
    ? data.error_corrections
        .map(
          (e) => `
      <li class="wf-err">
        <div class="wf-err-col wf-orig"><span class="wf-tag">Lỗi gốc</span><del>${esc(e.original)}</del></div>
        <div class="wf-err-col wf-fix"><span class="wf-tag">Gợi ý sửa</span><ins>${esc(e.corrected)}</ins></div>
        <div class="wf-err-col wf-why"><span class="wf-tag">Giải thích${e.criterion ? ` · ${esc(labelOf(e.criterion))}` : ''}</span><p>${esc(e.explanation)}</p></div>
      </li>`
        )
        .join('')
    : '<li class="wf-empty">Không phát hiện lỗi đáng kể.</li>';

  const enhanced = esc(data.enhanced_version)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  container.innerHTML = `
    <div class="wf">
      <section class="wf-hero" aria-label="Band tổng">
        <div class="wf-score">
          <span class="wf-num">${fmt(overall)}</span>
          <span class="wf-cap">Band tổng<br>${bandWord(overall)}${data.meta ? ` · ${data.meta.word_count} từ` : ''}</span>
        </div>
        <div class="wf-ruler" aria-hidden="true">
          <div class="wf-line"></div>
          <div class="wf-ticks">${ticks}</div>
          <div class="wf-pin" style="left:${(overall / 9) * 100}%"></div>
        </div>
      </section>

      <section class="wf-section">
        <h2>Điểm theo tiêu chí</h2>
        <div class="wf-crit-grid">${criteria}</div>
      </section>

      <section class="wf-section">
        <h2>Sửa lỗi chi tiết <small>${data.error_corrections.length} mục</small></h2>
        <ol class="wf-errors">${errors}</ol>
      </section>

      <section class="wf-section">
        <div class="wf-section-head">
          <h2>Bài mẫu nâng cấp (Band 8.0+)</h2>
          <button type="button" class="wf-copy">Sao chép bài mẫu</button>
        </div>
        <div class="wf-essay">${enhanced}</div>
      </section>
    </div>`;

  const btn = container.querySelector('.wf-copy');
  btn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.enhanced_version);
      btn.textContent = 'Đã sao chép';
    } catch {
      btn.textContent = 'Không sao chép được';
    }
    setTimeout(() => (btn.textContent = 'Sao chép bài mẫu'), 1800);
  });
}
