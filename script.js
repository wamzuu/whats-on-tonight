const databasePopup = document.querySelector('#database-popup');
const showDatabaseBtn = document.querySelector('#show-database');
const closeDatabaseBtn = document.querySelector('#close-database');

showDatabaseBtn.addEventListener('click', () => {
  databasePopup.classList.add('active');
});

closeDatabaseBtn.addEventListener('click', () => {
  databasePopup.classList.remove('active');
});

const addPopup = document.querySelector('#add-popup');
const showAddPopupBtn = document.querySelector('#show-popup');
const closeAddPopupBtn = document.querySelector('#close-popup');

showAddPopupBtn.addEventListener('click', () => {
  addPopup.classList.add('active');
});

closeAddPopupBtn.addEventListener('click', () => {
  addPopup.classList.remove('active');
});

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

// Load existing media from localStorage
let mediaStorage = JSON.parse(localStorage.getItem('media')) || {};

// Function to save media & update localStorage
const saveMedia = (media) => {
  const mediaId = Date.now().toString(); // Generate a unique ID
  media.id = mediaId; // Assign the ID to the media object
  mediaStorage[mediaId] = media; // Store media as an object

  localStorage.setItem('media', JSON.stringify(mediaStorage));
  displayMedia();
  updateTonightList();
};

const displayMedia = () => {
  const savedMediaList = document.querySelector('#saved-media');
  savedMediaList.innerHTML = ''; // Clear list first

  Object.values(mediaStorage).forEach((media) => {
    // Loop through object values
    const li = document.createElement('li');
    li.textContent = `${media.name} (${media.type} - ${media.day})`;

    // Create Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edit';
    editBtn.onclick = () => editMedia(media.id); // Ensure correct media ID is passed

    // Create Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌ Delete';
    deleteBtn.onclick = () => removeMedia(media.id);

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    savedMediaList.appendChild(li);
  });
};

const removeMedia = (mediaId) => {
  delete mediaStorage[mediaId]; // Remove media by its ID
  localStorage.setItem('media', JSON.stringify(mediaStorage)); // Update storage
  displayMedia(); // Refresh UI
  updateTonightList(); // Refresh "What's on Tonight?"
};

let editingMediaId = null; // Temporary variable to track editing

const editMedia = (mediaId) => {
  const media = mediaStorage[mediaId];

  // Store the media ID being edited
  editingMediaId = mediaId;

  // Prefill the form with existing data
  document.querySelector('#name').value = media.name;
  document.querySelector('#day').value = media.day;
  document.querySelector('#media-type').value = media.type;

  // Show the Add Media popup for editing
  addPopup.classList.add('active');
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  // Get values from the form
  const updatedName = document.querySelector('#name').value.trim();
  const updatedDay = document.querySelector('#day').value;
  const updatedType = document.querySelector('#media-type').value;

  if (!updatedName) return; // Prevent empty submissions

  if (editingMediaId) {
    // ✅ If editing, update existing entry
    mediaStorage[editingMediaId] = {
      id: editingMediaId,
      name: updatedName,
      day: updatedDay,
      type: updatedType,
    };

    editingMediaId = null; // Reset after editing
  } else {
    // ✅ If not editing, add a new entry
    const mediaId = Date.now().toString();
    mediaStorage[mediaId] = {
      id: mediaId,
      name: updatedName,
      day: updatedDay,
      type: updatedType,
    };
  }

  // ✅ Save updated mediaStorage to localStorage
  localStorage.setItem('media', JSON.stringify(mediaStorage));

  // ✅ Refresh UI
  displayMedia();
  updateTonightList();

  // Close the popup and reset form
  form.reset();
  addPopup.classList.remove('active');
};

// ✅ Ensure the form uses the new submission logic
form.addEventListener('submit', handleFormSubmit);

const updateTonightList = () => {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });

  // Filter media that airs today
  const airingToday = Object.values(mediaStorage).filter(
    (media) => media.day === today
  );

  // Display them in the list
  tonightList.innerHTML = ''; // Clear old entries
  if (airingToday.length === 0) {
    tonightList.innerHTML = '<li>No shows airing today.</li>';
    return;
  }

  airingToday.forEach((media) => {
    const li = document.createElement('li');
    li.textContent = `${media.name} (${media.type})`;
    tonightList.appendChild(li);
  });
};

// Load media on page load
displayMedia();
updateTonightList();
