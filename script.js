const scenarios = {
  restaurante: {
    title: 'Restaurante',
    subtitle: 'Cada posicion de la lista guarda un plato o bebida del pedido.',
    items: [
      { name: 'Bandeja', type: 'Almuerzo', price: 22000, time: 14 },
      { name: 'Sopa', type: 'Entrada', price: 9000, time: 8 },
      { name: 'Jugo', type: 'Bebida', price: 7000, time: 3 },
      { name: 'Postre', type: 'Final', price: 8000, time: 4 },
    ],
  },
  pizzeria: {
    title: 'Pizzeria',
    subtitle: 'Aqui la lista guarda las pizzas de una orden.',
    items: [
      { name: 'Hawaiana', type: 'Mediana', price: 28000, time: 18 },
      { name: 'Pepperoni', type: 'Grande', price: 32000, time: 20 },
      { name: 'Vegetariana', type: 'Personal', price: 24000, time: 15 },
      { name: 'BBQ', type: 'Grande', price: 35000, time: 22 },
    ],
  },
  rapidas: {
    title: 'Comidas rapidas',
    subtitle: 'La lista ahora representa los productos de un combo.',
    items: [
      { name: 'Hamburguesa', type: 'Combo', price: 18000, time: 9 },
      { name: 'Papas', type: 'Acompanante', price: 6000, time: 4 },
      { name: 'Gaseosa', type: 'Bebida', price: 5000, time: 2 },
      { name: 'Helado', type: 'Postre', price: 7000, time: 3 },
    ],
  },
};

const loopModes = {
  for: {
    label: 'for',
    buildCode(items, index) {
      const values = items.map((item) => `"${item.name}"`).join(', ');
      return [
        `pedido = [${values}]`,
        '',
        `for i in range(len(pedido)):` ,
        `    print(i, pedido[i])`,
        '',
        `# Si i = ${index}, Python lee pedido[${index}]`,
        `print(pedido[${index}])  # "${items[index].name}"`,
      ];
    },
  },
  while: {
    label: 'while',
    buildCode(items, index) {
      const values = items.map((item) => `"${item.name}"`).join(', ');
      return [
        `pedido = [${values}]`,
        `i = 0`,
        '',
        `while i < len(pedido):`,
        `    print(i, pedido[i])`,
        `    i += 1`,
        '',
        `# Si selecciono el indice ${index}`,
        `print(pedido[${index}])  # "${items[index].name}"`,
      ];
    },
  },
};

const state = {
  scenario: 'restaurante',
  loop: 'for',
  step: 0,
  selectedIndex: 0,
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
const clickExplanation = document.getElementById('click-explanation');
const visitedCount = document.getElementById('visited-count');
const selectedItem = document.getElementById('selected-item');
const stepBtn = document.getElementById('step-btn');
const resetBtn = document.getElementById('reset-btn');

function createButton(label, active, onClick) {
  const button = document.createElement('button');
  button.className = `btn ${active ? 'is-active' : 'btn-ghost'}`;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function currentScenario() {
  return scenarios[state.scenario];
}

function currentItems() {
  return currentScenario().items;
}

function createPythonCode(index) {
  return loopModes[state.loop].buildCode(currentItems(), index).join('\n');
}

function renderButtons() {
  scenarioButtons.innerHTML = '';
  loopButtons.innerHTML = '';

  Object.entries(scenarios).forEach(([key, value]) => {
    scenarioButtons.appendChild(
      createButton(value.title, state.scenario === key, () => {
        state.scenario = key;
        state.step = 0;
        state.selectedIndex = 0;
        render();
      })
    );
  });

  Object.entries(loopModes).forEach(([key, value]) => {
    loopButtons.appendChild(
      createButton(value.label, state.loop === key, () => {
        state.loop = key;
        render();
      })
    );
  });
}

function renderArray() {
  const items = currentItems();
  const done = state.step >= items.length;

  arrayGrid.innerHTML = '';

  items.forEach((item, index) => {
    const card = document.createElement('button');
    const visited = index < state.step;
    const activeStep = !done && index === state.step;
    const selected = index === state.selectedIndex;

    card.type = 'button';
    card.className = `array-item${visited ? ' visited' : ''}${activeStep ? ' active' : ''}${selected ? ' selected' : ''}`;
    card.innerHTML = `
      <p class="small-label">Indice ${index}</p>
      <h3>${item.name}</h3>
      <p>${item.type}</p>
      <div class="meta">
        <span>${money.format(item.price)}</span>
        <span>${item.time} min</span>
      </div>
    `;
    card.addEventListener('click', () => {
      state.selectedIndex = index;
      pointerPill.textContent = `i = ${index}`;
      renderCode();
      renderClickExplanation();
      renderArray();
      renderSummary();
    });

    arrayGrid.appendChild(card);
  });
}

function renderCode() {
  codeBlock.textContent = createPythonCode(state.selectedIndex);
}

function renderSummary() {
  const items = currentItems();
  const visitedItems = items.slice(0, state.step);
  visitedCount.textContent = String(visitedItems.length);
  selectedItem.textContent = items[state.selectedIndex].name;
}

function renderStepExplanation() {
  const items = currentItems();
  const done = state.step >= items.length;

  scenarioTitle.textContent = currentScenario().title;
  scenarioSubtitle.textContent = currentScenario().subtitle;

  if (done) {
    pointerPill.textContent = `i = ${items.length}`;
    stepExplanation.textContent =
      'Ya terminamos el recorrido. El ciclo paso por todas las posiciones de la lista, desde 0 hasta len(lista) - 1.';
    return;
  }

  const current = items[state.step];
  pointerPill.textContent = `i = ${state.step}`;
  stepExplanation.textContent = `Ahora el ciclo va en i = ${state.step}. Eso significa que Python esta leyendo la posicion ${state.step}, donde esta "${current.name}".`;
}

function renderClickExplanation() {
  const item = currentItems()[state.selectedIndex];

  clickExplanation.innerHTML = `
    Seleccionaste el <strong>indice ${state.selectedIndex}</strong>. En esa posicion esta <strong>${item.name}</strong>.
    En Python se lee como <code>pedido[${state.selectedIndex}]</code>. Si el ciclo llega a <code>i = ${state.selectedIndex}</code>,
    entonces ese sera el elemento que va a mostrar o procesar.
  `;
}

function render() {
  renderButtons();
  renderArray();
  renderCode();
  renderSummary();
  renderStepExplanation();
  renderClickExplanation();
}

stepBtn.addEventListener('click', () => {
  const length = currentItems().length;
  state.step = Math.min(state.step + 1, length);
  if (state.step < length) {
    state.selectedIndex = state.step;
  }
  render();
});

resetBtn.addEventListener('click', () => {
  state.step = 0;
  state.selectedIndex = 0;
  render();
});

render();



