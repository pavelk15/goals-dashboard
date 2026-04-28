import { useState, useEffect, useRef } from 'react';

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600&display=swap');
.f-serif { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; font-variation-settings: "SOFT" 50, "WONK" 0; }
.f-sans { font-family: 'Public Sans', -apple-system, sans-serif; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.hover-lift { transition: all 0.15s ease; }
.hover-lift:hover { transform: translateY(-1px); }
input, textarea, select, button { font-family: inherit; }
input:focus, textarea:focus, select:focus { outline: 2px solid #1C1917; outline-offset: -1px; }
.scroll-thin::-webkit-scrollbar { width: 6px; }
.scroll-thin::-webkit-scrollbar-thumb { background: #d4d0c5; border-radius: 3px; }
`;

const PALETTE = {
  bg: '#F4F1EA',
  surface: '#FBF9F4',
  ink: '#1C1917',
  inkSoft: '#57534E',
  inkMute: '#A8A29E',
  line: '#E7E2D5',
  lineSoft: '#EDE8DC',
  green: '#15803D',
  greenBg: '#DCFCE7',
  amber: '#B45309',
  amberBg: '#FEF3C7',
  red: '#B91C1C',
  redBg: '#FEE2E2',
};

const RISK_LABELS = {
  green: { label: 'в зелёной зоне', color: PALETTE.green, bg: PALETTE.greenBg },
  amber: { label: 'требует уточнений', color: PALETTE.amber, bg: PALETTE.amberBg },
  red: { label: 'красный флаг', color: PALETTE.red, bg: PALETTE.redBg },
};

const STATUS_LABELS = {
  planned: 'план',
  active: 'в работе',
  done: 'готово',
  paused: 'на паузе',
  cancelled: 'отменено',
};

const SPHERES = [
  { id: 'career', name: 'Карьера и финансы', symbol: '01' },
  { id: 'body', name: 'Здоровье и тело', symbol: '02' },
  { id: 'love', name: 'Отношения и семья', symbol: '03' },
  { id: 'travel', name: 'Путешествия', symbol: '04' },
  { id: 'learn', name: 'Саморазвитие', symbol: '05' },
  { id: 'home', name: 'Дом и быт', symbol: '06' },
  { id: 'spirit', name: 'Духовность', symbol: '07' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const buildInitialGoals = () => [
  {
    id: uid(), sphere: 'career', title: 'Создать ООО Таргет',
    deadline: '2026-07', risk: 'amber', status: 'planned',
    notes: 'Без юрлица невозможно платить дивиденды кофаундерам.',
    milestones: [
      { id: uid(), title: 'Согласовать с 4 кофаундерами устав и доли', done: false },
      { id: uid(), title: 'Выбрать юриста / онлайн-сервис', done: false },
      { id: uid(), title: 'Подать документы в ФНС', done: false },
      { id: uid(), title: 'Открыть расчётный счёт', done: false },
      { id: uid(), title: 'Перевести договоры с ИП на ООО', done: false },
    ],
  },
  {
    id: uid(), sphere: 'career', title: '300 учеников к августу 2026',
    deadline: '2026-08', risk: 'amber', status: 'active',
    notes: 'Рост ×5.5 за 4 месяца. Нужен расчёт CAC и канал.',
    milestones: [
      { id: uid(), title: 'Зафиксировать средний CAC сейчас', done: false },
      { id: uid(), title: 'Определить 2 главных канала привлечения', done: false },
      { id: uid(), title: 'Бюджет на маркетинг под 245 новых учеников', done: false },
      { id: uid(), title: 'Нанять/распределить роли в команде', done: false },
    ],
  },
  {
    id: uid(), sphere: 'career', title: '1000 учеников к апрелю 2027',
    deadline: '2027-04', risk: 'red', status: 'planned',
    notes: 'Рост ×18 за год — амбиция уровня венчур. Без проверенной юнит-экономики риск высокий.',
    milestones: [
      { id: uid(), title: 'Подтвердить retention учеников (>3 мес)', done: false },
      { id: uid(), title: 'LTV/CAC > 3 на масштабе', done: false },
      { id: uid(), title: 'Стабильная маржа ≥20%', done: false },
      { id: uid(), title: 'Команда выдерживает x3 нагрузку', done: false },
    ],
  },
  {
    id: uid(), sphere: 'career', title: '1 млн ₽/мес личного дохода',
    deadline: '2027-10', risk: 'red', status: 'planned',
    notes: 'При марже 25% и доле 28.3% выходит ~960 тыс/мес после НДФЛ. Реалистичный сценарий: 600–800 тыс. Цель балансирует на грани.',
    milestones: [
      { id: uid(), title: 'Маржа школы стабилизирована ≥25%', done: false },
      { id: uid(), title: 'ООО регулярно платит дивиденды', done: false },
      { id: uid(), title: 'Выручка ≥ 14 млн ₽/мес', done: false },
    ],
  },
  {
    id: uid(), sphere: 'career', title: 'Официальная роль в ООО Таргет',
    deadline: '2026-09', risk: 'green', status: 'planned',
    notes: 'Ген. директор или CTO/CIO. Формальная позиция, согласованная с 4 кофаундерами.',
    milestones: [
      { id: uid(), title: 'Согласовать роль с партнёрами', done: false },
      { id: uid(), title: 'Прописать зоны ответственности', done: false },
      { id: uid(), title: 'Зафиксировать в уставе ООО', done: false },
    ],
  },
  {
    id: uid(), sphere: 'body', title: 'Набрать 6–10 кг сухой мышечной массы',
    deadline: '2029-04', risk: 'amber', status: 'active',
    notes: 'Старт: 60 кг при 10–12% жира, FFMI 16.7. Цель: ~60 кг сухой → FFMI 18.9. Реально для натурала за 3 года при дисциплине.',
    milestones: [
      { id: uid(), title: 'Программа 4–5 тренировок/нед', done: false },
      { id: uid(), title: 'Профицит 200–300 ккал ежедневно', done: false },
      { id: uid(), title: 'Сон 7–8 часов стабильно', done: false },
      { id: uid(), title: 'Прогресс по весам на ключевых жимах', done: false },
    ],
  },
  {
    id: uid(), sphere: 'body', title: 'Контроль тревожности',
    deadline: '2027-04', risk: 'green', status: 'active',
    notes: 'КПТ + регулярные практики работают. Цель управляемая.',
    milestones: [
      { id: uid(), title: 'Найти терапевта (КПТ)', done: false },
      { id: uid(), title: '10 регулярных сессий', done: false },
      { id: uid(), title: 'Дневник триггеров — 30 дней подряд', done: false },
    ],
  },
  {
    id: uid(), sphere: 'love', title: 'Стать тем, с кем хотят строить отношения',
    deadline: '2027-12', risk: 'green', status: 'active',
    notes: 'Переформулировано: вместо «найти девушку» — действия, которые в зоне твоего контроля.',
    milestones: [
      { id: uid(), title: '2 свидания в месяц минимум', done: false },
      { id: uid(), title: 'Проработка триггеров с терапевтом', done: false },
      { id: uid(), title: 'Расширение круга знакомств (1 новое сообщество)', done: false },
    ],
  },
  {
    id: uid(), sphere: 'love', title: 'Постоянный контакт с семьёй',
    deadline: '2031-12', risk: 'green', status: 'active',
    notes: 'На 100% в твоей зоне контроля.',
    milestones: [
      { id: uid(), title: 'Еженедельный созвон с родителями', done: false },
      { id: uid(), title: 'Ежемесячная встреча вживую', done: false },
    ],
  },
  {
    id: uid(), sphere: 'travel', title: 'Швейцария',
    deadline: '2030-12', risk: 'green', status: 'planned',
    notes: 'Из РФ через третьи страны. Виза реальна, ~€2.5–4к на неделю.',
    milestones: [
      { id: uid(), title: 'Накопить бюджет', done: false },
      { id: uid(), title: 'Получить визу', done: false },
      { id: uid(), title: 'Поездка', done: false },
    ],
  },
  {
    id: uid(), sphere: 'travel', title: 'Япония',
    deadline: '2030-12', risk: 'green', status: 'planned',
    notes: 'E-visa для РФ доступна. 10 дней ~$2.5–4к.',
    milestones: [
      { id: uid(), title: 'Накопить бюджет', done: false },
      { id: uid(), title: 'Оформить e-visa', done: false },
      { id: uid(), title: 'Поездка', done: false },
    ],
  },
  {
    id: uid(), sphere: 'travel', title: 'Бали',
    deadline: '2029-12', risk: 'green', status: 'planned',
    notes: 'VOA, простая логистика.',
    milestones: [
      { id: uid(), title: 'Бюджет', done: false },
      { id: uid(), title: 'Поездка', done: false },
    ],
  },
  {
    id: uid(), sphere: 'travel', title: 'Шанхай',
    deadline: '2030-12', risk: 'green', status: 'planned',
    notes: 'Безвизовый транзит до 240 ч или туристическая виза.',
    milestones: [
      { id: uid(), title: 'Бюджет', done: false },
      { id: uid(), title: 'Виза или транзит', done: false },
      { id: uid(), title: 'Поездка', done: false },
    ],
  },
  {
    id: uid(), sphere: 'learn', title: 'Магистратура ВШЭ ИИ — поступить',
    deadline: '2027-09', risk: 'amber', status: 'planned',
    notes: '«ИИ в маркетинге и управлении продуктом», совместная с Яндексом. Нагрузка 20–30 ч/нед — это ОЧЕНЬ много при параллельном Таргете.',
    milestones: [
      { id: uid(), title: 'Изучить требования к поступлению', done: false },
      { id: uid(), title: 'Подготовка к вступительным', done: false },
      { id: uid(), title: 'Подача документов', done: false },
      { id: uid(), title: 'Решение по бюджету и совместимости с Таргет', done: false },
    ],
  },
  {
    id: uid(), sphere: 'learn', title: 'Python + SQL до уверенного джуновского уровня',
    deadline: '2027-04', risk: 'green', status: 'planned',
    notes: '6–12 мес при 5–8 ч/нед. Хорошая база перед магистратурой.',
    milestones: [
      { id: uid(), title: 'Курс по Python — пройти полностью', done: false },
      { id: uid(), title: 'SQL: запросы, JOIN, оконные функции', done: false },
      { id: uid(), title: '3 пет-проекта на GitHub', done: false },
    ],
  },
  {
    id: uid(), sphere: 'learn', title: 'Китайский до HSK3 (≈ B1)',
    deadline: '2029-04', risk: 'amber', status: 'planned',
    notes: 'Требует ~600–750 часов. При 5 ч/нед × 3 года = 780 ч. На грани, но реально.',
    milestones: [
      { id: uid(), title: 'HSK1', done: false },
      { id: uid(), title: 'HSK2', done: false },
      { id: uid(), title: 'HSK3', done: false },
    ],
  },
  {
    id: uid(), sphere: 'learn', title: 'Немецкий до A2',
    deadline: '2029-04', risk: 'green', status: 'planned',
    notes: 'A2 за 3 года при 2–3 ч/нед — очень комфортно.',
    milestones: [
      { id: uid(), title: 'A1 — экзамен или эквивалент', done: false },
      { id: uid(), title: 'A2 — экзамен или эквивалент', done: false },
    ],
  },
  {
    id: uid(), sphere: 'home', title: 'Улучшить текущую квартиру в 2026',
    deadline: '2026-12', risk: 'green', status: 'active',
    notes: 'В работе, конкретно.',
    milestones: [
      { id: uid(), title: 'Список улучшений', done: false },
      { id: uid(), title: 'Бюджет', done: false },
      { id: uid(), title: 'Реализация', done: false },
    ],
  },
  {
    id: uid(), sphere: 'home', title: 'Переехать в дом Richmond',
    deadline: '2027-02', risk: 'green', status: 'planned',
    notes: 'Дата уточнена: февраль 2027.',
    milestones: [
      { id: uid(), title: 'Подтвердить вариант', done: false },
      { id: uid(), title: 'Финансы', done: false },
      { id: uid(), title: 'Переезд', done: false },
    ],
  },
  {
    id: uid(), sphere: 'home', title: 'Переезд в Москву (август 2026)',
    deadline: '2026-08', risk: 'amber', status: 'planned',
    notes: 'Совмещается с ростом Таргета — где школа физически? Решить до конца мая.',
    milestones: [
      { id: uid(), title: 'Решить вопрос Таргета (онлайн/Москва)', done: false },
      { id: uid(), title: 'Найти жильё в Москве', done: false },
      { id: uid(), title: 'Логистика переезда', done: false },
    ],
  },
  {
    id: uid(), sphere: 'spirit', title: 'Церковь раз в месяц',
    deadline: '2031-12', risk: 'green', status: 'active',
    notes: '12 раз в год — простая привычка.',
    milestones: [
      { id: uid(), title: 'Найти приход', done: false },
      { id: uid(), title: 'Запланировать в календаре на год', done: false },
    ],
  },
  {
    id: uid(), sphere: 'spirit', title: 'Медитация дважды в день',
    deadline: '2026-12', risk: 'amber', status: 'planned',
    notes: '2 раза/день — амбициозно для старта. Стратегия: сначала 1/день 30 дней, потом добавлять второй заход.',
    milestones: [
      { id: uid(), title: '1 медитация/день — 30 дней подряд', done: false },
      { id: uid(), title: '2 медитации/день — 14 дней подряд', done: false },
      { id: uid(), title: 'Привычка автоматизирована', done: false },
    ],
  },
  {
    id: uid(), sphere: 'spirit', title: 'Состояние внутреннего покоя',
    deadline: '2028-12', risk: 'green', status: 'active',
    notes: 'Через работу с тревожностью + регулярные практики.',
    milestones: [
      { id: uid(), title: 'Дневник состояний — 30 дней', done: false },
      { id: uid(), title: 'Связь с терапевтом', done: false },
      { id: uid(), title: 'Регулярные практики устаканены', done: false },
    ],
  },
];

const STORAGE_KEY = 'goals_dashboard_v2';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const saveToStorage = (goals) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('save failed', e);
  }
};

export default function App() {
  const [goals, setGoals] = useState(() => loadFromStorage() || buildInitialGoals());
  const [activeSphere, setActiveSphere] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active-and-planned');
  const [expandedId, setExpandedId] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    saveToStorage(goals);
  }, [goals]);

  const updateGoal = (id, patch) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...patch } : g));
  };

  const deleteGoal = (id) => {
    if (!confirm('Удалить эту цель?')) return;
    setGoals(goals.filter(g => g.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleMilestone = (goalId, msId) => {
    setGoals(goals.map(g => g.id !== goalId ? g : {
      ...g,
      milestones: g.milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m),
    }));
  };

  const addMilestone = (goalId, title) => {
    if (!title.trim()) return;
    setGoals(goals.map(g => g.id !== goalId ? g : {
      ...g,
      milestones: [...g.milestones, { id: uid(), title: title.trim(), done: false }],
    }));
  };

  const deleteMilestone = (goalId, msId) => {
    setGoals(goals.map(g => g.id !== goalId ? g : {
      ...g,
      milestones: g.milestones.filter(m => m.id !== msId),
    }));
  };

  const saveGoal = (goalData) => {
    if (goalData.id && goals.find(g => g.id === goalData.id)) {
      setGoals(goals.map(g => g.id === goalData.id ? { ...g, ...goalData } : g));
    } else {
      const newGoal = {
        id: uid(),
        sphere: goalData.sphere || 'career',
        title: goalData.title || 'Новая цель',
        deadline: goalData.deadline || '',
        risk: goalData.risk || 'green',
        status: goalData.status || 'planned',
        notes: goalData.notes || '',
        milestones: goalData.milestones || [],
      };
      setGoals([...goals, newGoal]);
    }
    setEditingGoal(null);
    setCreating(false);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), goals }, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goals-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const arr = Array.isArray(parsed) ? parsed : parsed.goals;
        if (!Array.isArray(arr)) throw new Error('bad format');
        if (confirm(`Импортировать ${arr.length} целей? Текущие будут заменены.`)) {
          setGoals(arr);
        }
      } catch {
        alert('Не удалось разобрать файл');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAll = () => {
    if (!confirm('Сбросить ВСЕ цели до исходного шаблона? Текущие данные будут потеряны.')) return;
    setGoals(buildInitialGoals());
  };

  const visibleGoals = goals.filter(g => {
    if (activeSphere !== 'all' && g.sphere !== activeSphere) return false;
    if (riskFilter !== 'all' && g.risk !== riskFilter) return false;
    if (statusFilter === 'active-and-planned' && (g.status === 'done' || g.status === 'cancelled')) return false;
    if (statusFilter !== 'all' && statusFilter !== 'active-and-planned' && g.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: goals.length,
    green: goals.filter(g => g.risk === 'green').length,
    amber: goals.filter(g => g.risk === 'amber').length,
    red: goals.filter(g => g.risk === 'red').length,
    msTotal: goals.reduce((a, g) => a + g.milestones.length, 0),
    msDone: goals.reduce((a, g) => a + g.milestones.filter(m => m.done).length, 0),
  };
  const overallProgress = stats.msTotal === 0 ? 0 : Math.round(stats.msDone * 100 / stats.msTotal);

  return (
    <>
      <style>{FONTS}</style>
      <div className="f-sans" style={{
        background: PALETTE.bg,
        minHeight: '100vh',
        color: PALETTE.ink,
        padding: '32px 24px 80px',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>

          <header style={{ marginBottom: 36, borderBottom: `1px solid ${PALETTE.line}`, paddingBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: PALETTE.inkSoft, marginBottom: 8 }}>
                  Карта целей · 2026 → 2031
                </div>
                <h1 className="f-serif" style={{
                  fontSize: 56, lineHeight: 1, margin: 0, fontWeight: 600,
                  letterSpacing: '-0.02em',
                  fontVariationSettings: '"opsz" 144, "SOFT" 30',
                }}>
                  План на  <em style={{ fontStyle: 'italic', color: PALETTE.red }}>пять лет</em>.
                </h1>
                <div style={{ marginTop: 14, fontSize: 14, color: PALETTE.inkSoft, maxWidth: 560, lineHeight: 1.55 }}>
                  Каждая цель прошла стресс-тест: реалистичность, конфликты времени, зона контроля. Прогресс считается по выполненным майлстоунам.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn onClick={() => setCreating(true)}>+ цель</Btn>
                <Btn onClick={exportJson}>экспорт</Btn>
                <Btn onClick={() => fileInputRef.current?.click()}>импорт</Btn>
                <input ref={fileInputRef} type="file" accept="application/json" onChange={importJson} style={{ display: 'none' }} />
                <Btn onClick={resetAll} variant="danger">сброс</Btn>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 1,
              marginTop: 28,
              background: PALETTE.line,
              border: `1px solid ${PALETTE.line}`,
            }}>
              <Stat label="всего целей" value={stats.total} />
              <Stat label="общий прогресс" value={`${overallProgress}%`} accent={overallProgress > 0 ? PALETTE.green : PALETTE.ink} />
              <Stat label="майлстоунов" value={`${stats.msDone}/${stats.msTotal}`} />
              <Stat label="зелёная зона" value={stats.green} accent={PALETTE.green} />
              <Stat label="требует уточнений" value={stats.amber} accent={PALETTE.amber} />
              <Stat label="красный флаг" value={stats.red} accent={PALETTE.red} />
            </div>
          </header>

          <div style={{ marginBottom: 24 }}>
            <FilterRow label="Сфера">
              <FilterChip active={activeSphere === 'all'} onClick={() => setActiveSphere('all')}>все</FilterChip>
              {SPHERES.map(s => (
                <FilterChip key={s.id} active={activeSphere === s.id} onClick={() => setActiveSphere(s.id)}>
                  <span style={{ opacity: 0.4, marginRight: 6 }}>{s.symbol}</span>{s.name.toLowerCase()}
                </FilterChip>
              ))}
            </FilterRow>
            <FilterRow label="Риск">
              <FilterChip active={riskFilter === 'all'} onClick={() => setRiskFilter('all')}>все</FilterChip>
              <FilterChip active={riskFilter === 'green'} onClick={() => setRiskFilter('green')} dot={PALETTE.green}>зелёная</FilterChip>
              <FilterChip active={riskFilter === 'amber'} onClick={() => setRiskFilter('amber')} dot={PALETTE.amber}>уточнить</FilterChip>
              <FilterChip active={riskFilter === 'red'} onClick={() => setRiskFilter('red')} dot={PALETTE.red}>флаг</FilterChip>
            </FilterRow>
            <FilterRow label="Статус">
              <FilterChip active={statusFilter === 'active-and-planned'} onClick={() => setStatusFilter('active-and-planned')}>активные</FilterChip>
              <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>все</FilterChip>
              <FilterChip active={statusFilter === 'done'} onClick={() => setStatusFilter('done')}>готово</FilterChip>
              <FilterChip active={statusFilter === 'paused'} onClick={() => setStatusFilter('paused')}>пауза</FilterChip>
            </FilterRow>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleGoals.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: PALETTE.inkSoft, border: `1px dashed ${PALETTE.line}`, background: PALETTE.surface }}>
                нет целей под этими фильтрами
              </div>
            )}
            {visibleGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                expanded={expandedId === goal.id}
                onToggle={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                onUpdate={(patch) => updateGoal(goal.id, patch)}
                onDelete={() => deleteGoal(goal.id)}
                onEdit={() => setEditingGoal(goal)}
                onToggleMilestone={(msId) => toggleMilestone(goal.id, msId)}
                onAddMilestone={(title) => addMilestone(goal.id, title)}
                onDeleteMilestone={(msId) => deleteMilestone(goal.id, msId)}
              />
            ))}
          </div>

          <footer style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${PALETTE.line}`, color: PALETTE.inkSoft, fontSize: 12, lineHeight: 1.6 }}>
            Данные хранятся в браузере (localStorage). Экспортируй регулярно — это твоя страховка. Если очистишь кэш браузера или зайдёшь с другого устройства — данные не подтянутся, восстанавливай из импорта JSON.
          </footer>
        </div>

        {(editingGoal || creating) && (
          <GoalEditor
            goal={editingGoal}
            onSave={saveGoal}
            onCancel={() => { setEditingGoal(null); setCreating(false); }}
          />
        )}
      </div>
    </>
  );
}

function Btn({ children, onClick, variant }) {
  const danger = variant === 'danger';
  return (
    <button
      onClick={onClick}
      className="hover-lift"
      style={{
        padding: '8px 14px',
        background: danger ? 'transparent' : PALETTE.ink,
        color: danger ? PALETTE.red : PALETTE.bg,
        border: danger ? `1px solid ${PALETTE.red}` : `1px solid ${PALETTE.ink}`,
        fontSize: 12, fontWeight: 500, letterSpacing: 1,
        textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0,
      }}
    >{children}</button>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ background: PALETTE.surface, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: PALETTE.inkSoft, marginBottom: 6 }}>
        {label}
      </div>
      <div className="f-serif" style={{ fontSize: 28, lineHeight: 1, fontWeight: 500, color: accent || PALETTE.ink }}>
        {value}
      </div>
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: PALETTE.inkSoft, minWidth: 50 }}>{label}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function FilterChip({ children, active, onClick, dot }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        background: active ? PALETTE.ink : 'transparent',
        color: active ? PALETTE.bg : PALETTE.ink,
        border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
        fontSize: 12, cursor: 'pointer', borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />}
      {children}
    </button>
  );
}

function GoalCard({ goal, expanded, onToggle, onUpdate, onDelete, onEdit, onToggleMilestone, onAddMilestone, onDeleteMilestone }) {
  const [newMs, setNewMs] = useState('');
  const sphere = SPHERES.find(s => s.id === goal.sphere);
  const total = goal.milestones.length;
  const done = goal.milestones.filter(m => m.done).length;
  const progress = total === 0 ? 0 : Math.round(done * 100 / total);
  const risk = RISK_LABELS[goal.risk] || RISK_LABELS.green;
  const isDone = goal.status === 'done';

  return (
    <div className="fade-in" style={{
      background: PALETTE.surface, border: `1px solid ${PALETTE.line}`,
      opacity: isDone ? 0.65 : 1,
    }}>
      <div onClick={onToggle} style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: PALETTE.inkMute }}>
            {sphere?.symbol}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: PALETTE.inkSoft, marginBottom: 4 }}>
                {sphere?.name}
              </div>
              <h3 className="f-serif" style={{
                margin: 0, fontSize: 22, lineHeight: 1.25, fontWeight: 500,
                textDecoration: isDone ? 'line-through' : 'none',
                letterSpacing: '-0.01em',
              }}>{goal.title}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Tag bg={risk.bg} color={risk.color}>● {risk.label}</Tag>
              {goal.deadline && <Tag bg={PALETTE.lineSoft} color={PALETTE.inkSoft}>{formatDeadline(goal.deadline)}</Tag>}
              <Tag bg={PALETTE.lineSoft} color={PALETTE.inkSoft}>{STATUS_LABELS[goal.status] || goal.status}</Tag>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: PALETTE.line, position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: progress === 100 ? PALETTE.green : PALETTE.ink,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: PALETTE.inkSoft, minWidth: 60, textAlign: 'right' }}>
              {done}/{total} · {progress}%
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="fade-in" style={{ padding: '0 20px 20px', borderTop: `1px solid ${PALETTE.line}` }}>
          {goal.notes && (
            <div style={{ marginTop: 16, padding: 14, background: PALETTE.bg, fontSize: 13, lineHeight: 1.6, color: PALETTE.inkSoft, fontStyle: 'italic' }}>
              {goal.notes}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: PALETTE.inkSoft, marginBottom: 10 }}>
              майлстоуны
            </div>
            {goal.milestones.length === 0 && (
              <div style={{ fontSize: 13, color: PALETTE.inkMute, marginBottom: 12 }}>пока пусто. Разбей цель на конкретные шаги.</div>
            )}
            {goal.milestones.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', marginBottom: 4,
                background: m.done ? PALETTE.greenBg : 'transparent',
                border: `1px solid ${m.done ? PALETTE.greenBg : PALETTE.line}`,
              }}>
                <input type="checkbox" checked={m.done} onChange={() => onToggleMilestone(m.id)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: PALETTE.ink }} />
                <span style={{
                  flex: 1, fontSize: 14,
                  textDecoration: m.done ? 'line-through' : 'none',
                  color: m.done ? PALETTE.green : PALETTE.ink,
                }}>{m.title}</span>
                <button onClick={() => onDeleteMilestone(m.id)} style={{
                  background: 'transparent', border: 'none', color: PALETTE.inkMute,
                  cursor: 'pointer', fontSize: 12, padding: 4,
                }}>×</button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input type="text" value={newMs} onChange={(e) => setNewMs(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMs.trim()) {
                    onAddMilestone(newMs); setNewMs('');
                  }
                }}
                placeholder="новый майлстоун…"
                style={{
                  flex: 1, padding: '8px 10px', fontSize: 13,
                  border: `1px solid ${PALETTE.line}`, background: PALETTE.bg, borderRadius: 0,
                }} />
              <button onClick={() => { if (newMs.trim()) { onAddMilestone(newMs); setNewMs(''); } }}
                style={{
                  padding: '8px 14px', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
                  background: PALETTE.ink, color: PALETTE.bg, border: 'none', cursor: 'pointer', borderRadius: 0,
                }}>+</button>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionLink onClick={() => onUpdate({ status: goal.status === 'active' ? 'planned' : 'active' })}>
              {goal.status === 'active' ? '↺ вернуть в план' : '▶ в работу'}
            </ActionLink>
            <ActionLink onClick={() => onUpdate({ status: 'done' })}>✓ готово</ActionLink>
            <ActionLink onClick={() => onUpdate({ status: 'paused' })}>‖ пауза</ActionLink>
            <ActionLink onClick={onEdit}>✎ редактировать</ActionLink>
            <ActionLink onClick={onDelete} danger>🗑 удалить</ActionLink>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ children, bg, color }) {
  return (
    <span style={{
      background: bg, color, padding: '3px 10px', fontSize: 11,
      letterSpacing: 0.5, fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-block',
    }}>{children}</span>
  );
}

function ActionLink({ children, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 'none',
      color: danger ? PALETTE.red : PALETTE.inkSoft,
      fontSize: 12, padding: '4px 0', cursor: 'pointer',
      borderBottom: `1px solid ${danger ? PALETTE.red : PALETTE.line}`,
    }}>{children}</button>
  );
}

function GoalEditor({ goal, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: goal?.id,
    title: goal?.title || '',
    sphere: goal?.sphere || 'career',
    deadline: goal?.deadline || '',
    risk: goal?.risk || 'green',
    status: goal?.status || 'planned',
    notes: goal?.notes || '',
    milestones: goal?.milestones || [],
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.5)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px', zIndex: 100, overflowY: 'auto',
    }}>
      <div className="scroll-thin" style={{
        background: PALETTE.bg, padding: 32, maxWidth: 560, width: '100%',
        border: `1px solid ${PALETTE.ink}`,
      }}>
        <h2 className="f-serif" style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 500 }}>
          {goal ? 'редактировать цель' : 'новая цель'}
        </h2>

        <Field label="название">
          <input value={form.title} onChange={(e) => update('title', e.target.value)} style={inputStyle} />
        </Field>

        <Field label="сфера">
          <select value={form.sphere} onChange={(e) => update('sphere', e.target.value)} style={inputStyle}>
            {SPHERES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="дедлайн (YYYY-MM)">
            <input value={form.deadline} onChange={(e) => update('deadline', e.target.value)}
              placeholder="2027-04" style={inputStyle} />
          </Field>
          <Field label="статус">
            <select value={form.status} onChange={(e) => update('status', e.target.value)} style={inputStyle}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>

        <Field label="риск">
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(RISK_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => update('risk', k)} style={{
                flex: 1, padding: '10px 12px', fontSize: 12,
                background: form.risk === k ? v.bg : 'transparent',
                color: form.risk === k ? v.color : PALETTE.inkSoft,
                border: `1px solid ${form.risk === k ? v.color : PALETTE.line}`,
                cursor: 'pointer', borderRadius: 0,
              }}>● {v.label}</button>
            ))}
          </div>
        </Field>

        <Field label="заметки">
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)}
            rows={3} style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} />
        </Field>

        <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 20px', background: 'transparent', color: PALETTE.ink,
            border: `1px solid ${PALETTE.line}`, fontSize: 12, letterSpacing: 1,
            textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0,
          }}>отмена</button>
          <button onClick={() => onSave(form)} style={{
            padding: '10px 20px', background: PALETTE.ink, color: PALETTE.bg,
            border: `1px solid ${PALETTE.ink}`, fontSize: 12, letterSpacing: 1,
            textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0,
          }}>сохранить</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: `1px solid ${PALETTE.line}`, background: PALETTE.surface, borderRadius: 0,
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: PALETTE.inkSoft, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function formatDeadline(d) {
  if (!d) return '';
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const m = d.match(/^(\d{4})-(\d{2})/);
  if (!m) return d;
  return `${months[parseInt(m[2]) - 1]} ${m[1]}`;
}
