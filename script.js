// Simple calculator logic
(() => {
  const displayEl = document.getElementById('display');
  const buttons = Array.from(document.querySelectorAll('.btn'));
  let expr = ''; // expression shown to user, uses × and ÷ for UI

  function updateDisplay() {
    displayEl.textContent = expr || '0';
  }

  function appendValue(val) {
    // prevent two decimals in the same number segment
    if (val === '.') {
      // find last token (after last operator)
      const lastToken = expr.split(/[\+\-×÷\*\/\(\)]/).pop();
      if (lastToken && lastToken.includes('.')) return;
      if (lastToken === '' && (expr === '' || /[+\-×÷/*]$/.test(expr))) {
        // if starting a number like ".5", convert to "0."
        expr += '0';
      }
    }

    expr += val;
    updateDisplay();
  }

  function backspace() {
    expr = expr.slice(0, -1);
    updateDisplay();
  }

  function clearAll() {
    expr = '';
    updateDisplay();
  }

  function evaluateExpression() {
    if (!expr) return;

    // Prepare a safe-to-eval string:
    // Replace × and ÷ with * and / and remove unwanted chars
    const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');

    // Allow only digits, operators, parentheses, decimal points, and spaces
    if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      displayError();
      return;
    }

    try {
      // eslint-disable-next-line no-eval
      let result = eval(sanitized);
      if (typeof result === 'number' && !isFinite(result)) throw new Error('Math error');
      // trim floating point artifacts
      if (typeof result === 'number') {
        result = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
      }
      expr = String(result);
      updateDisplay();
    } catch (e) {
      displayError();
    }
  }

  function displayError() {
    displayEl.textContent = 'Error';
    expr = '';
    setTimeout(updateDisplay, 800);
  }

  // Attach button handlers
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      if (action === 'clear') {
        clearAll();
        return;
      }
      if (action === 'back') {
        backspace();
        return;
      }
      if (action === 'equals') {
        evaluateExpression();
        return;
      }

      // Otherwise it's a value (number/operator)
      appendValue(value);
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;

    if ((/^[0-9]$/).test(key)) {
      appendValue(key);
      e.preventDefault();
      return;
    }
    if (key === '.') { appendValue('.'); e.preventDefault(); return; }
    if (key === '+' || key === '-') { appendValue(key); e.preventDefault(); return; }
    if (key === '*' ) { appendValue('×'); e.preventDefault(); return; }
    if (key === '/') { appendValue('÷'); e.preventDefault(); return; }
    if (key === 'Enter' || key === '=') { evaluateExpression(); e.preventDefault(); return; }
    if (key === 'Backspace') { backspace(); e.preventDefault(); return; }
    if (key === 'Escape') { clearAll(); e.preventDefault(); return; }
    if (key === '(' || key === ')') { appendValue(key); e.preventDefault(); return; }
  });

  // Initial render
  updateDisplay();
})();
