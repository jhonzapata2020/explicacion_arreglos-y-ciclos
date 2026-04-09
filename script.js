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

const viewModes = {
  python: 'Python',
  json: 'JSON',
};

const state = {
  scenario: 'restaurante',
  loop: 'for',
  step: 0,
  selectedIndex: 0,
  view: 'python',
};

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const scenarioButtons = document.getElementById('scenario-buttons');
const loopButtons = document.getElementById('loop-buttons');
const viewButtons = document.getElementById('view-buttons');
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

function createButton(label, active, onClick, compact = false) {
  const button = document.createElement('button');
  button.className = `btn ${active ? 'is-active' : 'btn-ghost'}${compact ? ' btn-compact' : ''}`;
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

function currentObject(index) {
  const item = currentItems()[index];
  return {
    nombre: item.name,
    categoria: item.type,
    precio: item.price,
    tiempo: item.time,
  };
}

function createPythonCode(index) {
  return loopModes[state.loop].buildCode(currentItems(), index).join('\n');
}

function createJsonCode(index) {
  const items = currentItems().map((item) => ({
    nombre: item.name,
    categoria: item.type,
    precio: item.price,
    tiempo: item.time,
  }));
  const selected = currentObject(index);
  return [
    'Lista de diccionarios:',
    JSON.stringify(items, null, 2),
    '',
    `Elemento seleccionado en la posicion ${index}:`,
    JSON.stringify(selected, null, 2),
    '',
    `Clave y valor ejemplo: nombre -> "${selected.nombre}"`,
  ].join('\n');
}

function renderButtons() {
  scenarioButtons.innerHTML = '';
  loopButtons.innerHTML = '';
  viewButtons.innerHTML = '';

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
        state.view = 'python';
        render();
      })
    );
  });

  Object.entries(viewModes).forEach(([key, label]) => {
    viewButtons.appendChild(
      createButton(label, state.view === key, () => {
        state.view = key;
        renderCode();
      }, true)
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

  // Agregar botones de accion agrupados para diferenciarlos de los items
  const controlsContainer = document.getElementById('simulation-controls');
  if (controlsContainer) {
    controlsContainer.innerHTML = '';
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'grid-actions';
    actionsWrapper.appendChild(stepBtn);
    actionsWrapper.appendChild(resetBtn);
    controlsContainer.appendChild(actionsWrapper);
  }
}

function renderCode() {
  codeBlock.textContent = state.view === 'python'
    ? createPythonCode(state.selectedIndex)
    : createJsonCode(state.selectedIndex);
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
    updateStepButton();
    return;
  }

  const current = items[state.step];
  pointerPill.textContent = `i = ${state.step}`;
  stepExplanation.textContent = `Ahora el ciclo va en i = ${state.step}. Eso significa que Python esta leyendo la posicion ${state.step}, donde esta "${current.name}".`;

  updateStepButton();
}

function updateStepButton() {
  const items = currentItems();
  const done = state.step >= items.length;

  if (done) {
    stepBtn.textContent = 'Recorrido finalizado';
    stepBtn.disabled = true;
    stepBtn.style.opacity = '0.5';
  } else {
    stepBtn.textContent = state.step === 0 ? 'Iniciar recorrido' : 'Siguiente paso';
    stepBtn.disabled = false;
    stepBtn.style.opacity = '1';
  }
}

function renderClickExplanation() {
  const item = currentItems()[state.selectedIndex];

  clickExplanation.innerHTML = `
    Seleccionaste el <strong>indice ${state.selectedIndex}</strong>. En esa posicion esta <strong>${item.name}</strong>.
    En Python se lee como <code>pedido[${state.selectedIndex}]</code>. En una lista de diccionarios, ese mismo elemento tendria claves como
    <code>nombre</code>, <code>categoria</code>, <code>precio</code> y <code>tiempo</code>.
  `;
}

function render() {
  renderButtons();
  renderArray();
  renderCode();
  renderSummary();
  renderStepExplanation();
  renderClickExplanation();
  updateStepButton();
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
  state.view = 'python';
  render();
});

render();

// Scroll suave hacia la simulación
const heroCta = document.getElementById('hero-cta');
if (heroCta) {
  heroCta.addEventListener('click', () => {
    const target = document.getElementById('array-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Resaltar el botón de inicio con una pequeña animación
      setTimeout(() => {
        if (stepBtn) {
          stepBtn.style.transform = 'scale(1.15)';
          stepBtn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          setTimeout(() => {
            stepBtn.style.transform = 'scale(1)';
          }, 400);
        }
      }, 750);
    }
  });
}

// Medidor de visitas globales
async function updateVisitCount() {
  const countElement = document.getElementById('visit-count');
  if (!countElement) return;

  try {
    // Usamos counterapi.dev - namespace y key unicos para este proyecto
    const response = await fetch('https://api.counterapi.dev/v1/mini-pagina-ciclos-pedagogica/visit-count/up');
    const data = await response.json();
    
    if (data && data.count) {
      // Formatear el numero con puntos de miles para consistencia
      const formatter = new Intl.NumberFormat('es-CO');
      countElement.textContent = formatter.format(data.count);
    }
  } catch (error) {
    console.error('Error al cargar el contador de visitas:', error);
    countElement.textContent = '---';
  }
}

updateVisitCount();
