const scenarios = {
  restaurante: {
    title: 'Restaurante',
    subtitle: 'Cada casilla del arreglo representa un plato o bebida del pedido.',
    items: [
      { name: 'Bandeja', type: 'Almuerzo', price: 22000, time: 14 },
      { name: 'Sopa', type: 'Entrada', price: 9000, time: 8 },
      { name: 'Jugo', type: 'Bebida', price: 7000, time: 3 },
      { name: 'Postre', type: 'Final', price: 8000, time: 4 },
    ],
  },
  pizzeria: {
    title: 'Pizzería',
    subtitle: 'Aquí el arreglo guarda las pizzas de una orden.',
    items: [
      { name: 'Hawaiana', type: 'Mediana', price: 28000, time: 18 },
      { name: 'Pepperoni', type: 'Grande', price: 32000, time: 20 },
      { name: 'Vegetariana', type: 'Personal', price: 24000, time: 15 },
      { name: 'BBQ', type: 'Grande', price: 35000, time: 22 },
    ],
  },
  rapidas: {
    title: 'Comidas rápidas',
    subtitle: 'El arreglo ahora es una fila de productos del combo.',
    items: [
      { name: 'Hamburguesa', type: 'Combo', price: 18000, time: 9 },
      { name: 'Papas', type: 'Acompañante', price: 6000, time: 4 },
      { name: 'Gaseosa', type: 'Bebida', price: 5000, time: 2 },
      { name: 'Helado', type: 'Postre', price: 7000, time: 3 },
    ],
  },
};

const loopModes = {
  for: {
    label: 'for',
    code: [
      'for (let i = 0; i < pedido.length; i++) {',
      '  console.log(pedido[i]);',
      '}',
    ],
  },
  while: {
    label: 'while',
    code: [
      'let i = 0;',
      'while (i < pedido.length) {',
      '  console.log(pedido[i]);',
      '  i++;',
      '}',
    ],
  },
  'do-while': {
    label: 'do...while',
    code: [
      'let i = 0;',
      'do {',
      '  console.log(pedido[i]);',
      '  i++;',
      '} while (i < pedido.length);',
    ],
  },
};

const state = {
  scenario: 'restaurante',
  loop: 'for',
  step: 0,
};

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const scenarioButtons = document.getElementById('scenario-buttons');
const loopButtons = document.getElementById('loop-buttons');
const arrayGrid = document.getElementById('array-grid');
const codeBlock = document.getElementById('code-block');
const pointerPill = document.getElementById('pointer-pill');
const scenarioTitle = document.getElementById('scenario-title');
const scenarioSubtitle = document.getElementById('scenario-subtitle');
const stepExplanation = document.getElementById('step-explanation');
const visitedCount = document.getElementById('visited-count');
const totalPrice = document.getElementById('total-price');
const stepBtn = document.getElementById('step-btn');
const resetBtn = document.getElementById('reset-btn');

function createButton(label, active, onClick) {
  const button = document.createElement('button');
  button.className = `btn ${active ? 'is-active' : 'btn-ghost'}`;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function renderButtons() {
  scenarioButtons.innerHTML = '';
  loopButtons.innerHTML = '';

  Object.entries(scenarios).forEach(([key, value]) => {
    scenarioButtons.appendChild(
      createButton(value.title, state.scenario === key, () => {
        state.scenario = key;
        state.step = 0;
        render();
      })
    );
  });

  Object.entries(loopModes).forEach(([key, value]) => {
    loopButtons.appendChild(
      createButton(value.label, state.loop === key, () => {
        state.loop = key;
        state.step = 0;
        render();
      })
    );
  });
}

function renderArray() {
  const scenario = scenarios[state.scenario];
  const done = state.step >= scenario.items.length;

  arrayGrid.innerHTML = '';

  scenario.items.forEach((item, index) => {
    const card = document.createElement('article');
    const visited = index < state.step;
    const active = !done && index === state.step;

    card.className = `array-item${visited ? ' visited' : ''}${active ? ' active' : ''}`;
    card.innerHTML = `
      <p class="small-label">Índice ${index}</p>
      <h3>${item.name}</h3>
      <p>${item.type}</p>
      <div class="meta">
        <span>${money.format(item.price)}</span>
        <span>${item.time} min</span>
      </div>
    `;

    arrayGrid.appendChild(card);
  });
}

function renderCode() {
  codeBlock.textContent = loopModes[state.loop].code.join('\n');
}

function renderSummary() {
  const items = scenarios[state.scenario].items;
  const visitedItems = items.slice(0, state.step);
  const total = visitedItems.reduce((sum, item) => sum + item.price, 0);

  visitedCount.textContent = String(visitedItems.length);
  totalPrice.textContent = money.format(total);
}

function renderExplanation() {
  const scenario = scenarios[state.scenario];
  const items = scenario.items;
  const done = state.step >= items.length;

  scenarioTitle.textContent = scenario.title;
  scenarioSubtitle.textContent = scenario.subtitle;

  if (done) {
    pointerPill.textContent = `i = ${items.length}`;
    stepExplanation.textContent =
      'Ya terminamos el recorrido. El ciclo visitó todas las posiciones del arreglo, desde 0 hasta length - 1.';
    return;
  }

  const current = items[state.step];
  pointerPill.textContent = `i = ${state.step}`;
  stepExplanation.textContent = `Estamos leyendo la posición ${state.step}. En esa casilla está ${current.name}. Cuando termine esta vuelta, el ciclo avanzará a la siguiente posición.`;
}

function render() {
  renderButtons();
  renderArray();
  renderCode();
  renderSummary();
  renderExplanation();
}

stepBtn.addEventListener('click', () => {
  const length = scenarios[state.scenario].items.length;
  state.step = Math.min(state.step + 1, length);
  render();
});

resetBtn.addEventListener('click', () => {
  state.step = 0;
  render();
});

render();
