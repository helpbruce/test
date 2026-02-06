/* ==========================
   БАЗЫ ДАННЫХ
========================== */

let documents = JSON.parse(localStorage.getItem("documents") || "[]");
let usbFiles = JSON.parse(localStorage.getItem("usbFiles") || "[]");

/* ==========================
   ЭЛЕМЕНТЫ
========================== */

const folder = document.getElementById("folder");
const cover = folder.querySelector(".cover");
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

const viewerPrev = document.getElementById("viewerPrev");
const viewerNext = document.getElementById("viewerNext");
const viewerZoneLeft = document.getElementById("viewerZoneLeft");
const viewerZoneRight = document.getElementById("viewerZoneRight");

const screenWrapper = document.getElementById("screenWrapper");

/* ==========================
   ТЕКУЩЕЕ СОСТОЯНИЕ
========================== */

let currentSource = "folder";
let currentIndex = 0;

/* ==========================
   УТИЛИТЫ
========================== */

function isGoogleDrive(url) {
  return url.includes("drive.google.com");
}

function googleDriveToPreview(url) {
  let id = null;

  // Формат /file/d/ID/
  let match = url.match(/\/d\/([^/]+)/);
  if (match) id = match[1];

  // Формат ?id=ID
  if (!id) {
    match = url.match(/id=([^&]+)/);
    if (match) id = match[1];
  }

  if (!id) return url;

  return `https://drive.google.com/file/d/${id}/preview`;
}


/* ==========================
   ПАПКА ОТКРЫТИЕ/ЗАКРЫТИЕ
========================== */

cover.onclick = () => {
  folder.classList.toggle("open");
  highlightActivePage();
};

function openFolder() {
  folder.classList.add("open");
  highlightActivePage();
}

function closeFolder() {
  folder.classList.remove("open");
}

/* ==========================
   ОКНО ДОБАВЛЕНИЯ
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

  if (addContext.value === "usb") {
    usbFiles.push(url);
    localStorage.setItem("usbFiles", JSON.stringify(usbFiles));
    renderUsbFiles();
  }

  else if (addContext.value === "folder") {
    documents.push(url);
    localStorage.setItem("documents", JSON.stringify(documents));
    rebuildDocuments();
  }

  addModal.classList.remove("open");
};

/* ==========================
   СОЗДАНИЕ СТРАНИЦ В ПАПКЕ
========================== */

function createDocumentPage(url, index) {
  const page = document.createElement("div");
  page.className = "page";
  page.style.setProperty("--i", index);

  if (isGoogleDrive(url)) {
    const iframe = document.createElement("iframe");
    iframe.src = googleDriveToPreview(url);
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    page.appendChild(iframe);
  }

  else {
    const img = document.createElement("img");
    img.src = url;
    page.appendChild(img);
  }

  page.onclick = (e) => {
    e.stopPropagation();
    openViewer("folder", index);
  };

  stack.appendChild(page);
}

function rebuildDocuments() {
  stack.innerHTML = "";
  documents.forEach((url, i) => createDocumentPage(url, i));
  highlightActivePage();
}

/* ==========================
   ВИЗУАЛЬНОЕ ЛИСТАНИЕ В ПАПКЕ
========================== */

function highlightActivePage() {
  const pages = document.querySelectorAll(".page");

  pages.forEach((p, i) => {
    if (i === currentIndex) {
      p.style.transform = "translate(-50%, -50%) scale(1)";
      p.style.zIndex = 10;
    } else if (i < currentIndex) {
      p.style.transform = "translate(-60%, -50%) rotate(-8deg)";
      p.style.zIndex = 5;
    } else {
      p.style.transform = "translate(-40%, -50%) rotate(8deg)";
      p.style.zIndex = 5;
    }
  });
}

/* ==========================
   ЗАГРУЗКА ДОКУМЕНТОВ
========================== */

rebuildDocuments();

/* ==========================
   USB ОКНО
========================== */

usbIcon.onclick = () => {
  screenWrapper.classList.add("screen-slide");
  usbIcon.classList.add("usb-insert");

  setTimeout(() => {
    usbModal.classList.add("open");
  }, 800);
};

usbClose.onclick = () => {
  usbModal.classList.remove("open");
  screenWrapper.classList.remove("screen-slide");
  usbIcon.classList.remove("usb-insert");
};

/* ==========================
   РЕНДЕР USB ФАЙЛОВ
========================== */

function renderUsbFiles() {
  usbGrid.innerHTML = "";

  usbFiles.forEach((url, index) => {
    const item = document.createElement("div");
    item.className = "usb-item";

    if (isGoogleDrive(url)) {
      const iframe = document.createElement("iframe");
      iframe.src = googleDriveToPreview(url);
      iframe.frameBorder = "0";
      iframe.allowFullscreen = true;
      item.appendChild(iframe);
    }

    else {
  // Если не Google Drive — показываем картинку
  const img = document.createElement("img");
  img.src = url;
  item.appendChild(img);
}


    item.onclick = () => openViewer("usb", index);

    usbGrid.appendChild(item);
  });
}

renderUsbFiles();

/* ==========================
   ПОЛНОЭКРАННЫЙ ПРОСМОТР
========================== */

function openViewer(source, index) {
  currentSource = source;
  currentIndex = index;

  updateViewer();
  viewerModal.classList.add("open");
  deleteBtn.style.display = "block";
}

function showViewerContent(url) {
  viewerContent.innerHTML = "";

  if (isGoogleDrive(url)) {
    const iframe = document.createElement("iframe");
    iframe.src = googleDriveToPreview(url);
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    viewerContent.appendChild(iframe);
    return;
  }

  const img = document.createElement("img");
  img.src = url;
  viewerContent.appendChild(img);
}

function updateViewer() {
  const base = currentSource === "folder" ? documents : usbFiles;
  const url = base[currentIndex];
  showViewerContent(url);
  hideDeleteTemporarily();
}

viewerClose.onclick = () => {
  viewerModal.classList.remove("open");
  viewerContent.innerHTML = "";
  deleteBtn.style.display = "none";
};

viewerModal.onclick = (e) => {
  if (e.target === viewerModal) viewerClose.onclick();
};

viewerContent.onclick = (e) => {
  e.stopPropagation();
};

/* ==========================
   ЛИСТАНИЕ
========================== */

function goPrev() {
  const base = currentSource === "folder" ? documents : usbFiles;

  if (currentIndex > 0) {
    currentIndex--;
    if (viewerModal.classList.contains("open")) updateViewer();
    else highlightActivePage();
  } else {
    if (currentSource === "folder" && folder.classList.contains("open") && !viewerModal.classList.contains("open")) {
      closeFolder();
    }
  }
}

function goNext() {
  const base = currentSource === "folder" ? documents : usbFiles;

  if (currentIndex < base.length - 1) {
    currentIndex++;
    if (viewerModal.classList.contains("open")) updateViewer();
    else highlightActivePage();
  }
}

viewerPrev.onclick = (e) => {
  e.stopPropagation();
  goPrev();
};

viewerNext.onclick = (e) => {
  e.stopPropagation();
  goNext();
};

viewerZoneLeft.onclick = (e) => {
  e.stopPropagation();
  goPrev();
};

viewerZoneRight.onclick = (e) => {
  e.stopPropagation();
  goNext();
};

/* ==========================
   КЛАВИАТУРА
========================== */

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (viewerModal.classList.contains("open")) viewerClose.onclick();
    else if (usbModal.classList.contains("open")) usbClose.onclick();
    else if (addModal.classList.contains("open")) addModal.classList.remove("open");
  }

  if (viewerModal.classList.contains("open")) {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
    return;
  }

  if (e.key === "ArrowRight" && !folder.classList.contains("open")) {
    openFolder();
    return;
  }

  if (folder.classList.contains("open")) {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  }
});

/* ==========================
   УДАЛЕНИЕ
========================== */

deleteBtn.onclick = () => {
  const base = currentSource === "folder" ? documents : usbFiles;

  base.splice(currentIndex, 1);

  if (currentSource === "folder") {
    localStorage.setItem("documents", JSON.stringify(base));
    documents = base;
    rebuildDocuments();
  } else {
    localStorage.setItem("usbFiles", JSON.stringify(base));
    usbFiles = base;
    renderUsbFiles();
  }

  viewerClose.onclick();
};

/* ==========================
   ПОЯВЛЕНИЕ КНОПКИ "УНИЧТОЖИТЬ"
========================== */

let deleteTimeout = null;

function hideDeleteTemporarily() {
  deleteBtn.style.opacity = "0";

  if (deleteTimeout) clearTimeout(deleteTimeout);

  deleteTimeout = setTimeout(() => {
    deleteBtn.style.opacity = "1";
  }, 1500);
}
