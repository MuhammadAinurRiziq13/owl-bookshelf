const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "book";

document.addEventListener("DOMContentLoaded", function () {
  const addForm = document.getElementById("add-form");

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addContainer.style.display = "none";
    addBook();
    clearAddForm();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const textBook = document.getElementById("title").value;
  const textAuthor = document.getElementById("author").value;
  const textYear = document.getElementById("year").value;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, textBook, textAuthor, textYear, false);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    title: "Success!",
    text: "Book added to the shelf!",
    icon: "success",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      confirmButton: "btn finished-btn swal-btn",
    },
  });
  // const Toast = Swal.mixin({
  //   toast: true,
  //   position: "top-end",
  //   showConfirmButton: false,
  //   timer: 3000,
  //   timerProgressBar: true,
  //   didOpen: (toast) => {
  //     toast.onmouseenter = Swal.stopTimer;
  //     toast.onmouseleave = Swal.resumeTimer;
  //   }
  // });
  // Toast.fire({
  //   icon: "success",
  //   title: "Signed in successfully"
  // });
}

document.addEventListener(RENDER_EVENT, function () {
  const unfinishedList = document.getElementById("unfinished-list");
  const finishedList = document.getElementById("finished-list");

  unfinishedList.innerHTML = "";
  finishedList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      finishedList.append(bookElement);
    } else {
      unfinishedList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement("h2");
  textTitle.innerText = title;
  textTitle.classList.add("card-title");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;
  textAuthor.classList.add("card-author");

  const textYear = document.createElement("p");
  textYear.innerText = year;
  textYear.classList.add("card-year");

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("wrap-button");
  container.append(buttonContainer);

  if (isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(id);
    });

    buttonContainer.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function (event) {
      const btnSubmitEdit = document.getElementById("edit-form-btn");
      const parent = event.target.parentElement.parentElement;
      btnSubmitEdit.setAttribute("data-book-id", id);
      getValue(parent);
      editContainer.style.display = "block";
    });

    buttonContainer.append(checkButton, trashButton, editButton);
  }

  return container;
}

// edit feature
function getValue(elemen) {
  document.getElementById("edit-title").value = elemen.querySelector(".card-title").innerText;
  document.getElementById("edit-author").value = elemen.querySelector(".card-author").innerText;
  document.getElementById("edit-year").value = elemen.querySelector(".card-year").innerText;
}

document.getElementById("edit-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const bookId = parseInt(event.target.querySelector("[data-book-id]").getAttribute("data-book-id"));
  editBookContent(bookId);
  editContainer.style.display = "none";
});

function editBookContent(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.title = document.getElementById("edit-title").value;
  bookTarget.author = document.getElementById("edit-author").value;
  bookTarget.year = document.getElementById("edit-year").value;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    title: "Success!",
    text: "the book has been edited",
    icon: "success",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      confirmButton: "btn finished-btn swal-btn",
    },
  });
}

// create object
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// find object
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// save data feature
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// add to compleate feature
function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// remove feature
function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete Book",
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
      cancelButton: "btn cancel-btn swal-btn",
      confirmButton: "btn remove-btn swal-btn",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Book deleted from the shelf!",
        icon: "success",
        confirmButtonText: "OK",
        buttonsStyling: false,
        customClass: {
          confirmButton: "btn finished-btn swal-btn",
        },
      });

      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  });
}

// undo feature
function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// search feature
function searchBookByTitle() {
  let searchBookInput = document.querySelector("#searchTitle").value;
  searchBooks(searchBookInput);
}

function searchBooks(searchInput) {
  const unfinishedList = document.getElementById("unfinished-list");
  const finishedList = document.getElementById("finished-list");

  unfinishedList.innerHTML = "";
  finishedList.innerHTML = "";

  for (const bookItem of books) {
    if (bookItem.title.toLowerCase().includes(searchInput.toLowerCase())) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isComplete) {
        finishedList.append(bookElement);
      } else {
        unfinishedList.append(bookElement);
      }
    }
  }
}

const searchInput = document.getElementById("searchTitle");
searchInput.addEventListener("input", function () {
  searchBookByTitle();
});

// clear
function clearAddForm() {
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("year").value = "";
}

// open and close modal
const addContainer = document.querySelector(".add-container");
const editContainer = document.querySelector(".edit-container");
const addButton = document.querySelector(".add");
const cancelButton = document.querySelector(".cancel-btn");
const cancelEdit = document.querySelector(".cancel-edit");

const openAdd = addButton.addEventListener("click", () => {
  addContainer.style.display = "block";
});

const openEdit = addButton.addEventListener("click", () => {
  addContainer.style.display = "block";
});

const tutupAdd = cancelButton.addEventListener("click", () => {
  addContainer.style.display = "none";
});

const tutupEdit = cancelEdit.addEventListener("click", () => {
  editContainer.style.display = "none";
});
