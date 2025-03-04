document.addEventListener('DOMContentLoaded', () => {
  const databasePopup = document.querySelector('#database-popup');
  const showDatabaseBtn = document.querySelector('#show-database');
  const closeDatabaseBtn = document.querySelector('#close-database');

  const addPopup = document.querySelector('#add-popup');
  const showAddPopupBtn = document.querySelector('#show-popup');
  const closeAddPopupBtn = document.querySelector('#close-popup');

  function openPopup(popup) {
    popup.classList.remove('hidden'); // Show background immediately

    setTimeout(() => {
      popup.classList.add('opacity-100'); // Fade in background
      popup.classList.remove('opacity-0');

      const popupContent = popup.querySelector('.popup-content');
      if (popupContent) {
        popupContent.classList.add('scale-100'); // Scale in popup smoothly
        popupContent.classList.remove('scale-75');
      }
    }, 1);
  }

  function closePopup(popup) {
    const popupContent = popup.querySelector('.popup-content');

    // Scale popup first
    if (popupContent) {
      popupContent.classList.add('scale-75');
      popupContent.classList.remove('scale-100');
    }

    // Fade out background AFTER scale completes
    setTimeout(() => {
      popup.classList.add('opacity-0');
      popup.classList.remove('opacity-100');
    }, 100); // Halfway through transition

    // Hide the popup after fade is done
    setTimeout(() => {
      popup.classList.add('hidden');
    }, 500); // Fully matches animation duration
  }

  showDatabaseBtn.addEventListener('click', () => openPopup(databasePopup));
  closeDatabaseBtn.addEventListener('click', () => closePopup(databasePopup));

  showAddPopupBtn.addEventListener('click', () => openPopup(addPopup));
  closeAddPopupBtn.addEventListener('click', () => closePopup(addPopup));

  document.querySelector('#clear-storage').addEventListener('click', () => {
    if (
      confirm(
        'Are you sure you want to delete all media entries? This action cannot be undone.'
      )
    ) {
      localStorage.clear();
      mediaStorage = {}; // Reset in-memory storage
      displayMedia(); // Refresh UI
      updateTonightList(); // Refresh "What's on Tonight?"
      alert('All data has been cleared!');
    }
  });

  const savedMediaList = document.querySelector('#saved-media');
  const tonightList = document.querySelector('#tonight-list');
  const form = document.querySelector('#media-form');

  let mediaStorage = JSON.parse(localStorage.getItem('media')) || {};

  const saveMedia = (media) => {
    const mediaId = Date.now().toString();
    media.id = mediaId;
    mediaStorage[mediaId] = media;
    localStorage.setItem('media', JSON.stringify(mediaStorage));
    displayMedia();
    updateTonightList();
  };

  const displayMedia = () => {
    savedMediaList.innerHTML = '';
    Object.values(mediaStorage).forEach((media) => {
      const li = document.createElement('li');
      li.className =
        'bg-gray-800 p-3 rounded-lg shadow flex justify-between items-center transition duration-200 hover:bg-gray-700';
      li.textContent = `${media.name} (${media.type} - ${media.day})`;

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️ Edit';
      editBtn.className =
        'bg-yellow-500 hover:bg-yellow-400 text-white px-2 py-1 rounded text-sm';
      editBtn.onclick = () => editMedia(media.id);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '❌ Delete';
      deleteBtn.className =
        'bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm';
      deleteBtn.onclick = () => removeMedia(media.id);

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      savedMediaList.appendChild(li);
    });
  };

  const removeMedia = (mediaId) => {
    delete mediaStorage[mediaId];
    localStorage.setItem('media', JSON.stringify(mediaStorage));
    displayMedia();
    updateTonightList();
  };

  let editingMediaId = null;

  const editMedia = (mediaId) => {
    const media = mediaStorage[mediaId];
    editingMediaId = mediaId;
    document.querySelector('#name').value = media.name;
    document.querySelector('#day').value = media.day;
    document.querySelector('#media-type').value = media.type;
    addPopup.classList.remove('hidden');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updatedName = document.querySelector('#name').value.trim();
    const updatedDay = document.querySelector('#day').value;
    const updatedType = document.querySelector('#media-type').value;

    if (!updatedName) return;

    if (editingMediaId) {
      mediaStorage[editingMediaId] = {
        id: editingMediaId,
        name: updatedName,
        day: updatedDay,
        type: updatedType,
      };
      editingMediaId = null;
    } else {
      const mediaId = Date.now().toString();
      mediaStorage[mediaId] = {
        id: mediaId,
        name: updatedName,
        day: updatedDay,
        type: updatedType,
      };
    }

    localStorage.setItem('media', JSON.stringify(mediaStorage));
    displayMedia();
    updateTonightList();
    form.reset();
    addPopup.classList.add('hidden');
  };

  form.addEventListener('submit', handleFormSubmit);

  const updateTonightList = () => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const airingToday = Object.values(mediaStorage).filter(
      (media) => media.day === today
    );

    tonightList.innerHTML = '';
    if (airingToday.length === 0) {
      tonightList.innerHTML = '<li>No shows airing today.</li>';
      return;
    }

    airingToday.forEach((media) => {
      const li = document.createElement('li');
      li.className = 'bg-gray-800 p-2 rounded-lg';
      li.textContent = `${media.name} (${media.type})`;
      tonightList.appendChild(li);
    });
  };

  displayMedia();
  updateTonightList();
  document
    .querySelector('#content')
    .classList.remove('opacity-0', 'translate-y-4');
});
