const books = [];
const RENDER_EVENT = "render-book";
const RENDER_SEARCH = "RENDER_SEARCH";
const SAVED_EVENT = "saved-data";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", () => {
  const submitAddBook = document.getElementById("addNewBook");
  const submitEditBook = document.getElementById("editBook");
  const inputSearch = document.getElementById("inputSearch");

  submitAddBook.addEventListener("click", (event) => {
    event.preventDefault();

    addBook();
  });

  submitEditBook.addEventListener("click", (event) => {
    event.preventDefault();

    editBook();
  });

  inputSearch.addEventListener("input", (event) => {
    event.preventDefault();
    searchBook();
    if (inputSearch.value == "") {
      createBookList(books);
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const generateBookId = () => {
  return +new Date();
};

const generateBook = (id, title, author, year, isCompleted) => {
  return { id, title, author, year, isCompleted };
};

document.addEventListener(RENDER_EVENT, () => {
  const uncompletedReadBook = document.getElementById("unreading");
  uncompletedReadBook.innerHTML = "";

  const completedReadBook = document.getElementById("reading");
  completedReadBook.innerHTML = "";

  for (bookItem of books) {
    const bookElement = createBookList(bookItem);
    bookItem.isCompleted == false
      ? uncompletedReadBook.append(bookElement)
      : completedReadBook.append(bookElement);
  }
});

const addBook = () => {
  const form = document.getElementById("formBook");

  const bookId = generateBookId();
  const bookTitle = document.getElementById("title").value;
  const bookAuthor = document.getElementById("author").value;
  const bookYear = document.getElementById("year").value;
  const readBook = document.getElementById("read").checked;

  resetForm();

  if (!bookTitle == "" && !bookAuthor == "" && !bookYear == "") {
    $("#modalAddBook").modal("hide");
    const bookObject = generateBook(
      bookId,
      bookTitle,
      bookAuthor,
      bookYear,
      readBook
    );
    books.push(bookObject);
    saveData();
  } else {
    form.classList.add("was-validated");
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const editBook = () => {
  const form = document.getElementById("formEditBook");

  const bookId = document.getElementById("idEdit").value;
  const bookTitle = document.getElementById("titleEdit").value;
  const bookAuthor = document.getElementById("authorEdit").value;
  const bookYear = document.getElementById("yearEdit").value;
  const readBook = document.getElementById("readEdit").checked;

  if (!bookTitle == "" && !bookAuthor == "" && !bookYear == "") {
    $("#modalEditBook").modal("hide");
    const bookObject = generateBook(
      bookId,
      bookTitle,
      bookAuthor,
      bookYear,
      readBook
    );
    const target = findBookIndex(bookId);
    books.splice(target, 1, bookObject);
    saveData();
  } else {
    form.classList.add("was-validated");
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const createBookList = (bookObject) => {
  const bookTitle = document.createElement("h3");
  bookTitle.classList.add("card-title", "mb-3", "bookTitle");
  bookTitle.innerText = bookObject.title;

  const bookSubtitle = document.createElement("p");
  bookSubtitle.classList.add("card-subtitle", "mb-3", "text-muted");
  bookSubtitle.innerText = bookObject.author + " - " + bookObject.year;

  const actionGroup = document.createElement("div");
  actionGroup.classList.add("d-flex", "align-items-center");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  cardBody.append(bookTitle, bookSubtitle, actionGroup);

  const card = document.createElement("div");
  card.classList.add("card");
  card.append(cardBody);

  const columnCard = document.createElement("div");
  columnCard.classList.add("col-4", "mb-3");
  columnCard.append(card);
  columnCard.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const doneButton = document.createElement("button");
    doneButton.classList.add("btn", "btn-success", "mx-1");

    const iconDone = document.createElement("i");
    iconDone.classList.add("fa-solid", "fa-rotate-left");
    iconDone.style.color = "white";

    doneButton.append(iconDone);

    doneButton.addEventListener("click", () => {
      undoListBook(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-warning", "mx-1");
    editButton.setAttribute("data-bs-toggle", "modal");
    editButton.setAttribute("data-bs-target", "#modalEditBook");

    const iconEdit = document.createElement("i");
    iconEdit.classList.add("fa-solid", "fa-pen-to-square");
    iconEdit.style.color = "white";

    editButton.append(iconEdit);

    editButton.addEventListener("click", () => {
      editBookList(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger", "mx-1");

    const iconDelete = document.createElement("i");
    iconDelete.classList.add("fa-solid", "fa-trash-can");

    deleteButton.append(iconDelete);

    deleteButton.addEventListener("click", () => {
      Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Kamu tidak akan bisa mengembalikan ini!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteListBook(bookObject.id);
          Swal.fire("Dihapus!", "Buku kamu telah dihapus.", "success");
        }
      });
    });

    actionGroup.append(doneButton, editButton, deleteButton);
  } else {
    const readButton = document.createElement("button");
    readButton.classList.add("btn", "btn-primary", "mx-1");

    const iconRead = document.createElement("i");
    iconRead.classList.add("fa-solid", "fa-check");

    readButton.append(iconRead);

    readButton.addEventListener("click", () => {
      bookListCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-warning", "mx-1");
    editButton.setAttribute("data-bs-toggle", "modal");
    editButton.setAttribute("data-bs-target", "#modalEditBook");

    const iconEdit = document.createElement("i");
    iconEdit.classList.add("fa-solid", "fa-pen-to-square");
    iconEdit.style.color = "white";

    editButton.append(iconEdit);

    editButton.addEventListener("click", () => {
      editBookList(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger", "mx-1");

    const iconDelete = document.createElement("i");
    iconDelete.classList.add("fa-solid", "fa-trash-can");

    deleteButton.append(iconDelete);

    deleteButton.addEventListener("click", () => {
      Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Kamu tidak akan bisa mengembalikan ini!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteListBook(bookObject.id);
          Swal.fire("Dihapus!", "Buku kamu telah dihapus.", "success");
        }
      });
    });

    actionGroup.append(readButton, editButton, deleteButton);
  }

  return columnCard;
};

const bookListCompleted = (bookId) => {
  const target = findBook(bookId);
  if (target == null) return;
  target.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const findBook = (bookId) => {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
};

const findBookIndex = (bookId) => {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
};

const editBookList = (bookId) => {
  const book = findBook(bookId);

  const id = document.getElementById("idEdit");
  const title = document.getElementById("titleEdit");
  const author = document.getElementById("authorEdit");
  const year = document.getElementById("yearEdit");
  const read = document.getElementById("readEdit");

  id.value = book.id;
  title.value = book.title;
  author.value = book.author;
  year.value = book.year;
  read.checked = book.isCompleted;
};

const deleteListBook = (bookId) => {
  const target = findBookIndex(bookId);
  if (target === -1) return;
  books.splice(target, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const undoListBook = (bookId) => {
  const target = findBook(bookId);
  if (target == null) return;
  target.isCompleted = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    const toast = document.getElementById("warningStorageExist");
    toast.classList.add("show");
    return false;
  }
  return true;
};

document.addEventListener(SAVED_EVENT, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const searchBook = () => {
  const keyword = inputSearch.value;
  let dataSearch = [];

  const bookList = books.filter((book) =>
    book.title.toLowerCase().includes(keyword.toLowerCase())
  );

  for (book of bookList) {
    dataSearch.push(book);
  }

  document.addEventListener(RENDER_SEARCH, () => {
    const uncompletedReadBook = document.getElementById("unreading");
    uncompletedReadBook.innerHTML = "";

    const completedReadBook = document.getElementById("reading");
    completedReadBook.innerHTML = "";

    for (book of dataSearch) {
      const card = createBookList(book);

      if (!book.isCompleted) {
        uncompletedReadBook.append(card);
      } else {
        completedReadBook.append(card);
      }
    }
  });

  document.dispatchEvent(new Event(RENDER_SEARCH));
};

const resetForm = () => {
  const form = document.getElementById("formBook");
  form.reset();
  form.classList.remove("was-validated");
};
