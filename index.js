let db = firebase.database();
let user = window.localStorage.getItem('myWebAppUser');
let users = db.ref('users');
let userCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };

// const getAllMembers = async () => {
//   let resp = await users.get();
//   let d = resp.val();
//   let allUsers = Object.keys(d).map(k => d[k]);

//   for (k in userCount) 
//     userCount[k] = allUsers.filter(o => o.group == k).length;

//   for (i of allUsers) {
//     displayUser(i);
//   }

//   displayCount();
// };

const titleCase = str => {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const displayUser = ({name, group}) => {
  let friends = document.querySelector(`#${group} > .friends__wrapper > .friends`);
  let div = document.createElement('div');
  div.textContent = name;
  friends.appendChild(div);
}

const displayCount = () => {
  for (k in userCount) {
    let countEl  = document.querySelector(`#${k} > svg > circle:last-child`);
    let countNum = document.querySelector(`#${k} > h1:last-of-type`);
    let count = Math.round(userCount[k] / 15 * 100);
    countEl.style.strokeDashoffset = `calc(29rem - (28rem * ${count}) / 100)`;
    countNum.textContent = `${String(count).padStart(2, '0')}`;
  }
}

let radius = 0;
const calculateCarousel = () => {
  let cells = [...document.querySelectorAll('.carousel__cell')];
  let totalCells = cells.length;
  let angle = (2 * Math.PI) / totalCells;
  radius = 23 / (2 * Math.tan(angle / 2)) + 1;
  cells.forEach((el, i) => {
    el.style.transform = `rotateY(${i * angle}rad) translateZ(${radius}rem)`;
  })
}


let selectedIndex = 0;
let carousel = document.querySelector('.carousel');
carousel.style.transform = `translateZ(-${radius}rem)`;

const rotateCarousel = () => {
  let cellCount = [...document.querySelectorAll('.carousel__cell')].length;
  let angle = selectedIndex / cellCount * -360;
  carousel.style.transform = `translateZ(-${radius}rem) rotateY(${angle}deg)`;
}


let loginPage = document.querySelector('.login');
if (user) {
  user = JSON.parse(user);
  loginPage.classList.remove('carousel__cell');
  loginPage.style.display = 'none';
  selectedIndex = Object.keys(userCount).indexOf(user.group);
  selectedIndex = selectedIndex > 2 ? -(1 + selectedIndex % 2) : selectedIndex;
}

calculateCarousel();
rotateCarousel();

users.on('child_added', snap => {
  d = snap.val();
  userCount[d.group]++;
  displayUser(d);
  displayCount();

  let disabledOptions = Object.keys(userCount).filter(k => userCount[k] >= 13);
  disabledOptions.forEach(el => {
    document.getElementById(`o${el}`).classList.add('disabled');
  })

});



var prevButton = document.querySelector('.prev');
prevButton.addEventListener( 'click', () => {
  selectedIndex--;
  rotateCarousel();
});

var nextButton = document.querySelector('.next');
nextButton.addEventListener( 'click', () => {
  selectedIndex++;
  rotateCarousel();
});

document.querySelector('.custom-select__trigger').addEventListener('click', e => {
  document.querySelector('.custom-select').classList.toggle('open');
});

document.querySelector('.custom-select__trigger').addEventListener('touch', e => {
  document.querySelector('.custom-select').classList.toggle('open');
});

[...document.querySelectorAll(".custom-option")].forEach(elem => {
  const myEvents = e => {
    if (!e.target.classList.contains('selected') && !e.target.classList.contains('disabled')) {
      const pre_selection = e.target.parentNode.querySelector('.custom-option.selected');
      if (pre_selection)
        pre_selection.classList.remove('selected');
      e.target.classList.add('selected');
      const selector = e.target.closest('.custom-select');
      selector.querySelector('.custom-select__trigger span').textContent = e.target.textContent;
      selector.querySelector('.custom-select__trigger').style.color = "hsla(0, 0%, 100%, 0.8)";
      selector.querySelector('.custom-select__trigger').style.borderColor = 'transparent';
      e.target.closest('.custom-select').classList.remove('open');
    }
  }

  elem.addEventListener('click', myEvents);
  elem.addEventListener('touch', myEvents);
})

window.addEventListener('click', e => {
  const select = document.querySelector('.custom-select')
  if (!select.contains(e.target)) {
      select.classList.remove('open');
  }
  isReady = false;
});

let errorStyle = 'hsla(0, 100%, 50%, 0.5)';

let firstNameStr = "";
let firstName = document.getElementById('name')
let nameRegex = /^[^\s]+$/g;

firstName.addEventListener('blur', e => {
  firstNameStr = titleCase(e.target.value.trim().split(' ')[0]);
});

firstName.addEventListener('focus', e => {
  firstName.style.borderColor = 'transparent';
});


let emailStr = "";
let email = document.getElementById('email');
let emailRegex = /.+@aot.edu.in/g;

email.addEventListener('blur', e => {
  if (e.target.value) {
    emailStr = e.target.value.trim();
    if (!emailRegex.test(emailStr)) {
      emailStr = "";
      email.style.borderColor = errorStyle;
    }
  }
})

email.addEventListener('focus', e => {
  email.style.borderColor = 'transparent';
});



let submit = document.querySelector('input[type="button"]');

submit .addEventListener('click', async e => {
  let group = document.querySelector('.custom-option.selected');
  let groups = [...document.querySelectorAll('.custom-option')];
  selectedIndex = groups.indexOf(group);
  selectedIndex = selectedIndex > 2 ? -(1 + selectedIndex % 2) : selectedIndex;

  if (!group)
    document.querySelector('.custom-select__trigger').style.borderColor = errorStyle;

  if (!emailStr)
    email.style.borderColor = errorStyle;

  if (!firstNameStr)
    firstName.style.borderColor = errorStyle;

  if (firstNameStr && emailStr && group) {
    let groupName = group.textContent.charAt(group.textContent.length - 1);
    const id = emailStr.replace(/\.(?=\d+@|.*\d@)|\@.*/g, '');
    let person = {
      name: firstNameStr,
      group: groupName,
    };
    d = await users.child(id).get();
    
    if (!d.exists()) { 
      users.child(id).set(person);
    }
    else {
      let resp = await users.child(id).get();
      person = resp.val();
    }

    window.localStorage.setItem('myWebAppUser', JSON.stringify(person));
    loginPage.classList.remove('carousel__cell');
    loginPage.style.opacity = 0;
    loginPage.style.transform = 'none';
    loginPage.style.display = 'none';
    calculateCarousel();
    rotateCarousel();
  }
});