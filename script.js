const books = []
const RENDER_EVENT = 'render-book'
const RENDER_SEARCH = 'RENDER_SEARCH'
const SAVED_EVENT = 'saved-data'
const STORAGE_KEY = 'BOOKSHELF_APPS'

document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('addNewBook')
    const inputSearch = document.getElementById('inputSearch')

    submit.addEventListener('click', (event) => {
        event.preventDefault()
        addBook()
    })

    inputSearch.addEventListener('input', (event) => {
        event.preventDefault()
        searchBook()
        if (inputSearch.value == '') {
            createBookList(books)
            document.dispatchEvent(new Event(RENDER_EVENT))
        }
    })

    if (isStorageExist()) {
        loadDataFromStorage()
    }
})

const generateBookId = () => {
    return +new Date()
}

const generateBook = (id, title, author, year, isCompleted) => {
    return { id, title, author, year, isCompleted }
}

document.addEventListener(RENDER_EVENT, () => {
    const uncompletedReadBook = document.getElementById('unreading')
    uncompletedReadBook.innerHTML = ''

    const completedReadBook = document.getElementById('reading')
    completedReadBook.innerHTML = ''

    for (bookItem of books) {
        const bookElement = createBookList(bookItem)
        bookItem.isCompleted == false ? uncompletedReadBook.append(bookElement) : completedReadBook.append(bookElement)
    }
})

const addBook = () => {
    const form = document.getElementById('formBook')
    const submit = document.getElementById('addNewBook')

    const bookId = generateBookId()
    const bookTitle = document.getElementById('title').value
    const bookAuthor = document.getElementById('author').value
    const bookYear = document.getElementById('year').value
    const readBook = document.getElementById('read').checked

    resetForm()

    if (bookTitle == '' && bookAuthor == '' && bookYear == '') {
        form.classList.add('was-validated')
        submit.removeAttribute('data-bs-dismiss')
    } else {
        submit.setAttribute('data-bs-dismiss', 'modal')

        const bookObject = generateBook(bookId, bookTitle, bookAuthor, bookYear, readBook)
        books.push(bookObject)
        saveData()
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}

const createBookList = (bookObject) => {
    const bookTitle = document.createElement('h3')
    bookTitle.classList.add('card-title', 'mb-3', 'bookTitle')
    bookTitle.innerText = bookObject.title

    const bookSubtitle = document.createElement('p')
    bookSubtitle.classList.add('card-subtitle', 'mb-3', 'text-muted')
    bookSubtitle.innerText = bookObject.author + ' - ' + bookObject.year

    const actionGroup = document.createElement('div')
    actionGroup.classList.add('d-flex', 'align-items-center')

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')
    cardBody.append(bookTitle, bookSubtitle, actionGroup)

    const card = document.createElement('div')
    card.classList.add('card')
    card.append(cardBody)

    const columnCard = document.createElement('div')
    columnCard.classList.add('col-4', 'mb-3')
    columnCard.append(card)
    columnCard.setAttribute('id', `book-${bookObject.id}`)

    if (bookObject.isCompleted) {
        const doneButton = document.createElement('button')
        doneButton.classList.add('btn', 'btn-primary')
        doneButton.innerText = 'Read Again'
        doneButton.addEventListener('click', () => {
            undoListBook(bookObject.id)
        })

        const deleteButton = document.createElement('button')
        deleteButton.classList.add('btn', 'text-danger')
        deleteButton.innerText = 'Delete Book'
        deleteButton.addEventListener('click', () => {
            deleteListBook(bookObject.id)
        })

        actionGroup.append(doneButton, deleteButton)

    } else {
        const readButton = document.createElement('button')
        readButton.classList.add('btn', 'btn-primary')
        readButton.innerText = 'Done Read'
        readButton.addEventListener('click', () => {
            bookListCompleted(bookObject.id)
        })

        const deleteButton = document.createElement('button')
        deleteButton.classList.add('btn', 'text-danger')
        deleteButton.innerText = 'Delete Book'
        deleteButton.addEventListener('click', () => {
            deleteListBook(bookObject.id)
        })

        actionGroup.append(readButton, deleteButton)
    }

    return columnCard
}

const bookListCompleted = (bookId) => {
    const target = findBook(bookId)
    if (target == null) return
    target.isCompleted = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

const findBook = (bookId) => {
    for (bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null
}

const findBookIndex = (bookId) => {
    for (index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }
    return -1
}

const deleteListBook = (bookId) => {
    const target = findBookIndex(bookId)
    if (target === -1) return
    books.splice(target, 1)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

const undoListBook = (bookId) => {
    const target = findBook(bookId)
    if (target == null) return
    target.isCompleted = false

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

const saveData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

const isStorageExist = () => {
    if (typeof(Storage) === undefined) {
        const toast = document.getElementById('warningStorageExist')
        toast.classList.add("show")
        return false
    }
    return true
}

document.addEventListener(SAVED_EVENT, () => {
    console.log(localStorage.getItem(STORAGE_KEY))
})

const loadDataFromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY)

    let data = JSON.parse(serializedData)
    if (data !== null) {
        for (book of data) {
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}

const searchBook = () => {
    const keyword = inputSearch.value
    let dataSearch = []

    const bookList = books.filter(book => book.title.toLowerCase().includes(keyword.toLowerCase()))
    for (book of bookList) {
        dataSearch.push(book)
    }

    document.addEventListener(RENDER_SEARCH, () => {
        const uncompletedReadBook = document.getElementById('unreading')
        uncompletedReadBook.innerHTML = ''

        const completedReadBook = document.getElementById('reading')
        completedReadBook.innerHTML = ''

        for (book of dataSearch) {
            const card = createBookList(book)

            if (!book.isCompleted) {
                uncompletedReadBook.append(card)
            } else {
                completedReadBook.append(card)
            }
        }
    })

    document.dispatchEvent(new Event(RENDER_SEARCH))
}

const resetForm = () => {
    const form = document.getElementById('formBook')
    form.reset()
    form.classList.remove('was-validated')
}