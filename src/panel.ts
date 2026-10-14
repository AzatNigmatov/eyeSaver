import type { CharSetId, ColorId, Settings, TrajectoryId } from './types';
import { TRAJECTORY_IDS, TRAJECTORY_LABELS } from './types';

const CHAR_SET_OPTIONS: { id: CharSetId; label: string }[] = [
  { id: 'binary', label: 'Binary' },
  { id: 'ascii', label: 'ASCII' },
  { id: 'matrix', label: 'Matrix' },
];

const COLOR_OPTIONS: { id: ColorId; label: string }[] = [
  { id: 'green', label: 'Green' },
  { id: 'white', label: 'White' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'multi', label: 'Multi' },
];

export interface Panel {
  setVisible(v: boolean): void;
  isVisible(): boolean;
  sync(s: Settings): void;
}

export function createPanel(
  root: HTMLElement,
  initial: Settings,
  onChange: (s: Settings) => void,
): Panel {
  const settings: Settings = { ...initial };
  const itemEls = new Map<string, HTMLButtonElement>();

  const panel = document.createElement('div');
  panel.className = 'panel';

  const title = document.createElement('div');
  title.className = 'panel-title';
  title.textContent = 'EYE SAVER';
  panel.appendChild(title);

  function update(patch: Partial<Settings>): void {
    Object.assign(settings, patch);
    onChange({ ...settings });
  }

  function makeList(
    items: { id: string; label: string }[],
    current: string,
    onPick: (id: string) => void,
  ): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'panel-list';
    for (const it of items) {
      const btn = document.createElement('button');
      btn.className = 'panel-item' + (it.id === current ? ' active' : '');
      btn.dataset.value = it.id;
      btn.textContent = it.label;
      btn.addEventListener('click', () => {
        onPick(it.id);
        wrap.querySelectorAll('.panel-item').forEach((el) => el.classList.remove('active'));
        btn.classList.add('active');
      });
      itemEls.set(it.id, btn);
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function section(label: string, content: HTMLElement): HTMLElement {
    const sec = document.createElement('div');
    sec.className = 'panel-section';
    const l = document.createElement('div');
    l.className = 'panel-label';
    l.textContent = label;
    sec.append(l, content);
    return sec;
  }

  function row(label: string, input: HTMLElement): HTMLElement {
    const r = document.createElement('div');
    r.className = 'panel-row';
    const l = document.createElement('span');
    l.className = 'panel-row-label';
    l.textContent = label;
    r.append(l, input);
    return r;
  }

  function makeSelect(
    options: { id: string; label: string }[],
    current: string,
    onPick: (id: string) => void,
  ): HTMLSelectElement {
    const sel = document.createElement('select');
    sel.className = 'panel-select';
    for (const o of options) {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.label;
      if (o.id === current) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => onPick(sel.value));
    return sel;
  }

  function makeNumber(value: number, onInput: (v: number) => void): HTMLInputElement {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'panel-number';
    inp.min = '0';
    inp.max = '1000';
    inp.value = String(value);
    inp.title = '0 = auto';
    inp.addEventListener('change', () => onInput(Number(inp.value)));
    return inp;
  }

  function makeRange(min: number, max: number, value: number, onInput: (v: number) => void): HTMLInputElement {
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.className = 'panel-range';
    inp.min = String(min);
    inp.max = String(max);
    inp.value = String(value);
    inp.addEventListener('input', () => onInput(Number(inp.value)));
    return inp;
  }

  panel.appendChild(
    section(
      'MODE',
      makeList(
        TRAJECTORY_IDS.map((id) => ({ id, label: TRAJECTORY_LABELS[id] })),
        initial.trajectory,
        (id) => update({ trajectory: id as TrajectoryId }),
      ),
    ),
  );

  panel.appendChild(
    section(
      'STYLE',
      makeList(CHAR_SET_OPTIONS, initial.charSet, (id) => update({ charSet: id as CharSetId })),
    ),
  );

  const adv = document.createElement('div');
  adv.className = 'panel-section';
  const advLabel = document.createElement('div');
  advLabel.className = 'panel-label';
  advLabel.textContent = 'ADVANCED';
  adv.appendChild(advLabel);
  adv.appendChild(row('COLOR', makeSelect(COLOR_OPTIONS, initial.color, (id) => update({ color: id as ColorId }))));
  adv.appendChild(row('SIZE', makeNumber(initial.ballSize ?? 0, (v) => update({ ballSize: v > 0 ? v : null }))));
  adv.appendChild(row('SPEED', makeRange(5, 120, initial.speed, (v) => update({ speed: v }))));
  adv.appendChild(row('TRAIL', makeRange(50, 300, initial.trailLength, (v) => update({ trailLength: v }))));
  panel.appendChild(adv);

  root.appendChild(panel);

  return {
    setVisible(v: boolean) {
      panel.classList.toggle('visible', v);
    },
    isVisible() {
      return panel.classList.contains('visible');
    },
    sync(s: Settings) {
      for (const [id, el] of itemEls) {
        el.classList.toggle('active', id === s.trajectory || id === s.charSet);
      }
    },
  };
}
