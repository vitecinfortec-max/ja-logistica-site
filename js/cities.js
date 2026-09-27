(function () {
  'use strict';
  var inputs = Array.from(document.querySelectorAll('[data-city-search]'));
  if (!inputs.length) return;
  var cities;
  var pending;
  var states;
  var limit = 30;
  function normalize(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function loadCities() {
    if (cities) return Promise.resolve(cities);
    if (!pending) {
      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 8000);
      pending = fetch('/data/cities.json?v=20260926-1', {signal: controller.signal})
        .then(function (response) {
          if (!response.ok) throw new Error('Não foi possível carregar as cidades.');
          return response.json();
        })
        .then(function (data) {
          if (!Array.isArray(data.cities) || !data.cities.length) throw new Error('Lista vazia.');
          cities = data.cities.map(function (city) {
            return {name: city[0], uf: city[1], key: normalize(city[0]), label: city[0] + ' — ' + city[1]};
          });
          states = new Set(cities.map(function (city) { return city.uf.toLowerCase(); }));
          return cities;
        })
        .catch(function (error) { pending = null; throw error; })
        .finally(function () { window.clearTimeout(timeout); });
    }
    return pending;
  }
  function findCities(value) {
    var tokens = normalize(value).split(' ').filter(Boolean);
    var uf = states.has(tokens[tokens.length - 1]) ? tokens.pop() : '';
    var name = tokens.join(' ');
    var matches = cities.filter(function (city) {
      return (!uf || city.uf.toLowerCase() === uf) &&
        tokens.every(function (token) { return city.key.indexOf(token) !== -1; });
    });
    // Exact names and then prefixes come first, preserving alphabetical order within each group.
    function rank(city) { return city.key === name ? 0 : city.key.indexOf(name) === 0 ? 1 : 2; }
    matches.sort(function (a, b) { return rank(a) - rank(b); });
    return matches;
  }
  inputs.forEach(function (input) {
    var wrapper = document.createElement('div');
    wrapper.className = 'city-search';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    var popup = document.createElement('div');
    popup.className = 'city-search-popup';
    popup.hidden = true;
    var list = document.createElement('ul');
    list.id = input.id + 'Cities';
    list.className = 'city-search-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Cidades e estados');
    list.hidden = true;
    var status = document.createElement('p');
    status.id = input.id + 'CityStatus';
    status.className = 'city-search-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    popup.append(list, status);
    wrapper.appendChild(popup);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-haspopup', 'listbox');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-describedby', status.id);
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    var matches = [];
    var active = -1;
    var revision = 0;
    var composing = false;
    function close() {
      revision++;
      popup.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }
    function showStatus(message) {
      list.replaceChildren();
      list.hidden = true;
      matches = [];
      active = -1;
      input.removeAttribute('aria-activedescendant');
      status.textContent = message;
      popup.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
    function render() {
      if (!input.value.trim()) {
        showStatus('Digite o nome da cidade ou a sigla do estado.');
        return;
      }
      var all = findCities(input.value);
      matches = all.slice(0, limit);
      active = -1;
      input.removeAttribute('aria-activedescendant');
      list.replaceChildren();
      matches.forEach(function (city, index) {
        var option = document.createElement('li');
        option.id = list.id + '-' + index;
        option.className = 'city-search-option';
        option.dataset.index = index;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        var name = document.createElement('span');
        name.className = 'city-search-name';
        name.textContent = city.name;
        var uf = document.createElement('span');
        uf.className = 'city-search-state';
        uf.textContent = city.uf;
        option.append(name, uf);
        list.appendChild(option);
      });
      list.hidden = !matches.length;
      status.textContent = !all.length ? 'Nenhuma cidade encontrada. Confira o nome ou digite o local manualmente.' :
        all.length > limit ? 'Mostrando ' + limit + ' de ' + all.length + ' cidades. Continue digitando para refinar.' :
        all.length === 1 ? '1 cidade encontrada.' : all.length + ' cidades encontradas.';
      popup.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      list.scrollTop = 0;
    }
    function update() {
      var current = ++revision;
      if (!input.value.trim()) showStatus('Digite o nome da cidade ou a sigla do estado.');
      else if (!cities) showStatus('Carregando cidades…');
      loadCities().then(function () {
        if (current === revision && document.activeElement === input && !input.disabled) render();
      }).catch(function () {
        if (current === revision && document.activeElement === input) {
          showStatus('Sugestões indisponíveis. Você pode digitar a cidade e a UF manualmente.');
        }
      });
    }
    function highlight(index) {
      active = index;
      Array.from(list.children).forEach(function (option, i) {
        option.setAttribute('aria-selected', String(i === active));
      });
      var option = list.children[active];
      input.setAttribute('aria-activedescendant', option.id);
      // Scroll only the list, never the page or the form.
      if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
      }
    }
    function choose(index) {
      if (!matches[index]) return;
      input.value = matches[index].label;
      close();
      // Keep quote feedback in sync without reopening the suggestions.
      input.dispatchEvent(new Event('input', {bubbles: true}));
      close();
      input.dispatchEvent(new Event('change', {bubbles: true}));
    }
    input.addEventListener('focus', update);
    input.addEventListener('click', function () { if (popup.hidden) update(); });
    input.addEventListener('input', function () { if (!composing) update(); });
    input.addEventListener('compositionstart', function () { composing = true; close(); });
    input.addEventListener('compositionend', function () { composing = false; update(); });
    input.addEventListener('keydown', function (event) {
      if (event.isComposing || composing) return;
      if (event.key === 'Escape') {
        if (!popup.hidden) event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        close();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (popup.hidden) { update(); return; }
        if (matches.length) {
          var next = active < 0 ? (event.key === 'ArrowDown' ? 0 : matches.length - 1) :
            (active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
          highlight(next);
        }
      } else if (event.key === 'Enter' && !popup.hidden) {
        // Enter picks only a highlighted result, never submits a partially searched route.
        event.preventDefault();
        if (active >= 0) choose(active);
        else close();
      }
    });
    // Keep focus on the combobox until the option's click (including touch) selects it.
    list.addEventListener('pointerdown', function (event) { event.preventDefault(); });
    list.addEventListener('click', function (event) {
      var option = event.target.closest('[role="option"]');
      if (option) choose(Number(option.dataset.index));
    });
    input.addEventListener('blur', close);
    input.form.addEventListener('reset', close);
    input.form.addEventListener('submit', close);
    document.getElementById('quoteService').addEventListener('change', close);
  });
})();
