/* ==========================
   БАЗЫ ДАННЫХ
========================== */

let documents = JSON.parse(localStorage.getItem("documents") || "[]");
let usbFiles = JSON.parse(localStorage.getItem("usbFiles") || "[]");

/* ==========================
   ЭЛЕМЕНТЫ
========================== */

const folder = document.getElementById("folder");
const stack = document.getElementById("stack");

const usbIcon = document.getElementById("usbIcon");
const usbModal = document.getElementById("usbModal");
const usbClose = document.getElementById("usbClose");
const usbGrid = document.getElementById("usbGrid");

const addBtnFolder = document.getElementById("addBtnFolder");
const addBtnUsb = document.getElementById("addBtnUsb");

const addModal = document.getElementById("addModal");
const fileUrlInput = document.getElementById("fileUrl");
const addContext = document.getElementById("addContext");
const confirmAdd = document.getElementById("confirmAdd");

const viewerModal = document.getElementById("viewerModal");
const viewerContent = document.getElementById("viewerContent");
const viewerClose = document.getElementById("viewerClose");
const deleteBtn = document.getElementById("deleteBtn");

/* ==========================
   ОТКРЫТИЕ / ЗАКРЫТИЕ ПАПКИ
========================== */

folder.addEventListener("click", () => {
  folder.classList.toggle("open");
});

/* ==========================
   ОКНО ДОБАВЛЕНИЯ ФАЙЛА
========================== */

addBtnFolder.onclick = () => {
  addContext.value = "folder";
  fileUrlInput.value = "";
  addModal.classList.add("open");
};

addBtnUsb.onclick = () => {
  addContext.value = "usb";
  fileUrlInput.value = "";
  addModal.classList.add("open");
};

addModal.onclick = (e) => {
  if (e.target === addModal) addModal.classList.remove("open");
};

/* ==========================
   ДОБАВЛЕНИЕ ФАЙЛА
========================== */

confirmAdd.onclick = () => {
  const url = fileUrlInput.value.trim();
  if (!url) return;

  if (addContext.value === "folder") {
    documents.push(url);
    localStorage.setItem("documents", JSON.stringify(documents));
    createDocumentPage(url);
  }

  if (addContext.value === "usb") {
    usbFiles.push(url);
    localStorage.setItem("usbFiles", JSON.stringify(usbFiles));
    renderUsbFiles();
  }

  addModal.classList.remove("open");
};

/* ==========================
   СОЗДАНИЕ СТРАНИЦ В ПАПКЕ
========================== */

function createDocumentPage(url) {
  const page = document.createElement("div");
  page.className = "page";

  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    const v = document.createElement("video");
    v.src = url;
    v.controls = false;
    page.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = url;
    page.appendChild(img);
  }

  page.onclick = (e) => {
    e.stopPropagation();
    openViewer("folder", url);
  };

  stack.appendChild(page);
}

/* ==========================
   ЗАГРУЗКА ДОКУМЕНТОВ
========================== */

documents.forEach(url => createDocumentPage(url));

/* ==========================
   USB ОКНО
========================== */

usbIcon.onclick = () => {
  usbModal.classList.add("open");
  renderUsbFiles();
};

usbClose.onclick = () => {
  usbModal.classList.remove("open");
};

/* ==========================
   РЕНДЕР USB ФАЙЛОВ
========================== */

function renderUsbFiles() {
  usbGrid.innerHTML = "";

  usbFiles.forEach(url => {
    const item = document.createElement("div");
    item.className = "usb-item";

    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      const v = document.createElement("video");
      v.src = url;
      item.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = url;
      item.appendChild(img);
    }

    item.onclick = () => openViewer("usb", url);

    usbGrid.appendChild(item);
  });
}

/* ==========================
   ПОЛНОЭКРАННЫЙ ПРОСМОТР
========================== */

let currentSource = null;   // folder / usb
let currentIndex = null;    // индекс в своей базе

function openViewer(source, url) {
  currentSource = source;

  const base = source === "folder" ? documents : usbFiles;
  currentIndex = base.indexOf(url);

  showViewerContent(url);

  viewerModal.classList.add("open");
  deleteBtn.style.display = "block";
}

function showViewerContent(url) {
  viewerContent.innerHTML = "";

  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    const v = document.createElement("video");
    v.src = url;
    v.controls = true;
    v.autoplay = false; // твой выбор B
    viewerContent.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = url;
    viewerContent.appendChild(img);
  }
}

viewerClose.onclick = () => {
  viewerModal.classList.remove("open");
  viewerContent.innerHTML = "";
  deleteBtn.style.display = "none";
};

viewerModal.onclick = (e) => {
  if (e.target === viewerModal) viewerClose.onclick();
};

/* ==========================
   УДАЛЕНИЕ ФАЙЛА
========================== */

deleteBtn.onclick = () => {
  const base = currentSource === "folder" ? documents : usbFiles;

  const url = base[currentIndex];

  base.splice(currentIndex, 1);

  if (currentSource === "folder") {
    localStorage.setItem("documents", JSON.stringify(base));
    stack.innerHTML = "";
    documents.forEach(url => createDocumentPage(url));
  } else {
    localStorage.setItem("usbFiles", JSON.stringify(base));
    renderUsbFiles();
  }

  viewerClose.onclick();
};
/* ==========================
   ЧАСТЬ 4 — ПОЛНОЭКРАННОЕ ЛИСТАНИЕ
========================== */

const viewerPrev = document.getElementById("viewerPrev");
const viewerNext = document.getElementById("viewerNext");

const viewerZoneLeft = document.getElementById("viewerZoneLeft");
const viewerZoneRight = document.getElementById("viewerZoneRight");

/* --------------------------
   ПОКАЗ КОНТЕНТА ПО ИНДЕКСУ
--------------------------- */

function updateViewer() {
  const base = currentSource === "folder" ? documents : usbFiles;
  const url = base[currentIndex];

  showViewerContent(url);

  hideDeleteTemporarily();
}

/* --------------------------
   ЛИСТАНИЕ НАЗАД
--------------------------- */

function goPrev() {
  const base = currentSource === "folder" ? documents : usbFiles;

  if (currentIndex > 0) {
    currentIndex--;
    updateViewer();
  }
}

/* --------------------------
   ЛИСТАНИЕ ВПЕРЁД
--------------------------- */

function goNext() {
  const base = currentSource === "folder" ? documents : usbFiles;

  if (currentIndex < base.length - 1) {
    currentIndex++;
    updateViewer();
  }
}

/* --------------------------
   СТРЕЛКИ
--------------------------- */

viewerPrev.onclick = (e) => {
  e.stopPropagation();
  goPrev();
};

viewerNext.onclick = (e) => {
  e.stopPropagation();
  goNext();
};

/* --------------------------
   КЛИКАБЕЛЬНЫЕ ЗОНЫ
--------------------------- */

viewerZoneLeft.onclick = (e) => {
  e.stopPropagation();
  goPrev();
};

viewerZoneRight.onclick = (e) => {
  e.stopPropagation();
  goNext();
};

/* --------------------------
   ЛИСТАНИЕ СТРЕЛКАМИ КЛАВИАТУРЫ
--------------------------- */

document.addEventListener("keydown", (e) => {
  if (!viewerModal.classList.contains("open")) return;

  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "ArrowRight") goNext();
});

/* --------------------------
   ИСЧЕЗНОВЕНИЕ КНОПКИ "УНИЧТОЖИТЬ"
--------------------------- */

let deleteTimeout = null;

function hideDeleteTemporarily() {
  deleteBtn.style.opacity = "0";

  if (deleteTimeout) clearTimeout(deleteTimeout);

  deleteTimeout = setTimeout(() => {
    deleteBtn.style.opacity = "1";
  }, 500);
}

/* --------------------------
   ЗАПРЕТ ЛИСТАНИЯ ПО КЛИКУ НА ДОКУМЕНТ
--------------------------- */

viewerContent.onclick = (e) => {
  e.stopPropagation();
};
