"use strict";

const title = document.getElementById("title");
const desc = document.getElementById("desc");
const button = document.querySelector(".button");
const deleteMemory = document.querySelector(".fa-delete-left");
const addMemory = document.querySelector(".memory_input");
const memories = document.querySelector(".memories");
const dashboard = document.querySelector(".dashboard");

let memoriesArray = JSON.parse(localStorage.getItem("memories")) || [];

// var myIcon = L.icon({
//   iconUrl: "images/my_avatar.png",
//   iconSize: [20, 20],
//   iconAnchor: [22, 94],
//   popupAnchor: [-3, -76],
// });

let markerArray = [];

let memoryTitle;
let memoryDescription;
let map;
let markerLatitude;
let marketLongitude;
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const renderMemoryTile = (memory) => {
  memories.insertAdjacentHTML(
    "beforeend",
    `<div class = "memory" data-id = "${memory.id}">
    <div class="memory_title">${memory.title}</div>
  <i class="fa-solid fa-delete-left deleteButton"></i>
  <div class="memory_desc">
   ${memory.desc}
  </div>
  </div>
  `
  );
};

const renderMarker = (memory) => {
  const marker = L.marker([memory.lat, memory.long])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "leaflet-popup",
      })
    )
    .setPopupContent(`${memory.title} on ${memory.day}th ${memory.month}`)
    .openPopup();

  markerArray.push(marker);
};

dashboard.addEventListener("click", (e) => {
  const memoryEl = e.target.closest(".memory");
  const temp = e.target.closest(".deleteButton");

  if (!memoryEl) return;

  if (temp) {
    const deleteMemoryEl = temp.parentNode;

    const deleteMemory = memoriesArray.find(
      (memo) => memo.id === deleteMemoryEl.dataset.id
    );

    const marker = markerArray.find(
      (mark) =>
        mark._latlng.lat === deleteMemory.lat &&
        mark._latlng.lng === deleteMemory.long
    );

    const deleteMemoryIdx = memoriesArray.indexOf(deleteMemory);

    const deleteMarkerIdx = markerArray.indexOf(marker);

    memoriesArray.splice(deleteMemoryIdx, 1);
    markerArray.splice(deleteMarkerIdx, 1);

    localStorage.setItem("memories", JSON.stringify(memoriesArray));

    map.removeLayer(marker);

    memories.textContent = "";

    memoriesArray.forEach((memory) => {
      renderMemoryTile(memory);
    });

    return;
  }

  const memory = memoriesArray.find((memo) => memo.id === memoryEl.dataset.id);

  map.setView([memory.lat, memory.long], 19, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
});

button.addEventListener("click", (e) => {
  button.classList.add("pressed");

  memoryTitle = title.value;
  memoryDescription = desc.value;

  if (memoryTitle.trim().length == 0 || memoryDescription.trim().length == 0) {
    button.insertAdjacentHTML(
      "beforebegin",
      "<p style= color:red; >Please enter title & description</p>"
    );
    return;
  }

  let memory = {
    id: (Date.now() + " ").slice(-10),
    title: memoryTitle,
    desc: memoryDescription,
    lat: markerLatitude,
    long: marketLongitude,
    day: new Date().getDate(),
    month: months[new Date().getMonth()],
  };
  memoriesArray.push(memory);

  localStorage.setItem("memories", JSON.stringify(memoriesArray));

  renderMemoryTile(memory);
  renderMarker(memory);

  title.value = "";
  desc.value = "";
  addMemory.style.height = "0";
  addMemory.style.opacity = "0";

  setTimeout(() => {
    button.classList.remove("pressed");
  }, 200);
});

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      map = L.map("map").setView([latitude,longitude], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      memoriesArray.forEach((memory) => {
        renderMemoryTile(memory);
        renderMarker(memory);
      });

      map.on("click", (e) => {
        addMemory.style.height = "auto";
        addMemory.style.opacity = "1";
        ({ lat: markerLatitude, lng: marketLongitude } = e.latlng);
      });
    },
    function () {
      alert("Couldn't fetch your position");
    }
  );
}
