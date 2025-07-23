function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    const [k, v] = c.trim().split('=');
    if (k === name) return v;
  }
  return '';
}

const loginContainer = document.getElementById('login-container');
const mainContent = document.getElementById('main-content');
const addSetForm = document.getElementById('add-set-form');
const setList = document.getElementById('set-list');
const nicknameInput = document.getElementById('nickname');
const orderListEl = document.getElementById('order-list');
const ordersEl = document.getElementById('orders');
const userInfo = document.getElementById('user-info');

const sets = JSON.parse(localStorage.getItem('sets')) || [];
const orders = JSON.parse(localStorage.getItem('orders')) || [];

function renderSet(set) {
  const card = document.createElement('div');
  card.className = 'set-card';

  const title = document.createElement('h2');
  title.textContent = set.name;

  const img = document.createElement('img');
  img.src = set.image;
  img.alt = set.name;
  img.className = 'set-image';

  const desc = document.createElement('p');
  desc.textContent = set.description;

  const itemList = document.createElement('ul');
  set.items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    itemList.appendChild(li);
  });

  card.appendChild(title);
  card.appendChild(img);
  card.appendChild(desc);
  card.appendChild(itemList);
  card.addEventListener('click', () => handleOrder(set.name));
  setList.appendChild(card);
}

function renderAllSets() {
  setList.innerHTML = '';
  sets.forEach(renderSet);
}

function renderOrders() {
  ordersEl.innerHTML = '';
  orders.forEach((o, i) => {
    const li = document.createElement('li');
    li.textContent = `#${i + 1} | ${o.nick} замовив "${o.setName}"`;

    const nick = getCookie('minecraft_nick');
    if (nick === "GalaxyZheka") {
      const doneBtn = document.createElement('button');
      doneBtn.textContent = 'Виконано';
      doneBtn.onclick = () => {
        if (confirm(`Позначити замовлення #${i + 1} як виконане?`)) {
          orders.splice(i, 1);
          localStorage.setItem('orders', JSON.stringify(orders));
          renderOrders();
        }
      };
      li.appendChild(doneBtn);
    }

    ordersEl.appendChild(li);
  });
}

function handleOrder(setName) {
  const nick = getCookie('minecraft_nick');
  if (confirm(`Ви точно хочете замовити сет "${setName}"?`)) {
    orders.push({ nick, setName });
    localStorage.setItem('orders', JSON.stringify(orders));
    alert('Замовлення прийняте!');
    if (nick === "GalaxyZheka") renderOrders();
  }
}

document.getElementById('login-btn').onclick = () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return alert("Введіть нік!");
  setCookie('minecraft_nick', nick);
  location.reload();
};

document.getElementById('logout-btn').onclick = () => {
  setCookie('minecraft_nick', '', -1);
  location.reload();
};

document.getElementById('change-nick-btn').onclick = () => {
  const newNick = prompt("Введіть новий нік:", getCookie('minecraft_nick') || '');
  if (newNick) {
    setCookie('minecraft_nick', newNick);
    location.reload();
  }
};

document.getElementById('add-set-form').onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('set-name').value;
  const description = document.getElementById('set-description').value;
  const items = document.getElementById('set-items').value.split(',').map(x => x.trim());
  const imageInput = document.getElementById('set-image');

  const reader = new FileReader();
  reader.onload = () => {
    const image = reader.result;
    const newSet = { name, description, items, image };
    sets.push(newSet);
    localStorage.setItem('sets', JSON.stringify(sets));
    renderSet(newSet);
    e.target.reset();
  };
  if (imageInput.files[0]) reader.readAsDataURL(imageInput.files[0]);
};

window.onload = () => {
  const nick = getCookie('minecraft_nick');
  if (nick) {
    loginContainer.style.display = 'none';
    mainContent.style.display = 'block';
    userInfo.textContent = `Нік: ${nick}`;

    if (nick === "GalaxyZheka") {
      addSetForm.style.display = 'block';
      orderListEl.style.display = 'block';
      renderOrders();
    }
    renderAllSets();
  }
};
