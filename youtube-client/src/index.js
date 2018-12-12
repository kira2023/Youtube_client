function searchClips(searchStr) {
  const baseUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  const params = {
    key: 'AIzaSyDBY6qdnsOaFj5Qs01Vtv7bJA73ro9n14s',
    pageToken: nextPageTokenValue,
    type: 'video',
    part: 'snippet',
    maxResults: 12,
    q: searchStr,
  };

  searchStr = searchStr;
  baseUrl.search = new URLSearchParams(params);

  return fetch(baseUrl.href)
    .then(response => response.json());
}

function getVideosInfo(videoIds) {
  const baseUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  const params = {
    key: 'AIzaSyDBY6qdnsOaFj5Qs01Vtv7bJA73ro9n14s',
    part: 'snippet,statistics',
    id: videoIds.join(','),
  };
  baseUrl.search = new URLSearchParams(params);

  return fetch(baseUrl.href)
    .then(response => response.json());
}

function renderClip(clip) {
  const clipTemplate = `
    <div class="clip">
        <img class="clip__picture" src="${clip.snippet.thumbnails.medium.url}" alt="google img">
        <div class="clip__title">
            <a class="clip__title-link" href="https://www.youtube.com/watch?v=${clip.id}">${clip.snippet.title}</a>
        </div>
        <ul class="clip__description">
            <li class="clip__description-item">
            <div class="clip__description-icon">
                <i class="fas fa-male"></i>
            </div>
            <span class="clip__description-text author">
                ${clip.snippet.channelTitle}
            </span>
            </li>
            <li class="clip__description-item">
            <div class="clip__description-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <span class="clip__description-text date">
            ${new Date(clip.snippet.publishedAt).getFullYear()} - ${new Date(clip.snippet.publishedAt).getMonth() + 1} - ${new Date(clip.snippet.publishedAt).getDate()}
            </span>
            </li>
            <li class="clip__description-item">
            <div class="clip__description-icon">
                <i class="far fa-eye"></i>
            </div>
            <span class="clip__description-text num-view">
                ${clip.statistics.viewCount}
            </span>
            </li>
        </ul>
    </div>`;

  clipsWrapper.innerHTML += clipTemplate;
  navigationWrapper.style.display = 'flex';
}

function onSearchClips(callback) {
  buttonSearch.addEventListener('click', () => {
    searchStr = inputSearch.value.trim();
    clearContent();
    callback(searchStr);
  });

  inputSearch.addEventListener('keyup', (event) => {
    if (event.keyCode === enterKeyCode) {
      searchStr = inputSearch.value.trim();
      clearContent();
      callback(searchStr);
    }
  });
}

function clearContent() {
  clipsWrapper.innerHTML = '';
}

function showCurentClips(navIndex) {
  clipsElem.forEach(elem => elem.style.display = 'none');
  setActiveNavItem(navIndex);

  for (let i = (navIndex - 1) * clipsPerPage; i < (navIndex * clipsPerPage) && i < clipsElem.length; i++) {
    clipsElem[i].style.display = 'flex';
  }
}

function setActiveNavItem(activeItem) {
  activeNavItem = activeItem;
  navItems.forEach((item) => {
    if (item.innerHTML == activeNavItem) {
      item.classList.add('navigation__item_active');
    } else {
      item.classList.contains('navigation__item_active') && item.classList.remove('navigation__item_active');
    }
  });
}

function swipeStart(event) {
  event = event || window.event;
  event = ('changedTouches' in event) ? event.changedTouches[0] : event;
  touchStartCoords = {
    x: event.pageX,
    y: event.pageY,
  };
}

function swipeMove(event) {
  event = event || window.event;
  event.preventDefault();
}

function swipeEnd(event) {
  event = event || window.event;
  event = ('changedTouches' in event) ? event.changedTouches[0] : event;
  touchEndCoords = {
    x: event.pageX - touchStartCoords.x,
    y: event.pageY - touchStartCoords.y,
  };

  if (Math.abs(touchEndCoords.x) >= minDistanceXAxis && Math.abs(touchEndCoords.y) <= maxDistanceYAxis) {
    if (touchEndCoords.x < 0) {
      // left
      if (activeNavItem * clipsPerPage === clipsElem.length) {
        searchCallback(searchStr);
      }
      activeNavItem += 1;
      if ((activeNavItem - 1) % 3 === 0) {
        showNextNavItems();
      }
      showCurentClips(activeNavItem);
    } else {
      // right
      if (activeNavItem !== 1) {
        activeNavItem -= 1;
        showNextNavItems();
      }
      showCurentClips(activeNavItem);
    }
  }
}

function addMultipleListeners(targetElement, eventsStr, eventHandler) {
  eventsStr.split(' ').forEach(item => targetElement.addEventListener(item, eventHandler, false));
}

function showNextNavItems() {
  navItems[0].innerText = activeNavItem;
  navItems[1].innerText = +activeNavItem + 1;
  navItems[2].innerText = +activeNavItem + 2;
}

function handleWindowResize(windowWidth) {
  if (windowWidth > 1024) {
    clipsPerPage = 4;
  }
  if (windowWidth > 770 && windowWidth < 1024) {
    clipsPerPage = 3;
  }
  if (windowWidth < 770 && windowWidth > 550) {
    clipsPerPage = 2;
  }
  if (windowWidth < 550) {
    clipsPerPage = 1;
  }
  showCurentClips(activeNavItem);
}

const clipsWrapper = document.querySelector('.clips-wrapper');
const inputSearch = document.querySelector('.input-search');
const buttonSearch = document.querySelector('.button-search');
const navItems = document.querySelectorAll('.navigation__item');
const navigationWrapper = document.querySelector('.navigation');
const clip = document.querySelector('clip');
let activeNavItem = 1;
let clipsElem = [];
let clipsPerPage = 4;
let nextPageTokenValue = '';
let searchStr = '';
const enterKeyCode = 13;
let touchStartCoords = {
  x: -1,
  y: -1,
}; // X and Y coordinates on mousedown or touchstart events.
let touchEndCoords = {
  x: -1,
  y: -1,
}; // X and Y coordinates on mouseup or touchend events.
const minDistanceXAxis = 40; // Min distance on mousemove or touchmove on the X axis
const maxDistanceYAxis = 400; // Max distance on mousemove or touchmove on the Y axis

const searchCallback = (searchStr) => {
  searchClips(searchStr)
    .then((data) => {
        nextPageTokenValue = data.nextPageToken;
        const videoIds = data.items.map(item => item.id.videoId);
        return getVideosInfo(videoIds);
    })
    .then((clipsInfo) => {
        clipsInfo.items.forEach((clip => renderClip(clip)));
    })
    .then(() => {
        clipsElem = [];
        document.querySelectorAll('.clip').forEach(item => clipsElem.push(item));
        handleWindowResize(document.body.clientWidth);
    });
};

onSearchClips(searchCallback);

addMultipleListeners(clipsWrapper, 'mousedown touchstart', swipeStart);
addMultipleListeners(clipsWrapper, 'mousemove touchmove', swipeMove);
addMultipleListeners(clipsWrapper, 'mouseup touchend', swipeEnd);

window.addEventListener('resize', (e) => handleWindowResize(e.target.innerWidth));
