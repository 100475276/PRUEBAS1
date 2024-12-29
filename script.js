/*****************************************************
 * DOM references
 *****************************************************/
const numParticipantsInput = document.getElementById('numParticipants');
const generateParticipantsBtn = document.getElementById('generateParticipantsBtn');
const participantsContainer = document.getElementById('participantsContainer');

const numAccountsInput = document.getElementById('numAccounts');
const generateAccountsBtn = document.getElementById('generateAccountsBtn');
const accountsContainer = document.getElementById('accountsContainer');

const regenerateCheckboxesBtn = document.getElementById('regenerateCheckboxesBtn');
const selectionContainer = document.getElementById('selectionContainer');

const calculateBtn = document.getElementById('calculateBtn');
const resultsContainer = document.getElementById('resultsContainer');

// Datos en memoria (para nombres temporales)
let participants = []; // [{name, amount}, ...]
let accounts = [];     // [{name, cost}, ...]


/*****************************************************
 * 1. Generar PARTICIPANTES (solo campos visuales)
 *****************************************************/
generateParticipantsBtn.addEventListener('click', () => {
  participantsContainer.innerHTML = '';
  const numP = parseInt(numParticipantsInput.value) || 0;
  for (let i = 0; i < numP; i++) {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>Nombre Participante:</label>
      <input type="text" id="pName_${i}" placeholder="A, B, C..." />
      <label>Aporta (EUROS):</label>
      <input type="number" step="0.01" id="pAmount_${i}" placeholder="0" />
    `;
    participantsContainer.appendChild(div);
  }
});

/*****************************************************
 * 2. Generar CUENTAS (solo campos visuales)
 *****************************************************/
generateAccountsBtn.addEventListener('click', () => {
  accountsContainer.innerHTML = '';
  const numA = parseInt(numAccountsInput.value) || 0;
  for (let i = 0; i < numA; i++) {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>Nombre de la cuenta:</label>
      <input type="text" id="accName_${i}" placeholder="Nochevieja, AñoNuevo..." />
      <label>Gasto total:</label>
      <input type="number" step="0.01" id="accCost_${i}" placeholder="0" />
    `;
    accountsContainer.appendChild(div);
  }
});

/*****************************************************
 * 3. Generar Selecciones (checkboxes)
 *    según lo que se haya escrito
 *****************************************************/
regenerateCheckboxesBtn.addEventListener('click', () => {
  selectionContainer.innerHTML = '';

  // Lee cuántos participantes y cuentas hay:
  const numP = parseInt(numParticipantsInput.value) || 0;
  const numA = parseInt(numAccountsInput.value) || 0;

  // Lee (temporalmente) los nombres escritos:
  participants = [];
  for (let i = 0; i < numP; i++) {
    const pName = document.getElementById(`pName_${i}`)?.value.trim() || `P${i+1}`;
    participants.push({ name: pName });
  }

  accounts = [];
  for (let j = 0; j < numA; j++) {
    const accName = document.getElementById(`accName_${j}`)?.value.trim() || `Cuenta${j+1}`;
    accounts.push({ name: accName });
  }

  // Crear checkboxes
  if (numP === 0 || numA === 0) {
    selectionContainer.innerHTML = '<p style="color:red;">Primero genera participantes y cuentas.</p>';
    return;
  }

  for (let i = 0; i < numP; i++) {
    const divSel = document.createElement('div');
    const pName = participants[i].name;
    let html = `<label><strong>${pName} está en:</strong></label><br/>`;
    html += `<div class="checkbox-group">`; // Añadido contenedor flex

    for (let j = 0; j < numA; j++) {
      const accName = accounts[j].name;
      html += `
        <label>
          <input type="checkbox" id="check_${i}_${j}" />
          ${accName}
        </label>
      `;
    }

    html += `</div>`; // Cierre del contenedor flex
    divSel.innerHTML = html;
    selectionContainer.appendChild(divSel);
  }
});

/*****************************************************
 * 4. Al presionar "Calcular"
 *****************************************************/
calculateBtn.addEventListener('click', () => {
  resultsContainer.innerHTML = '';

  // 4.1) Lee participantes (nombre, aportación)
  const numP = parseInt(numParticipantsInput.value) || 0;
  participants = [];
  for (let i = 0; i < numP; i++) {
    const pName = document.getElementById(`pName_${i}`)?.value.trim() || `P${i+1}`;
    const pAmount = parseFloat(document.getElementById(`pAmount_${i}`)?.value) || 0;
    participants.push({ name: pName, amount: pAmount, accountsSelected: [] });
  }

  // 4.2) Lee cuentas (nombre, cost)
  const numA = parseInt(numAccountsInput.value) || 0;
  accounts = [];
  for (let j = 0; j < numA; j++) {
    const accName = document.getElementById(`accName_${j}`)?.value.trim() || `Cuenta${j+1}`;
    const accCost = parseFloat(document.getElementById(`accCost_${j}`)?.value) || 0;
    accounts.push({ name: accName, cost: accCost });
  }

  // 4.3) Lee checkboxes: "¿Quién está en cada cuenta?"
  participants.forEach((p, i) => {
    for (let j = 0; j < accounts.length; j++) {
      const isChecked = document.getElementById(`check_${i}_${j}`)?.checked;
      if (isChecked) {
        p.accountsSelected.push(j);
      }
    }
  });

  // 4.4) Calcula y muestra resultados
  const resultHTML = calcularFondoComunMultiCuentas(participants, accounts);
  resultsContainer.innerHTML = resultHTML;
});

/*****************************************************
 * 5. Lógica de cálculo (SIN la tabla "Balance Final"),
 *    pero con la línea "cuánto desembolsó" cada uno.
 *****************************************************/
function calcularFondoComunMultiCuentas(participants, accounts) {
  // costPerParticipant[p.name] = cuánto le corresponde pagar en total
  const costPerParticipant = {};
  participants.forEach(p => {
    costPerParticipant[p.name] = 0;
  });

  // Generamos el desglose de cada cuenta
  let htmlCuentas = `<h2>Desglose por Cuenta</h2>`;
  let totalCostAllAccounts = 0;

  accounts.forEach((acc, accIndex) => {
    const { name: accName, cost: accCost } = acc;
    totalCostAllAccounts += accCost;

    // Quienes participan en esta cuenta
    const members = participants.filter(p => p.accountsSelected.includes(accIndex));
    const nMembers = members.length;

    htmlCuentas += `
      <div style="border:1px solid #ccc; margin-bottom:20px; padding:10px; border-radius:6px;">
        <h3 style="margin-top:0;">${accName}</h3>
        <p><strong>Costo total:</strong> ${accCost.toFixed(2)}</p>
    `;

    if (nMembers === 0) {
      // Nadie participa => no se reparte
      htmlCuentas += `<p style="color:red;">Nadie seleccionado para esta cuenta.</p></div>`;
      return;
    }

    const costEach = accCost / nMembers;
    htmlCuentas += `<p><strong>Participantes:</strong> ${members.map(m => m.name).join(', ')}</p>`;
    htmlCuentas += `<p><strong>A cada uno le toca:</strong> ${costEach.toFixed(2)}</p>`;

    // Sumar en costPerParticipant
    members.forEach(m => {
      costPerParticipant[m.name] += costEach;
    });

    // Tabla de desglose en esta cuenta
    htmlCuentas += `
      <table>
        <thead>
          <tr><th>Participante</th><th>Parte de la cuenta</th></tr>
        </thead>
        <tbody>
    `;
    members.forEach(m => {
      htmlCuentas += `
        <tr>
          <td>${m.name}</td>
          <td>${costEach.toFixed(2)}</td>
        </tr>
      `;
    });
    htmlCuentas += `</tbody></table></div>`;
  });

  // Calculamos balances (interno) = aportación - costPerParticipant
  let balances = [];
  participants.forEach(p => {
    const b = p.amount - costPerParticipant[p.name];
    balances.push({
      name: p.name,
      balance: parseFloat(b.toFixed(2))
    });
  });

  // ¿Sobrante global?
  const totalContribuido = participants.reduce((acc, p) => acc + p.amount, 0);
  const sobranteGlobal = totalContribuido - totalCostAllAccounts;
  let leftoverTransactions = [];
  if (sobranteGlobal > 0) {
    leftoverTransactions = distributeLeftoverSequentially(balances, sobranteGlobal);
  }

  // Minimizamos transacciones
  const payTransactions = minimizeTransactions(balances);

  // Render final
  let html = htmlCuentas;

  // Resumen global
  html += `<div style="margin-top:30px; border:2px solid #444; border-radius:6px; padding:15px;">`;
  html += `<h2>Resumen Global</h2>`;
  html += `<p><strong>Total Aportado (entre todos):</strong> ${totalContribuido.toFixed(2)}</p>`;
  html += `<p><strong>Total Costos (todas las cuentas):</strong> ${totalCostAllAccounts.toFixed(2)}</p>`;
  html += `<p><strong>Sobrante (inicial):</strong> ${sobranteGlobal.toFixed(2)}</p>`;

  // (A) Reparto de sobrante
  if (leftoverTransactions.length > 0) {
    html += `<h3>1) Reparto de Sobrante</h3>`;
    html += `<table>
      <thead><tr><th>De</th><th>A</th><th>Monto</th></tr></thead><tbody>`;
    leftoverTransactions.forEach(t => {
      html += `<tr><td>${t.from}</td><td>${t.to}</td><td>${t.amount.toFixed(2)}</td></tr>`;
    });
    html += `</tbody></table>`;
  } else if (sobranteGlobal > 0) {
    html += `<p>Hay sobrante pero nadie tenía balance positivo para recibirlo.</p>`;
  } else {
    html += `<p>No se repartió sobrante.</p>`;
  }

  // (B) Transacciones finales (quién paga a quién)
  if (payTransactions.length > 0) {
    html += `<h3>2) Transacciones Finales</h3>`;
    html += `<table>
      <thead><tr><th>Quién paga</th><th>A quién</th><th>Monto</th></tr></thead><tbody>`;
    payTransactions.forEach(t => {
      html += `<tr><td>${t.from}</td><td>${t.to}</td><td>${t.amount.toFixed(2)}</td></tr>`;
    });
    html += `</tbody></table>`;
  } else {
    html += `<p>No hay pagos pendientes al final (nadie debe nada).</p>`;
  }

  // (C) Nuevo: Mostrar cuánto ha desembolsado cada uno (costPerParticipant)
  html += `<h3>¿Cuánto desembolsó cada participante?</h3>`;
  html += `<table>
    <thead><tr><th>Participante</th><th>Desembolso total</th></tr></thead><tbody>`;
  Object.keys(costPerParticipant).forEach((pName) => {
    const cost = costPerParticipant[pName];
    html += `<tr>
      <td>${pName}</td>
      <td>${cost.toFixed(2)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  html += `
    <p style="color:#888; font-size:0.9rem; margin-top:10px;">
      <em>Este es el total que cada persona tuvo que cubrir
      según las cuentas en las que participa.</em>
    </p>
  `;

  html += `</div>`; // cierra el bloque de "Resumen Global"

  return html;
}

/*****************************************************
 * Funciones auxiliares
 *****************************************************/
function distributeLeftoverSequentially(balances, leftover) {
  let creditors = balances.filter(b => b.balance > 0);
  creditors.sort((a, b) => a.balance - b.balance);

  let transactions = [];
  let remain = leftover;

  for (let c of creditors) {
    if (remain <= 0) break;
    const canGive = Math.min(remain, c.balance);
    transactions.push({
      from: "Sobrante",
      to: c.name,
      amount: parseFloat(canGive.toFixed(2))
    });
    c.balance -= canGive;
    remain -= canGive;
  }
  return transactions;
}

function minimizeTransactions(balances) {
  let debtors = balances
    .filter(b => b.balance < 0)
    .map(d => ({ name: d.name, balance: Math.abs(d.balance) }));

  let creditors = balances
    .filter(b => b.balance > 0)
    .map(c => ({ name: c.name, balance: c.balance }));

  let transactions = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount: parseFloat(amount.toFixed(2))
    });

    // Ajustar balances original
    const debtorIndex = balances.findIndex(x => x.name === debtor.name);
    balances[debtorIndex].balance += (amount * -1);

    const creditorIndex = balances.findIndex(x => x.name === creditor.name);
    balances[creditorIndex].balance -= amount;

    // Reducir sub-saldos
    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return transactions;
}
