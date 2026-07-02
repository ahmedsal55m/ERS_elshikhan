const books = JSON.parse(localStorage.getItem('books')) || [];
const orders = JSON.parse(localStorage.getItem('orders')) || [];
const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
const offers = JSON.parse(localStorage.getItem('offers')) || [];
let editBookIndex = null;
let editOrderIndex = null;
let editExpenseIndex = null;
let editOfferIndex = null;
let selectedBooks = new Set(); // Track selected books
let isSupabaseSyncEnabled = true;

async function saveSupabaseData() {
  if (!isSupabaseSyncEnabled || !window.electronAPI || typeof window.electronAPI.saveAppData !== 'function') return;

  const payload = {
    books,
    orders,
    expenses,
    offers,
    purchaseList: purchaseList || [],
    completedPurchaseList: completedPurchaseList || []
  };

  try {
    await window.electronAPI.saveAppData(payload);
  } catch (error) {
    console.warn('Supabase sync failed:', error);
  }
}

function saveLocalData() {
  localStorage.setItem('books', JSON.stringify(books));
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('offers', JSON.stringify(offers));
  localStorage.setItem('purchaseList', JSON.stringify(purchaseList));
  localStorage.setItem('completedPurchaseList', JSON.stringify(completedPurchaseList));
}

async function loadSupabaseData() {
  if (!window.electronAPI || typeof window.electronAPI.fetchAppData !== 'function') return;

  try {
    const remote = await window.electronAPI.fetchAppData();
    const hasRemote = remote && typeof remote === 'object' && Object.keys(remote).length > 0;

    if (hasRemote) {
      if (Array.isArray(remote.books)) {
        books.splice(0, books.length, ...remote.books);
      }
      if (Array.isArray(remote.orders)) {
        orders.splice(0, orders.length, ...remote.orders);
      }
      if (Array.isArray(remote.expenses)) {
        expenses.splice(0, expenses.length, ...remote.expenses);
      }
      if (Array.isArray(remote.offers)) {
        offers.splice(0, offers.length, ...remote.offers);
      }
      if (Array.isArray(remote.purchaseList)) {
        purchaseList = remote.purchaseList;
      }
      if (Array.isArray(remote.completedPurchaseList)) {
        completedPurchaseList = remote.completedPurchaseList;
      }

      saveLocalData();
    } else {
      const hasLocalData = books.length > 0 || orders.length > 0 || expenses.length > 0 || offers.length > 0 || (purchaseList && purchaseList.length > 0) || (completedPurchaseList && completedPurchaseList.length > 0);
      if (hasLocalData) {
        await saveSupabaseData();
      }
    }
  } catch (error) {
    console.warn('Supabase load failed:', error);
  }
}

// Get next order ID
function getNextOrderId() {
  if (orders.length === 0) return 1;
  const maxId = Math.max(...orders.map(order => order.orderId || 0));
  return maxId + 1;
}

const sectionTitles = {
  books: 'الكتب',
  orders: 'الطلبات',
  offers: 'العروض',
  purchases: 'المشتريات',
  invoices: 'الفواتير',
  dashboard: 'لوحة التحكم',
  expenses: 'المصروفات',
  links: 'الروابط المفيدة',
  backup: 'النسخ الاحتياطي'
};

const pageTitle = document.getElementById('pageTitle');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sidebarToggle = document.getElementById('sidebarToggle');
const body = document.body;
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
let confirmCallback = null;
let confirmType = 'confirm';

sidebarLinks.forEach(button => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.section;
    showSection(sectionId);
  });
});

sidebarToggle.addEventListener('click', () => {
  body.classList.toggle('sidebar-open');
});

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', () => {
    body.classList.remove('sidebar-open');
  });
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
  pageTitle.textContent = sectionTitles[sectionId] || 'لوحة التحكم';
  sidebarLinks.forEach(link => link.classList.toggle('active', link.dataset.section === sectionId));
  body.classList.remove('sidebar-open');

  if (sectionId === 'books') {
    renderBooks();
  } else if (sectionId === 'orders') {
    renderOrders();
  } else if (sectionId === 'offers') {
    if (offerSearch) {
      offerSearch.value = '';
    }
    renderOffers();
  } else if (sectionId === 'invoices') {
    showInvoiceType('current');
    renderInvoices();
  } else if (sectionId === 'dashboard') {
    renderDashboard();
  } else if (sectionId === 'expenses') {
    renderExpenses();
  } else if (sectionId === 'purchases') {
    renderPurchaseList();
  } else if (sectionId === 'links') {
    // No specific rendering needed for links section
  } else if (sectionId === 'backup') {
    // No specific rendering needed for backup section
  }
}

function saveBooks() {
  localStorage.setItem('books', JSON.stringify(books));
  saveSupabaseData();
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
  syncPurchaseItems();
  saveSupabaseData();
}

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  saveSupabaseData();
}

function saveOffers() {
  localStorage.setItem('offers', JSON.stringify(offers));
  saveSupabaseData();
}

// Books
let bookForm;
let bookSubmitBtn;
let bookNameInput;
let publisherInput;
let customerPriceInput;
let myPriceInput;
let bookQuantityInput;
let bookTable;
let bookSearch;
let orderSearch;
let orderStatusFilter;
let invoiceSearch;
let currentInvoicesContainer;
let completedInvoicesContainer;
let currentInvoicesList;
let completedInvoicesList;
let invoiceModal;
let invoiceContent;
let appDateTime;
let confirmTitle;
let confirmAccept;
let confirmCancel;
let orderForm;
let orderSubmitBtn;
let orderIdInput;
let customerNameInput;
let customerPhoneInput;
let customerAddressInput;
let orderDetailsInput;
let orderBookSuggestions;
let orderNotesInput;
let paidAmountInput;
let remainingAmountInput;
let shippingCostInput;
let shippingStatusInput;
let orderTable;
let purchaseList;
let purchaseListContainer;
let completedPurchaseList = [];
let completedPurchaseListContainer;
let pendingPurchaseCostElem;
let pendingPurchaseCountElem;
let expenseForm;
let expenseSubmitBtn;
let expenseTypeInput;
let expenseAmountInput;
let expenseTable;
let offerForm;
let offerSubmitBtn;
let offerDescriptionInput;
let offerDurationInput;
let offerUnitInput;
let offerPriceInput;
let booksChecklist;
let calculatedProfit;
let discountAmountElem;
let discountPercentElem;
let offerTable;
let offerSearch;
let bookSearchOffers;
let activeOffersContainer;
let selectedOfferBookIds = new Set();

let invoiceViewType = 'current';

function showAlertModal(message, callback) {
  confirmTitle.textContent = 'تنبيه';
  confirmMessage.innerHTML = message.replace(/\n/g, '<br>');
  confirmAccept.textContent = 'موافق';
  confirmCancel.style.display = 'none';
  confirmModal.classList.remove('hidden');
  confirmModal.setAttribute('aria-hidden', 'false');
  confirmType = 'alert';
  confirmCallback = () => {
    if (typeof callback === 'function') callback();
  };
}

function showConfirmModal(message, callback) {
  confirmTitle.textContent = 'تأكيد العملية';
  confirmMessage.innerHTML = message.replace(/\n/g, '<br>');
  confirmAccept.textContent = 'نعم';
  confirmCancel.style.display = 'inline-flex';
  confirmModal.classList.remove('hidden');
  confirmModal.setAttribute('aria-hidden', 'false');
  confirmType = 'confirm';
  confirmCallback = result => {
    if (typeof callback === 'function') callback(result);
  };
}

function closeConfirmModal(result) {
  confirmModal.classList.add('hidden');
  confirmModal.setAttribute('aria-hidden', 'true');
  if (confirmCallback) {
    if (confirmType === 'confirm') {
      confirmCallback(result);
    } else {
      confirmCallback();
    }
    confirmCallback = null;
  }
}

function updateAppDateTime() {
  if (!appDateTime) return;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  appDateTime.textContent = `${formattedDate} - ${formattedTime}`;
}

async function initApp() {
  bookForm = document.getElementById('bookForm');
  bookSubmitBtn = document.getElementById('bookSubmitBtn');
  bookNameInput = document.getElementById('bookName');
  publisherInput = document.getElementById('publisher');
  customerPriceInput = document.getElementById('customerPrice');
  myPriceInput = document.getElementById('myPrice');
  bookQuantityInput = document.getElementById('bookQuantity');
  bookTable = document.getElementById('bookTable');
  bookSearch = document.getElementById('bookSearch');
  orderSearch = document.getElementById('orderSearch');
  orderStatusFilter = document.getElementById('orderStatusFilter');
  invoiceSearch = document.getElementById('invoiceSearch');
  currentInvoicesContainer = document.getElementById('currentInvoicesContainer');
  completedInvoicesContainer = document.getElementById('completedInvoicesContainer');
  currentInvoicesList = document.getElementById('currentInvoicesList');
  completedInvoicesList = document.getElementById('completedInvoicesList');
  invoiceModal = document.getElementById('invoiceModal');
  invoiceContent = document.getElementById('invoiceContent');
  appDateTime = document.getElementById('appDateTime');
  confirmTitle = document.getElementById('confirmTitle');
  confirmAccept = document.getElementById('confirmAccept');
  confirmCancel = document.getElementById('confirmCancel');
  expenseForm = document.getElementById('expenseForm');

  updateAppDateTime();
  setInterval(updateAppDateTime, 1000);
  expenseSubmitBtn = document.getElementById('expenseSubmitBtn');
  expenseTypeInput = document.getElementById('expenseType');
  expenseAmountInput = document.getElementById('expenseAmount');
  expenseTable = document.getElementById('expenseTable');
  offerForm = document.getElementById('offerForm');
  offerSubmitBtn = document.getElementById('offerSubmitBtn');
  offerDescriptionInput = document.getElementById('offerDescription');
  offerDurationInput = document.getElementById('offerDuration');
  offerUnitInput = document.getElementById('offerUnit');
  offerPriceInput = document.getElementById('offerPrice');
  booksChecklist = document.getElementById('booksChecklist');
  calculatedProfit = document.getElementById('calculatedProfit');
  discountAmountElem = document.getElementById('discountAmount');
  discountPercentElem = document.getElementById('discountPercent');
  offerTable = document.getElementById('offerTable');
  offerSearch = document.getElementById('offerSearch');
  bookSearchOffers = document.getElementById('bookSearchOffers');
  activeOffersContainer = document.getElementById('activeOffersContainer');
  purchaseListContainer = document.getElementById('purchaseList');
  completedPurchaseListContainer = document.getElementById('completedPurchaseList');
  pendingPurchaseCostElem = document.getElementById('pendingPurchaseCost');
  pendingPurchaseCountElem = document.getElementById('pendingPurchaseCount');

  loadCompletedPurchaseList();
  await loadSupabaseData();

  confirmAccept.addEventListener('click', () => {
    closeConfirmModal(true);
  });

  confirmCancel.addEventListener('click', () => {
    closeConfirmModal(false);
  });

  bookSearch.addEventListener('input', renderBooks);
  orderSearch.addEventListener('input', renderOrders);
  if (orderStatusFilter) {
    orderStatusFilter.addEventListener('change', renderOrders);
  }
  offerSearch.addEventListener('input', renderOffers);
  bookSearchOffers.addEventListener('input', () => updateBooksChecklist(bookSearchOffers.value.toLowerCase()));
  offerPriceInput.addEventListener('input', updateCalculatedProfit);
  if (invoiceSearch) {
    invoiceSearch.addEventListener('input', renderInvoices);
  }

  const openCalculatorBtn = document.getElementById('openCalculatorBtn');
  if (openCalculatorBtn) {
    openCalculatorBtn.addEventListener('click', async () => {
      try {
        await window.electronAPI.openCalculator();
      } catch (error) {
        showAlertModal(error.message || 'تعذر فتح الآلة الحاسبة');
      }
    });
  }

  updateBooksChecklist(bookSearchOffers.value.toLowerCase());

  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validation
    const name = bookNameInput.value.trim();
    const publisher = publisherInput.value.trim();
    const customerPrice = parseFloat(customerPriceInput.value);
    const myPrice = parseFloat(myPriceInput.value);

    if (!name) {
      showAlertModal('يرجى إدخال اسم الكتاب', () => bookNameInput.focus());
      return;
    }

    if (!publisher) {
      showAlertModal('يرجى إدخال دار النشر', () => publisherInput.focus());
      return;
    }

    if (isNaN(customerPrice) || customerPrice < 0) {
      showAlertModal('يرجى إدخال سعر العميل الصحيح', () => customerPriceInput.focus());
      return;
    }

    if (isNaN(myPrice) || myPrice < 0) {
      showAlertModal('يرجى إدخال السعر الصحيح', () => myPriceInput.focus());
      return;
    }

    const book = {
      name: name,
      publisher: publisher,
      customerPrice: customerPrice,
      myPrice: myPrice,
      quantity: parseInt(bookQuantityInput.value) || 0
    };

    if (editBookIndex !== null) {
      books[editBookIndex] = book;
      editBookIndex = null;
      bookSubmitBtn.textContent = 'إضافة كتاب';
    } else {
      books.push(book);
    }

    saveBooks();
    renderBooks();
    bookForm.reset();
  });

  orderForm = document.getElementById('orderForm');
  orderSubmitBtn = document.getElementById('orderSubmitBtn');
  orderIdInput = document.getElementById('orderId');
  customerNameInput = document.getElementById('customerName');
  customerPhoneInput = document.getElementById('customerPhone');
  customerAddressInput = document.getElementById('customerAddress');
  orderDetailsInput = document.getElementById('orderDetails');
  orderBookSuggestions = document.getElementById('orderBookSuggestions');
  orderNotesInput = document.getElementById('orderNotes');
  purchaseListContainer = document.getElementById('purchaseList');
  purchaseList = JSON.parse(localStorage.getItem('purchaseList')) || [];
  const copyOrderNotesBtn = document.getElementById('copyOrderNotesBtn');
  paidAmountInput = document.getElementById('paidAmount');
  remainingAmountInput = document.getElementById('remainingAmount');
  shippingCostInput = document.getElementById('shippingCost');
  shippingStatusInput = document.getElementById('shippingStatus');
  orderTable = document.getElementById('orderTable');

  if (copyOrderNotesBtn) {
    copyOrderNotesBtn.addEventListener('click', copyOrderNotes);
  }

  orderStatusFilter = document.getElementById('orderStatusFilter');

  if (orderDetailsInput) {
    orderDetailsInput.addEventListener('input', updateOrderBookSuggestions);
    orderDetailsInput.addEventListener('keydown', handleOrderBookNavigation);
    document.addEventListener('click', event => {
      if (!orderDetailsInput.contains(event.target) && !orderBookSuggestions.contains(event.target)) {
        orderBookSuggestions.classList.add('hidden');
      }
    });
  }

  syncPurchaseItems();

  orderForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const orderId = parseInt(orderIdInput.value);
    const customerName = customerNameInput.value.trim();
    const customerPhone = customerPhoneInput.value.trim();
    const customerAddress = customerAddressInput.value.trim();
    const orderDetails = orderDetailsInput.value.trim();

    if (!orderId || orderId < 1) {
      showAlertModal('يرجى إدخال كود طلب صحيح', () => orderIdInput.focus());
      return;
    }

    if (!customerName) {
      showAlertModal('يرجى إدخال اسم العميل', () => customerNameInput.focus());
      return;
    }

    if (!customerPhone) {
      showAlertModal('يرجى إدخال رقم التليفون', () => customerPhoneInput.focus());
      return;
    }

    if (!customerAddress) {
      showAlertModal('يرجى إدخال عنوان العميل', () => customerAddressInput.focus());
      return;
    }

    if (!orderDetails) {
      showAlertModal('يرجى إدخال تفاصيل الطلب', () => orderDetailsInput.focus());
      return;
    }

    let remainingAmount = parseFloat(remainingAmountInput.value);
    const status = shippingStatusInput.value;
    if (status === 'ملغي') {
      remainingAmount = 0;
    }

    const totalAmount = parseFloat((parseFloat(paidAmountInput.value) + remainingAmount).toFixed(2));
    const order = {
      orderId: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      orderDetails: orderDetails,
      notes: orderNotesInput.value.trim(),
      paidAmount: parseFloat(paidAmountInput.value),
      remainingAmount: remainingAmount,
      shippingCost: parseFloat(shippingCostInput.value),
      shippingStatus: status,
      totalAmount,
      createdAt: Date.now(),
      initialPaidAmount: parseFloat(paidAmountInput.value),
      collected: remainingAmount === 0
    };

    if (editOrderIndex !== null) {
      const previousOrder = orders[editOrderIndex];
      if (previousOrder && typeof previousOrder.initialPaidAmount === 'number') {
        order.initialPaidAmount = previousOrder.initialPaidAmount;
      }

      orders[editOrderIndex] = order;
      editOrderIndex = null;
      orderSubmitBtn.textContent = 'إضافة طلب';
    } else {
      if (orders.some(o => o.orderId === orderId)) {
        showAlertModal('كود الطلب هذا موجود بالفعل', () => orderIdInput.focus());
        return;
      }
      orders.push(order);
    }

    saveOrders();
    renderOrders();
    renderDashboard();
    renderExpenses();
    orderForm.reset();
    if (orderBookSuggestions) {
      orderBookSuggestions.classList.add('hidden');
    }
    orderIdInput.value = getNextOrderId();
  });

  function copyOrderNotes() {
    const notes = orderNotesInput.value.trim();
    if (!notes) {
      showAlertModal('لا توجد ملاحظات لنسخها إلى الحافظة.');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(notes)
        .then(() => showAlertModal('تم نسخ الملاحظات إلى الحافظة بنجاح.'))
        .catch(() => showAlertModal('حدث خطأ أثناء النسخ إلى الحافظة. يرجى المحاولة مرة أخرى.'));
    } else {
      const temporaryTextarea = document.createElement('textarea');
      temporaryTextarea.value = notes;
      temporaryTextarea.style.position = 'fixed';
      temporaryTextarea.style.opacity = '0';
      document.body.appendChild(temporaryTextarea);
      temporaryTextarea.select();
      try {
        document.execCommand('copy');
        showAlertModal('تم نسخ الملاحظات إلى الحافظة بنجاح.');
      } catch (err) {
        showAlertModal('حدث خطأ أثناء النسخ إلى الحافظة. يرجى المحاولة مرة أخرى.');
      }
      document.body.removeChild(temporaryTextarea);
    }
  }

  function updateOrderBookSuggestions() {
    const query = getCurrentOrderDetailsQuery();
    if (!query) {
      orderBookSuggestions.innerHTML = '';
      orderBookSuggestions.classList.add('hidden');
      return;
    }

    const matchingBooks = books.filter(book =>
      book.name.toLowerCase().includes(query) ||
      book.publisher.toLowerCase().includes(query)
    ).slice(0, 8);

    if (matchingBooks.length === 0) {
      orderBookSuggestions.innerHTML = '<div class="suggestion-item">لا يوجد كتب مطابقة</div>';
      orderBookSuggestions.classList.remove('hidden');
      return;
    }

    orderBookSuggestions.innerHTML = matchingBooks.map(book =>
      `<div class="suggestion-item" data-name="${escapeHtml(book.name)}" data-publisher="${escapeHtml(book.publisher)}">
        <strong>${escapeHtml(book.name)}</strong>
        <span>${escapeHtml(book.publisher)}</span>
      </div>`
    ).join('');
    orderBookSuggestions.classList.remove('hidden');

    Array.from(orderBookSuggestions.children).forEach(item => {
      item.addEventListener('click', () => {
        addBookToOrderDetails(item.dataset.name, item.dataset.publisher);
      });
    });
  }

  function getCurrentOrderDetailsQuery() {
    const lines = orderDetailsInput.value.split('\n');
    return lines[lines.length - 1].trim().toLowerCase();
  }

  function addBookToOrderDetails(bookName, publisher) {
    const lines = orderDetailsInput.value.split('\n');
    const prefix = lines.slice(0, -1).join('\n');
    const line = `- ${bookName}${publisher ? ` (${publisher})` : ''}`;
    orderDetailsInput.value = prefix ? `${prefix}\n${line}` : line;
    orderBookSuggestions.classList.add('hidden');
    orderDetailsInput.focus();
  }

  function handleOrderBookNavigation(event) {
    if (!orderBookSuggestions || orderBookSuggestions.classList.contains('hidden')) {
      return;
    }

    const visibleItems = Array.from(orderBookSuggestions.querySelectorAll('.suggestion-item'));
    if (visibleItems.length === 0) {
      return;
    }

    const active = orderBookSuggestions.querySelector('.suggestion-item.active');
    let index = active ? visibleItems.indexOf(active) : -1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      index = index < visibleItems.length - 1 ? index + 1 : 0;
      setActiveSuggestion(visibleItems, index);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      index = index > 0 ? index - 1 : visibleItems.length - 1;
      setActiveSuggestion(visibleItems, index);
    } else if (event.key === 'Enter' && index >= 0) {
      event.preventDefault();
      const item = visibleItems[index];
      addBookToOrderDetails(item.dataset.name, item.dataset.publisher);
    }
  }

  function setActiveSuggestion(items, index) {
    items.forEach(item => item.classList.remove('active'));
    const current = items[index];
    if (current) {
      current.classList.add('active');
      current.scrollIntoView({ block: 'nearest' });
    }
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  expenseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const expense = {
      type: expenseTypeInput.value.trim(),
      amount: parseFloat(expenseAmountInput.value)
    };

    if (editExpenseIndex !== null) {
      expenses[editExpenseIndex] = expense;
      editExpenseIndex = null;
      expenseSubmitBtn.textContent = 'إضافة مصروف';
    } else {
      expenses.push(expense);
    }

    saveExpenses();
    renderExpenses();
    renderDashboard();
    expenseForm.reset();
  });

  offerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const description = offerDescriptionInput.value.trim();
    const duration = parseInt(offerDurationInput.value);
    const unit = offerUnitInput.value;
    const price = parseFloat(offerPriceInput.value);
    const selectedBookIds = Array.from(selectedOfferBookIds);

    if (!description) {
      showAlertModal('يرجى إدخال وصف العرض', () => offerDescriptionInput.focus());
      return;
    }

    if (!duration || duration < 1) {
      showAlertModal('يرجى إدخال مدة صحيحة', () => offerDurationInput.focus());
      return;
    }

    if (isNaN(price) || price < 0) {
      showAlertModal('يرجى إدخال سعر العرض الصحيح', () => offerPriceInput.focus());
      return;
    }

    if (selectedBookIds.length === 0) {
      showAlertModal('يرجى اختيار كتاب واحد على الأقل');
      return;
    }

    const offer = {
      description: description,
      duration: duration,
      unit: unit,
      price: price,
      books: selectedBookIds,
      active: true,
      createdAt: Date.now()
    };

    if (editOfferIndex !== null) {
      offers[editOfferIndex] = offer;
      editOfferIndex = null;
      offerSubmitBtn.textContent = 'إضافة عرض';
    } else {
      offers.push(offer);
    }

    saveOffers();
    renderOffers();
    offerForm.reset();
    selectedOfferBookIds.clear();
    bookSearchOffers.value = '';
    updateBooksChecklist();
    updateCalculatedProfit();
  });

  if (orderIdInput) {
    orderIdInput.value = getNextOrderId();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
  const activeSection = document.querySelector('.section.active');
  
  // Ctrl+A or Cmd+A for Select All in Books section
  if ((e.ctrlKey || e.metaKey) && e.key === 'a' && activeSection && activeSection.id === 'books') {
    e.preventDefault();
    selectAllBooks();
  }
  
  // Delete key to delete selected books
  if (e.key === 'Delete' && activeSection && activeSection.id === 'books' && selectedBooks.size > 0) {
    e.preventDefault();
    deleteSelectedBooks();
  }
  
  // Enter key to submit form when focus is on form inputs
  if (e.key === 'Enter' && (e.target === bookForm || bookForm.contains(e.target))) {
    if (e.target.tagName === 'TEXTAREA' && !e.ctrlKey && !e.metaKey) {
      // Allow Enter in textareas only with Ctrl/Cmd
      return;
    }
    e.preventDefault();
    bookForm.dispatchEvent(new Event('submit'));
  }
});

function renderBooks() {
  bookTable.innerHTML = '';

  const searchTerm = bookSearch.value.toLowerCase();
  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchTerm) || 
    book.publisher.toLowerCase().includes(searchTerm)
  );

  if (filteredBooks.length === 0) {
    bookTable.innerHTML = '<tr><td colspan="7">لم يتم العثور على كتب مطابقة.</td></tr>';
    return;
  }

  filteredBooks.forEach((book, index) => {
    const originalIndex = books.indexOf(book);
    const row = document.createElement('tr');
    const isSelected = selectedBooks.has(originalIndex);

    row.innerHTML = `
      <td><input type="checkbox" class="book-checkbox" data-index="${originalIndex}" ${isSelected ? 'checked' : ''} onchange="toggleBookSelection(${originalIndex})"></td>
      <td>${book.name}</td>
      <td>${book.publisher}</td>
      <td>${book.customerPrice.toFixed(2)}</td>
      <td>${book.myPrice.toFixed(2)}</td>
      <td>${book.quantity !== undefined ? book.quantity : 0}</td>
      <td>
        <button class="button-secondary button-small" type="button" onclick="editBook(${originalIndex})">تعديل</button>
        <button class="button-danger button-small" type="button" onclick="deleteBook(${originalIndex})">حذف</button>
      </td>
    `;

    bookTable.appendChild(row);
  });
}

function editBook(index) {
  const book = books[index];
  bookNameInput.value = book.name;
  publisherInput.value = book.publisher;
  customerPriceInput.value = book.customerPrice;
  myPriceInput.value = book.myPrice;
  bookQuantityInput.value = book.quantity !== undefined ? book.quantity : 0;
  editBookIndex = index;
  bookSubmitBtn.textContent = 'تحديث الكتاب';
  showSection('books');
}

function deleteBook(index) {
  showConfirmModal('هل أنت متأكد من حذف هذا الكتاب؟ هذه العملية لا يمكن التراجع عنها.', confirmed => {
    if (!confirmed) return;

    books.splice(index, 1);
    selectedBooks.delete(index);
    saveBooks();
    renderBooks();
    renderDashboard();
  });
}

function toggleBookSelection(index) {
  if (selectedBooks.has(index)) {
    selectedBooks.delete(index);
  } else {
    selectedBooks.add(index);
  }
  updateSelectAllCheckbox();
}

function selectAllBooks() {
  books.forEach((_, index) => selectedBooks.add(index));
  updateSelectAllCheckbox();
  renderBooks();
}

function toggleSelectAllBooks() {
  const bookSelectAll = document.getElementById('bookSelectAll');
  if (bookSelectAll && bookSelectAll.checked) {
    selectAllBooks();
  } else {
    selectedBooks.clear();
    renderBooks();
  }
}

function updateSelectAllCheckbox() {
  const bookSelectAll = document.getElementById('bookSelectAll');
  if (bookSelectAll) {
    bookSelectAll.checked = selectedBooks.size > 0 && selectedBooks.size === books.length;
  }
  renderBooks();
}

function deleteSelectedBooks() {
  if (selectedBooks.size === 0) {
    showAlertModal('يرجى تحديد الكتب المراد حذفها');
    return;
  }
  
  showConfirmModal(`هل أنت متأكد من حذف ${selectedBooks.size} كتاب؟`, confirmed => {
    if (!confirmed) return;

    // Sort indices in descending order to avoid shifting issues
    const indicesToDelete = Array.from(selectedBooks).sort((a, b) => b - a);
    indicesToDelete.forEach(index => books.splice(index, 1));
    
    selectedBooks.clear();
    saveBooks();
    renderBooks();
    renderDashboard();
  });
}

// Offers
function renderOffers() {
  offerTable.innerHTML = '';

  const searchTerm = offerSearch?.value.trim().toLowerCase() || '';
  const filteredOffers = offers.filter(offer => {
    const description = offer.description ? offer.description.toString().toLowerCase() : '';
    return description.includes(searchTerm);
  });

  if (filteredOffers.length === 0) {
    offerTable.innerHTML = '<tr><td colspan="7">لم يتم العثور على عروض مطابقة.</td></tr>';
    return;
  }

  filteredOffers.forEach((offer) => {
    const originalIndex = offers.indexOf(offer);
    const description = offer.description ? offer.description.toString() : '';
    const duration = offer.duration ? offer.duration.toString() : '';
    const unitText = offer.unit === 'hours' ? 'ساعة' : offer.unit === 'days' ? 'يوم' : '';
    const price = typeof offer.price === 'number' ? offer.price : parseFloat(offer.price) || 0;
    const offerBooks = Array.isArray(offer.books) ? offer.books : [];
    const profit = calculateOfferProfit(offer);
    const booksNames = offerBooks.map(id => books[id]?.name || 'كتاب محذوف').join(', ');
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${description}</td>
      <td>${duration} ${unitText}</td>
      <td>${booksNames}</td>
      <td>${price.toFixed(2)} جنيه</td>
      <td>${profit.toFixed(2)} جنيه</td>
      <td>
        <button class="button-secondary button-small" type="button" onclick="toggleOfferStatus(${originalIndex})">
          ${offer.active ? 'إيقاف' : 'تفعيل'}
        </button>
      </td>
      <td>
        <button class="button-secondary button-small" type="button" onclick="editOffer(${originalIndex})">تعديل</button>
        <button class="button-danger button-small" type="button" onclick="deleteOffer(${originalIndex})">حذف</button>
      </td>
    `;

    offerTable.appendChild(row);
  });

  updateBooksChecklist();
}

function calculateOfferProfit(offer) {
  const price = typeof offer.price === 'number' ? offer.price : 0;
  const cost = offer.books.reduce((total, bookId) => {
    const book = books[bookId];
    if (book) {
      return total + book.myPrice;
    }
    return total;
  }, 0);
  return price - cost;
}

function updateBooksChecklist(searchTerm = '') {
  booksChecklist.innerHTML = '';

  const filteredBooks = books.filter(book => 
    searchTerm === '' || 
    book.name.toLowerCase().includes(searchTerm) || 
    book.publisher.toLowerCase().includes(searchTerm)
  );

  if (filteredBooks.length === 0) {
    if (books.length === 0) {
      booksChecklist.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">لا توجد كتب متاحة للاختيار. أضف كتب أولاً في صفحة الكتب.</p>';
    } else {
      booksChecklist.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">لا توجد كتب مطابقة للبحث.</p>';
    }
    return;
  }

  filteredBooks.forEach((book) => {
    const originalIndex = books.indexOf(book);
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '10px';
    label.style.marginBottom = '8px';
    label.style.padding = '8px';
    label.style.borderRadius = '8px';
    label.style.cursor = 'pointer';
    label.style.transition = 'background-color 0.2s ease';
    label.style.border = '1px solid transparent';
    label.onmouseover = () => {
      label.style.backgroundColor = 'rgba(201,168,76,0.1)';
      label.style.borderColor = 'rgba(201,168,76,0.3)';
    };
    label.onmouseout = () => {
      label.style.backgroundColor = 'transparent';
      label.style.borderColor = 'transparent';
    };
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = originalIndex;
    checkbox.checked = selectedOfferBookIds.has(originalIndex);
    checkbox.style.marginLeft = '8px';
    checkbox.style.accentColor = 'var(--gold)';
    checkbox.addEventListener('change', function () {
      const bookId = parseInt(this.value);
      if (this.checked) {
        selectedOfferBookIds.add(bookId);
      } else {
        selectedOfferBookIds.delete(bookId);
      }
      updateCalculatedProfit();
    });
    const text = document.createTextNode(`${book.name} (${book.publisher}) - ربح: ${(book.customerPrice - book.myPrice).toFixed(2)} جنيه`);
    label.appendChild(checkbox);
    label.appendChild(text);
    booksChecklist.appendChild(label);
  });
}

function updateCalculatedProfit() {
  const price = parseFloat(offerPriceInput.value) || 0;
  const cost = Array.from(selectedOfferBookIds).reduce((total, bookId) => {
    const book = books[bookId];
    if (book) {
      return total + book.myPrice;
    }
    return total;
  }, 0);
  const revenue = Array.from(selectedOfferBookIds).reduce((total, bookId) => {
    const book = books[bookId];
    if (book) {
      return total + book.customerPrice;
    }
    return total;
  }, 0);
  const profit = price - cost;
  const discountAmount = Math.max(0, revenue - price);
  const discountPercent = revenue > 0 ? (discountAmount / revenue) * 100 : 0;

  calculatedProfit.textContent = `${profit.toFixed(2)} جنيه`;
  if (discountAmountElem) {
    discountAmountElem.textContent = `${discountAmount.toFixed(2)} جنيه`;
  }
  if (discountPercentElem) {
    discountPercentElem.textContent = `${discountPercent.toFixed(2)}%`;
  }
}

function editOffer(index) {
  const offer = offers[index];
  offerDescriptionInput.value = offer.description || '';
  offerDurationInput.value = offer.duration || '';
  offerUnitInput.value = offer.unit || 'hours';
  offerPriceInput.value = offer.price !== undefined ? offer.price : '';
  
  selectedOfferBookIds = new Set(Array.isArray(offer.books) ? offer.books : []);
  bookSearchOffers.value = '';
  updateBooksChecklist();
  updateCalculatedProfit();
  
  editOfferIndex = index;
  offerSubmitBtn.textContent = 'تحديث العرض';
  showSection('offers');
}

function deleteOffer(index) {
  showConfirmModal('هل أنت متأكد من حذف هذا العرض؟', confirmed => {
    if (!confirmed) return;

    offers.splice(index, 1);
    saveOffers();
    renderOffers();
  });
}

function toggleOfferStatus(index) {
  offers[index].active = !offers[index].active;
  saveOffers();
  renderOffers();
}

// Orders
function renderOrders() {
  orderTable.innerHTML = '';

  const searchTerm = orderSearch.value.toLowerCase();
  const selectedStatus = orderStatusFilter ? orderStatusFilter.value : 'الكل';
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm) ||
      (order.customerPhone || '').toLowerCase().includes(searchTerm);
    const matchesStatus = selectedStatus === 'الكل' || order.shippingStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (filteredOrders.length === 0) {
    orderTable.innerHTML = '<tr><td colspan="11">لم يتم العثور على طلبات مطابقة.</td></tr>';
    return;
  }

  filteredOrders.forEach((order, index) => {
    const originalIndex = orders.indexOf(order);
    const row = document.createElement('tr');
    const notes = order.notes ? order.notes : '-';

    row.innerHTML = `
      <td>${order.orderId || '-'}</td>
      <td>${order.customerName}</td>
      <td>${order.customerPhone || '-'}</td>
      <td>${order.customerAddress}</td>
      <td>${order.orderDetails}</td>
      <td>${notes}</td>
      <td>${order.paidAmount.toFixed(2)}</td>
      <td>${order.remainingAmount.toFixed(2)}</td>
      <td>${order.shippingCost.toFixed(2)}</td>
      <td><span class="status-badge" data-status="${order.shippingStatus}">${order.shippingStatus}</span></td>
      <td>
        <button class="button-secondary button-small" type="button" onclick="editOrder(${originalIndex})">تعديل</button>
        <button class="button-danger button-small" type="button" onclick="deleteOrder(${originalIndex})">حذف</button>
        <label class="collect-checkbox">
          <input type="checkbox" ${order.remainingAmount <= 0 ? 'checked' : ''} onclick="toggleCollectPayment(${originalIndex}, this)">
          تم التحصيل
        </label>
      </td>
    `;

    orderTable.appendChild(row);
  });
}

function showInvoiceType(type) {
  invoiceViewType = type;
  if (type === 'current') {
    currentInvoicesContainer.style.display = 'block';
    completedInvoicesContainer.style.display = 'none';
  } else {
    currentInvoicesContainer.style.display = 'none';
    completedInvoicesContainer.style.display = 'block';
  }
  renderInvoices();
}

function renderInvoices() {
  const searchTerm = invoiceSearch ? invoiceSearch.value.toLowerCase() : '';
  const currentInvoices = orders.filter(order => !order.collected && order.customerName.toLowerCase().includes(searchTerm));
  const completedInvoices = orders.filter(order => order.collected && order.customerName.toLowerCase().includes(searchTerm));

  currentInvoicesList.innerHTML = currentInvoices.length === 0 ? '<p>لا توجد فواتير حالية.</p>' : '';
  completedInvoicesList.innerHTML = completedInvoices.length === 0 ? '<p>لا توجد فواتير سابقة.</p>' : '';

  currentInvoices.forEach((invoice, index) => {
    currentInvoicesList.appendChild(createInvoiceCard(invoice, index, false));
  });

  completedInvoices.forEach((invoice, index) => {
    completedInvoicesList.appendChild(createInvoiceCard(invoice, index, true));
  });
}

function createInvoiceCard(invoice, index, completed) {
  const card = document.createElement('div');
  card.className = 'invoice-card';
  const statusClass = completed ? 'completed' : 'pending';
  const amountDue = invoice.remainingAmount.toFixed(2);
  card.innerHTML = `
    <div class="invoice-header">
      <div>
        <div class="invoice-customer">${invoice.customerName}</div>
        <div class="invoice-date">${new Date(invoice.createdAt || Date.now()).toLocaleString('ar-EG')}</div>
      </div>
      <span class="invoice-status ${statusClass}">${invoice.shippingStatus}</span>
    </div>
    <div class="invoice-details">
      <p>العنوان: ${invoice.customerAddress}</p>
      <p>سعر الشحن: ${invoice.shippingCost.toFixed(2)}</p>
      <p>المدفوع: ${invoice.paidAmount.toFixed(2)} | الباقي: ${amountDue}</p>
      <p>الإجمالي: ${invoice.totalAmount.toFixed(2)}</p>
    </div>
    <div class="invoice-total">عرض الفاتورة</div>
  `;
  card.addEventListener('click', () => openInvoiceModal(invoice));
  return card;
}

function openInvoiceModal(invoice) {
  const invoiceDate = new Date(invoice.createdAt || Date.now());
  const formattedDate = invoiceDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = invoiceDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const itemsHtml = invoice.orderDetails 
    ? invoice.orderDetails.split('\n').map(item => item.trim()).filter(Boolean)
        .map(item => `<div class="invoice-item"><span>${item}</span></div>`).join('')
    : '<div class="invoice-item"><span>لا يوجد تفاصيل للطلب.</span></div>';
  const invoiceNumber = invoice.orderId || invoice.invoiceId || `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  invoiceContent.innerHTML = `
    <div class="invoice-wrapper">
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="invoice-left">
            <div class="invoice-details">
              <p><span>رقم الفاتورة</span><span>:</span><span class="invoice-value">${invoiceNumber}</span></p>
              <p><span>التاريخ والوقت</span><span>:</span><span class="invoice-value">${formattedDate} - ${formattedTime}</span></p>
            </div>
          </div>
          <div class="invoice-right">
            <div class="invoice-brand">
              <h1>فاتورة</h1>
              <p>مكتبة الشيخان</p>
            </div>
          </div>
        </div>
        <div class="invoice-divider"></div>
        <div class="invoice-customer">
          <h2>معلومات العميل</h2>
          <div class="customer-info">
            <div>
              <p class="label">الاسم</p>
              <p class="value">${invoice.customerName}</p>
            </div>
            <div>
              <p class="label">الهاتف</p>
              <p class="value">${invoice.customerPhone || '-'}</p>
            </div>
            <div>
              <p class="label">العنوان</p>
              <p class="value">${invoice.customerAddress}</p>
            </div>
          </div>
        </div>
        <div class="invoice-order">
          <h2>تفاصيل الطلب</h2>
          <div class="invoice-items">
            ${itemsHtml}
          </div>
        </div>
        <div class="invoice-summary">
          <h2>ملخص المبلغ</h2>
          <div class="summary-items">
            <div class="summary-row">
              <span class="summary-label">سعر الطلب:</span>
              <span class="summary-value">${(invoice.totalAmount - invoice.shippingCost).toFixed(2)} جنيه</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">سعر الشحن:</span>
              <span class="summary-value">${invoice.shippingCost.toFixed(2)} جنيه</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">المبلغ المدفوع:</span>
              <span class="summary-value">${invoice.paidAmount.toFixed(2)} جنيه</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">الباقي:</span>
              <span class="summary-value">${invoice.remainingAmount.toFixed(2)} جنيه</span>
            </div>
            <div class="summary-total">
              <span class="summary-label">الإجمالي:</span>
              <span class="summary-value">${invoice.totalAmount.toFixed(2)} جنيه</span>
            </div>
          </div>
        </div>
        <div class="invoice-footer">
          <p>شكرا لطلبكم — مكتبة الشيخان</p>
        </div>
      </div>
    </div>
  `;
  invoiceModal.classList.remove('hidden');
  invoiceModal.setAttribute('aria-hidden', 'false');
}

function closeInvoiceModal() {
  invoiceModal.classList.add('hidden');
  invoiceModal.setAttribute('aria-hidden', 'true');
}

function printInvoice() {
  window.print();
}

function editOrder(index) {
  const order = orders[index];
  if (!order) return;

  orderIdInput.value = order.orderId || '';
  customerNameInput.value = order.customerName;
  customerPhoneInput.value = order.customerPhone || '';
  customerAddressInput.value = order.customerAddress;
  orderDetailsInput.value = order.orderDetails;
  orderNotesInput.value = order.notes || '';
  paidAmountInput.value = order.paidAmount;
  remainingAmountInput.value = order.remainingAmount;
  shippingCostInput.value = order.shippingCost;
  shippingStatusInput.value = order.shippingStatus;
  editOrderIndex = index;
  orderSubmitBtn.textContent = 'تحديث الطلب';
  showSection('orders');
  if (orderForm && typeof orderForm.scrollIntoView === 'function') {
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function deleteOrder(index) {
  showConfirmModal('هل تريد حذف هذا الطلب؟ سيؤدي ذلك إلى إزالته نهائيًا.', confirmed => {
    if (!confirmed) return;

    orders.splice(index, 1);
    saveOrders();
    renderOrders();
    renderDashboard();
    renderExpenses();
  });
}

function collectPayment(index) {
  const order = orders[index];
  if (!order || order.remainingAmount <= 0) return;

  order.paidAmount = parseFloat((order.paidAmount + order.remainingAmount).toFixed(2));
  order.remainingAmount = 0;
  saveOrders();
  renderOrders();
  renderDashboard();
}

function toggleCollectPayment(index, checkbox) {
  const isCollecting = checkbox.checked;
  const message = isCollecting
    ? 'تأكيد تحصيل المبلغ المتبقي لهذا الطلب؟'
    : 'هل تريد إلغاء وضع التحصيل وإرجاع المبلغ المتبقي؟';

  showConfirmModal(message, confirmed => {
    if (!confirmed) {
      checkbox.checked = !isCollecting;
      return;
    }

    setCollectionState(index, isCollecting);
  });
}

function setCollectionState(index, collect) {
  const order = orders[index];
  if (!order) return;

  if (!order.totalAmount) {
    order.totalAmount = parseFloat((order.paidAmount + order.remainingAmount).toFixed(2));
  }
  if (typeof order.initialPaidAmount !== 'number') {
    order.initialPaidAmount = order.paidAmount;
  }

  if (collect) {
    order.paidAmount = order.totalAmount;
    order.remainingAmount = 0;
  } else {
    order.paidAmount = order.initialPaidAmount;
    order.remainingAmount = parseFloat((order.totalAmount - order.paidAmount).toFixed(2));
  }

  order.collected = collect;
  saveOrders();
  renderOrders();
  renderDashboard();
  renderExpenses();
}

// Expenses
function savePurchaseList() {
  localStorage.setItem('purchaseList', JSON.stringify(purchaseList));
  saveSupabaseData();
}

function loadCompletedPurchaseList() {
  completedPurchaseList = JSON.parse(localStorage.getItem('completedPurchaseList')) || [];
}

function saveCompletedPurchaseList() {
  localStorage.setItem('completedPurchaseList', JSON.stringify(completedPurchaseList));
  saveSupabaseData();
}

function getBookPurchasePrice(name, publisher) {
  const normalize = value => (value || '').trim().toLowerCase();
  const targetName = normalize(name);
  const targetPublisher = normalize(publisher);
  const exactMatch = books.find(book => normalize(book.name) === targetName && normalize(book.publisher) === targetPublisher);
  if (exactMatch) return parseFloat(exactMatch.myPrice) || 0;
  const nameMatch = books.find(book => normalize(book.name) === targetName);
  return nameMatch ? parseFloat(nameMatch.myPrice) || 0 : 0;
}

function getTodayDateString() {
  return new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

function addCompletedPurchaseItem(key, name, publisher, quantity, price) {
  if (quantity <= 0) return;
  const existing = completedPurchaseList.find(item => item.key === key);
  if (existing) {
    existing.completedQuantity += quantity;
    existing.price = parseFloat(price.toFixed ? price.toFixed(2) : parseFloat(price) || 0);
    existing.totalCost = parseFloat((existing.completedQuantity * existing.price).toFixed(2));
    existing.dateCompleted = getTodayDateString();
  } else {
    completedPurchaseList.push({
      key,
      name,
      publisher,
      completedQuantity: quantity,
      price: parseFloat(price.toFixed ? price.toFixed(2) : parseFloat(price) || 0),
      totalCost: parseFloat((quantity * (price || 0)).toFixed(2)),
      dateCompleted: getTodayDateString()
    });
  }
  saveCompletedPurchaseList();
}

function parseOrderDetailsLine(line) {
  let cleaned = line.replace(/^[\-\*\•\s]+/, '').trim();
  let quantity = 1;

  const trailingQuantity = cleaned.match(/\s*(?:x|×|عدد|نسخة|قطعة)\s*[:\-]?\s*(\d+)\s*$/i);
  if (trailingQuantity) {
    quantity = parseInt(trailingQuantity[1], 10) || 1;
    cleaned = cleaned.slice(0, trailingQuantity.index).trim();
  } else {
    const leadingQuantity = cleaned.match(/^(\d+)\s*(?:x|×)?\s+(.+)$/i);
    if (leadingQuantity) {
      quantity = parseInt(leadingQuantity[1], 10) || 1;
      cleaned = leadingQuantity[2].trim();
    }
  }

  const parenMatch = cleaned.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    return { name: parenMatch[1].trim(), publisher: parenMatch[2].trim(), quantity };
  }

  const sepMatch = cleaned.split(/\s*[\-–—]\s*/);
  if (sepMatch.length >= 2) {
    return { name: sepMatch[0].trim(), publisher: sepMatch.slice(1).join(' - ').trim(), quantity };
  }

  return { name: cleaned, publisher: '', quantity };
}

function syncPurchaseItems() {
  loadCompletedPurchaseList();
  const completedMap = new Map(completedPurchaseList.map(item => [item.key, item]));
  const aggregated = new Map();
  const fulfilledCounts = new Map();

  orders.forEach(order => {
    if (!order.orderDetails) return;
    const isFulfilled = order.shippingStatus === 'تم الشحن' || order.shippingStatus === 'تم التسليم';
    order.orderDetails.split('\n').map(line => line.trim()).filter(Boolean).forEach(line => {
      const { name, publisher, quantity } = parseOrderDetailsLine(line);
      if (!name || quantity <= 0) return;
      const key = `${name}||${publisher}`;
      const price = getBookPurchasePrice(name, publisher);
      const item = aggregated.get(key) || { key, name, publisher, total: 0, pending: 0, price };
      item.total += quantity;
      if (!isFulfilled && order.shippingStatus !== 'ملغي') {
        item.pending += quantity;
      }
      aggregated.set(key, item);
      if (isFulfilled && order.shippingStatus !== 'ملغي') {
        fulfilledCounts.set(key, (fulfilledCounts.get(key) || 0) + quantity);
      }
    });
  });

  // Auto archive shipped/delivered books into completed history
  fulfilledCounts.forEach((quantity, key) => {
    const completed = completedMap.get(key);
    const [name, publisher] = key.split('||');
    const price = aggregated.has(key) ? aggregated.get(key).price : getBookPurchasePrice(name, publisher);
    const alreadyCompleted = completed ? completed.completedQuantity : 0;
    if (quantity > alreadyCompleted) {
      addCompletedPurchaseItem(key, name, publisher, quantity - alreadyCompleted, price);
      completedMap.set(key, completedPurchaseList.find(item => item.key === key));
    }
  });

  purchaseList = Array.from(aggregated.values()).map(item => {
    const completed = completedMap.get(item.key);
    const remaining = Math.max(0, item.pending - (completed ? completed.completedQuantity : 0));
    return {
      ...item,
      pending: remaining,
      price: item.price
    };
  }).filter(item => item.pending > 0)
    .sort((a, b) => a.pending - b.pending || a.name.localeCompare(b.name, 'ar-EG'));

  savePurchaseList();
}

function renderPurchaseList() {
  if (!purchaseListContainer || !pendingPurchaseCostElem || !pendingPurchaseCountElem) return;
  purchaseListContainer.innerHTML = '';

  if (purchaseList.length === 0) {
    purchaseListContainer.innerHTML = '<p class="empty-state">لا توجد مشتريات حالياً.</p>';
    pendingPurchaseCostElem.textContent = '0.00';
    pendingPurchaseCountElem.textContent = '0';
    renderCompletedPurchaseList();
    return;
  }

  let totalCost = 0;
  let totalCount = 0;

  purchaseList.forEach((item, index) => {
    const itemTotal = parseFloat((item.price || 0) * item.pending).toFixed(2);
    totalCost += parseFloat(itemTotal);
    totalCount += item.pending;
    const itemRow = document.createElement('div');
    itemRow.className = 'purchase-item';
    itemRow.innerHTML = `
      <label class="purchase-checkbox">
        <input type="checkbox" onchange="togglePurchaseItem(${index}, this)">
        <div>
          <span class="purchase-label">${item.name}${item.publisher ? ' — ' + item.publisher : ''}</span>
          <div class="purchase-small">سعر الشراء: ${item.price.toFixed(2)} جنيه | إجمالي: ${itemTotal} جنيه</div>
        </div>
      </label>
      <div class="purchase-meta">${item.pending > 1 ? item.pending + ' نسخة' : item.pending === 1 ? 'نسخة واحدة' : 'مكتملة'}</div>
    `;
    purchaseListContainer.appendChild(itemRow);
  });

  pendingPurchaseCostElem.textContent = totalCost.toFixed(2);
  pendingPurchaseCountElem.textContent = totalCount;
  renderCompletedPurchaseList();
}

function renderCompletedPurchaseList() {
  if (!completedPurchaseListContainer) return;
  completedPurchaseListContainer.innerHTML = '';

  if (completedPurchaseList.length === 0) {
    completedPurchaseListContainer.innerHTML = '<p class="empty-state">لا توجد مشتريات منتهية بعد.</p>';
    return;
  }

  const sortedCompleted = completedPurchaseList
    .map((item, index) => ({ item, index }))
    .sort((a, b) => new Date(b.item.dateCompleted) - new Date(a.item.dateCompleted));

  sortedCompleted.forEach(({ item, index }) => {
    const itemRow = document.createElement('div');
    itemRow.className = 'purchase-item';
    itemRow.innerHTML = `
      <div>
        <span class="purchase-label">${item.name}${item.publisher ? ' — ' + item.publisher : ''}</span>
        <div class="purchase-small">${item.completedQuantity > 1 ? item.completedQuantity + ' نسخة' : 'نسخة واحدة'} • سعر الوحدة: ${item.price.toFixed(2)} جنيه • الإجمالي: ${item.totalCost.toFixed(2)} جنيه</div>
      </div>
      <div class="purchase-meta">
        <div>${item.dateCompleted}</div>
        <button type="button" class="button-secondary button-small" onclick="unarchivePurchaseItem(${index})">إعادة</button>
      </div>
    `;
    completedPurchaseListContainer.appendChild(itemRow);
  });
}

function togglePurchaseItem(index, checkbox) {
  if (!purchaseList[index]) return;
  const item = purchaseList[index];
  const price = item.price || getBookPurchasePrice(item.name, item.publisher);
  addCompletedPurchaseItem(item.key, item.name, item.publisher, item.pending, price);
  syncPurchaseItems();
  renderPurchaseList();
}

function unarchivePurchaseItem(index) {
  if (!completedPurchaseList[index]) return;
  completedPurchaseList.splice(index, 1);
  saveCompletedPurchaseList();
  syncPurchaseItems();
  renderPurchaseList();
}

function renderExpenses() {
  expenseTable.innerHTML = '';

  if (expenses.length === 0) {
    expenseTable.innerHTML = '<tr><td colspan="3">لم يتم إضافة مصروفات بعد.</td></tr>';
  } else {
    expenses.forEach((expense, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td data-label="نوع المصروف">${expense.type}</td>
        <td data-label="المبلغ">${expense.amount.toFixed(2)}</td>
        <td data-label="إجراءات">
          <button class="button-secondary button-small" type="button" onclick="editExpense(${index})">تعديل</button>
          <button class="button-danger button-small" type="button" onclick="deleteExpense(${index})">حذف</button>
        </td>
      `;
      expenseTable.appendChild(row);
    });
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCollected = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const profit = parseFloat((totalCollected - totalExpenses).toFixed(2));
  const profitPercent = totalCollected > 0 ? parseFloat(((profit / totalCollected) * 100).toFixed(1)) : 0;

  document.getElementById('expenseTotal').textContent = totalExpenses.toFixed(2);
  document.getElementById('expensePaid').textContent = totalCollected.toFixed(2);
  document.getElementById('expenseProfit').textContent = profit.toFixed(2);
  document.getElementById('expenseProfitPercent').textContent = `${profitPercent}%`;

  document.getElementById('dashboardExpenseTotal').textContent = totalExpenses.toFixed(2);
  document.getElementById('dashboardProfitValue').textContent = profit.toFixed(2);
  document.getElementById('dashboardProfitPercent').textContent = `${profitPercent}%`;
}

function editExpense(index) {
  const expense = expenses[index];
  expenseTypeInput.value = expense.type;
  expenseAmountInput.value = expense.amount;
  editExpenseIndex = index;
  expenseSubmitBtn.textContent = 'تحديث المصروف';
  showSection('expenses');
}

function deleteExpense(index) {
  showConfirmModal('هل تريد حذف هذا المصروف؟ هذه العملية لا يمكن التراجع عنها.', confirmed => {
    if (!confirmed) return;

    expenses.splice(index, 1);
    saveExpenses();
    renderExpenses();
    renderDashboard();
  });
}

function renderDashboard() {
  const totalCollected = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = parseFloat((totalCollected - totalExpenses).toFixed(2));
  const profitPercent = totalCollected > 0 ? parseFloat(((profit / totalCollected) * 100).toFixed(1)) : 0;

  document.getElementById('salesCount').textContent = orders.length;
  document.getElementById('booksCount').textContent = books.length;
  document.getElementById('totalPaid').textContent = totalCollected.toFixed(2);
  document.getElementById('totalRemaining').textContent = orders.reduce((sum, order) => sum + order.remainingAmount, 0).toFixed(2);
  document.getElementById('dashboardExpenseTotal').textContent = totalExpenses.toFixed(2);
  document.getElementById('dashboardProfitValue').textContent = profit.toFixed(2);
  document.getElementById('dashboardProfitPercent').textContent = `${profitPercent}%`;
  document.getElementById('activeOffersCount').textContent = offers.filter(offer => offer.active).length;
  renderActiveOffersList();
  renderCharts();
}

function renderActiveOffersList() {
  if (!activeOffersContainer) return;
  const activeOffers = offers.filter(offer => offer.active);
  if (activeOffers.length === 0) {
    activeOffersContainer.innerHTML = '<div class="empty-state">لا توجد عروض نشطة حالياً.</div>';
    return;
  }

  activeOffersContainer.innerHTML = activeOffers.map(offer => {
    const offerBooks = Array.isArray(offer.books) ? offer.books : [];
    const booksNames = offerBooks.map(id => books[id]?.name || 'كتاب محذوف').join(', ');
    const profit = calculateOfferProfit(offer);
    const revenue = typeof offer.price === 'number' ? offer.price : parseFloat(offer.price) || 0;
    const cost = offerBooks.reduce((total, bookId) => {
      const book = books[bookId];
      return book ? total + book.myPrice : total;
    }, 0);
    const totalCustomerValue = offerBooks.reduce((total, bookId) => {
      const book = books[bookId];
      return book ? total + book.customerPrice : total;
    }, 0);
    const discountAmount = Math.max(0, totalCustomerValue - revenue);
    const discountPercent = totalCustomerValue > 0 ? (discountAmount / totalCustomerValue) * 100 : 0;

    return `
      <div class="active-offer-card">
        <div class="active-offer-title">${offer.description}</div>
        <div class="active-offer-details">
          <span>سعر العرض: ${revenue.toFixed(2)} جنيه</span>
          <span>الربح: ${profit.toFixed(2)} جنيه</span>
          <span>الخصم: ${discountAmount.toFixed(2)} جنيه (${discountPercent.toFixed(1)}%)</span>
        </div>
        <div class="active-offer-books">الكتب: ${booksNames}</div>
      </div>`;
  }).join('');
}

function exportData() {
  const data = {
    books: books,
    orders: orders,
    expenses: expenses,
    offers: offers,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `book-library-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showAlertModal('✅ تم تصدير البيانات بنجاح');
}

function importData() {
  const fileInput = document.getElementById('importFile');
  fileInput.click();

  fileInput.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);

        // Validate data structure
        if (!data.books || !Array.isArray(data.books) ||
            !data.orders || !Array.isArray(data.orders) ||
            !data.expenses || !Array.isArray(data.expenses) ||
            !data.offers || !Array.isArray(data.offers)) {
          throw new Error('Invalid data format');
        }

        showConfirmModal(
          'هل أنت متأكد من استيراد البيانات؟ سيتم استبدال جميع البيانات الحالية.',
          confirmed => {
            if (confirmed) {
              // Replace data
              books.splice(0, books.length, ...data.books);
              orders.splice(0, orders.length, ...data.orders);
              expenses.splice(0, expenses.length, ...data.expenses);
              offers.splice(0, offers.length, ...data.offers);

              // Save to localStorage
              saveBooks();
              saveOrders();
              saveExpenses();
              saveOffers();

              // Refresh UI
              renderBooks();
              renderOrders();
              renderExpenses();
              renderOffers();
              renderDashboard();

              showAlertModal('✅ تم استيراد البيانات بنجاح');
            }
          }
        );
      } catch (error) {
        showAlertModal('❌ خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
      }
    };
    reader.readAsText(file);
  };
}

window.editBook = editBook;
window.deleteBook = deleteBook;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.editOffer = editOffer;
window.deleteOffer = deleteOffer;
window.toggleOfferStatus = toggleOfferStatus;
window.updateCalculatedProfit = updateCalculatedProfit;

// Book selection functions
window.selectAllBooks = selectAllBooks;
window.toggleSelectAllBooks = toggleSelectAllBooks;
window.toggleBookSelection = toggleBookSelection;
window.deleteSelectedBooks = deleteSelectedBooks;

function handleStatusChange() {
  const status = shippingStatusInput.value;
  if (status === 'ملغي') {
    remainingAmountInput.value = 0;
  }
}

window.handleStatusChange = handleStatusChange;

// Export functions
async function exportBooks() {
  const data = books.map(book => ({
    'اسم الكتاب': book.name,
    'دار النشر': book.publisher,
    'سعر العميل': book.customerPrice,
    'سعري': book.myPrice,
    'الكمية': book.quantity || 0
  }));
  
  if (data.length === 0) {
    showAlertModal('❌ لا توجد كتب للتصدير');
    return;
  }
  
  const result = await window.electronAPI.exportToExcel(null, 'books.xlsx');
  if (result) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الكتب');
    XLSX.writeFile(wb, result);
    showAlertModal('✅ تم تصدير الكتب بنجاح\n\nملاحظة: عند الاستيراد، تأكد من أن رؤوس الأعمدة كما يلي:\n• اسم الكتاب\n• دار النشر\n• سعر العميل\n• سعري\n• الكمية');
  }
}

async function exportOrders() {
  const data = orders.map(order => ({
    'كود الطلب': order.orderId,
    'اسم العميل': order.customerName,
    'رقم التليفون': order.customerPhone || '',
    'العنوان': order.customerAddress,
    'تفاصيل الطلب': order.orderDetails,
    'ملاحظات': order.notes || '',
    'المبلغ المدفوع': order.paidAmount,
    'المبلغ الباقي': order.remainingAmount,
    'سعر الشحن': order.shippingCost,
    'الإجمالي': order.totalAmount,
    'حالة الشحن': order.shippingStatus,
    'تاريخ الإنشاء': order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : ''
  }));
  
  if (data.length === 0) {
    showAlertModal('❌ لا توجد طلبات للتصدير');
    return;
  }
  
  const result = await window.electronAPI.exportToExcel(null, 'orders.xlsx');
  if (result) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الطلبات');
    XLSX.writeFile(wb, result);
    showAlertModal('✅ تم تصدير الطلبات بنجاح');
  }
}

async function exportOffers() {
  const data = offers.map(offer => {
    const offerBooks = Array.isArray(offer.books) ? offer.books : [];
    const booksNames = offerBooks.map(id => books[id]?.name || 'كتاب محذوف').join(', ');
    const totalCustomerValue = offerBooks.reduce((total, bookId) => {
      const book = books[bookId];
      return book ? total + book.customerPrice : total;
    }, 0);
    const price = typeof offer.price === 'number' ? offer.price : parseFloat(offer.price) || 0;
    const discountAmount = Math.max(0, totalCustomerValue - price);
    const discountPercent = totalCustomerValue > 0 ? ((discountAmount / totalCustomerValue) * 100).toFixed(2) + '%' : '0%';

    return {
      'وصف العرض': offer.description || '',
      'المدة': offer.duration || '',
      'الوحدة': offer.unit === 'hours' ? 'ساعة' : offer.unit === 'days' ? 'يوم' : offer.unit || '',
      'سعر العرض': price,
      'الكتب': booksNames,
      'حالة العرض': offer.active ? 'نشط' : 'متوقف',
      'الربح الصافي': calculateOfferProfit(offer).toFixed(2),
      'المبلغ الموفر للعميل': discountAmount.toFixed(2),
      'نسبة الخصم': discountPercent,
      'تاريخ الإنشاء': offer.createdAt ? new Date(offer.createdAt).toLocaleString('ar-EG') : ''
    };
  });

  if (data.length === 0) {
    showAlertModal('❌ لا توجد عروض للتصدير');
    return;
  }

  const result = await window.electronAPI.exportToExcel(null, 'offers.xlsx');
  if (result) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'العروض');
    XLSX.writeFile(wb, result);
    showAlertModal('✅ تم تصدير العروض بنجاح');
  }
}

async function exportStatistics() {
  // حساب الإحصائيات العامة
  const totalOrders = orders.length;
  const totalBooks = books.length;
  const totalCollected = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const totalRemaining = orders.reduce((sum, order) => sum + order.remainingAmount, 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalCollected - totalExpenses;
  const profitMargin = totalCollected > 0 ? (netProfit / totalCollected) * 100 : 0;

  // إحصائيات الطلبات حسب الحالة
  const ordersByStatus = {};
  orders.forEach(order => {
    ordersByStatus[order.shippingStatus] = (ordersByStatus[order.shippingStatus] || 0) + 1;
  });

  // إحصائيات المصروفات حسب النوع
  const expensesByType = {};
  expenses.forEach(expense => {
    expensesByType[expense.type] = (expensesByType[expense.type] || 0) + expense.amount;
  });

  // إنشاء بيانات الإحصائيات العامة
  const generalStats = [{
    'المؤشر': 'عدد الطلبات',
    'القيمة': totalOrders,
    'الوحدة': 'طلب'
  }, {
    'المؤشر': 'عدد الكتب',
    'القيمة': totalBooks,
    'الوحدة': 'كتاب'
  }, {
    'المؤشر': 'إجمالي الإيرادات',
    'القيمة': totalRevenue.toFixed(2),
    'الوحدة': 'جنيه'
  }, {
    'المؤشر': 'إجمالي المدفوعات',
    'القيمة': totalCollected.toFixed(2),
    'الوحدة': 'جنيه'
  }, {
    'المؤشر': 'إجمالي المتبقي',
    'القيمة': totalRemaining.toFixed(2),
    'الوحدة': 'جنيه'
  }, {
    'المؤشر': 'إجمالي المصروفات',
    'القيمة': totalExpenses.toFixed(2),
    'الوحدة': 'جنيه'
  }, {
    'المؤشر': 'صافي الربح',
    'القيمة': netProfit.toFixed(2),
    'الوحدة': 'جنيه'
  }, {
    'المؤشر': 'هامش الربح',
    'القيمة': profitMargin.toFixed(1),
    'الوحدة': '%'
  }];

  // إنشاء بيانات إحصائيات الطلبات حسب الحالة
  const statusStats = Object.entries(ordersByStatus).map(([status, count]) => ({
    'حالة الطلب': status,
    'عدد الطلبات': count,
    'النسبة المئوية': ((count / totalOrders) * 100).toFixed(1) + '%'
  }));

  // إنشاء بيانات إحصائيات المصروفات حسب النوع
  const expenseStats = Object.entries(expensesByType).map(([type, amount]) => ({
    'نوع المصروف': type,
    'المبلغ': amount.toFixed(2),
    'النسبة من إجمالي المصروفات': totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) + '%' : '0%'
  }));

  // إنشاء ملف Excel مع أوراق متعددة
  const wb = XLSX.utils.book_new();
  
  // إضافة ورقة الإحصائيات العامة
  const wsGeneral = XLSX.utils.json_to_sheet(generalStats);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'الإحصائيات العامة');
  
  // إضافة ورقة إحصائيات الطلبات
  const wsStatus = XLSX.utils.json_to_sheet(statusStats);
  XLSX.utils.book_append_sheet(wb, wsStatus, 'إحصائيات الطلبات');
  
  // إضافة ورقة إحصائيات المصروفات
  const wsExpenses = XLSX.utils.json_to_sheet(expenseStats);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'إحصائيات المصروفات');
  
  // حفظ الملف
  const result = await window.electronAPI.exportToExcel(null, 'statistics.xlsx');
  if (result) {
    XLSX.writeFile(wb, result);
    showAlertModal('✅ تم تصدير الإحصائيات بنجاح');
  }
}

async function importBooks() {
  const data = await window.electronAPI.importFromExcel();
  if (data && data.length > 0) {
    data.forEach(row => {
      // تنظيف المفاتيح بإزالة المسافات الزائدة
      const cleanRow = {};
      Object.keys(row).forEach(key => {
        cleanRow[key.trim()] = row[key];
      });

      // محاولة العثور على الأعمدة الصحيحة بمرونة أكبر
      const name = cleanRow['اسم الكتاب'] || cleanRow['اسم'] || '';
      const publisher = cleanRow['دار النشر'] || cleanRow['دار'] || cleanRow['الناشر'] || '';
      const customerPrice = cleanRow['سعر العميل'] || cleanRow['سعر البيع'] || cleanRow['السعر'] || 0;
      const myPrice = cleanRow['سعري'] || cleanRow['سعر التكلفة'] || cleanRow['التكلفة'] || 0;
      const quantity = cleanRow['الكمية'] || cleanRow['الكم'] || 0;

      const book = {
        name: name.toString().trim(),
        publisher: publisher.toString().trim(),
        customerPrice: parseFloat(customerPrice) || 0,
        myPrice: parseFloat(myPrice) || 0,
        quantity: parseInt(quantity) || 0
      };

      if (book.name.trim()) {
        books.push(book);
      }
    });
    
    if (books.length > 0) {
      saveBooks();
      renderBooks();
      renderDashboard();
      showAlertModal('✅ تم استيراد ' + data.length + ' كتب بنجاح');
    } else {
      showAlertModal('❌ لم يتم العثور على بيانات صحيحة في الملف');
    }
  } else {
    showAlertModal('❌ الملف فارغ أو لم يتم اختيار ملف');
  }
}

window.exportBooks = exportBooks;
window.exportOrders = exportOrders;
window.exportStatistics = exportStatistics;
window.importBooks = importBooks;
window.exportData = exportData;
window.importData = importData;

// Chart variables
let monthlyOrdersChart;
let weeklyOrdersChart;
let salesStatsChart;

// Function to get monthly orders data
function getMonthlyOrdersData() {
  const monthlyData = {};
  const currentDate = new Date();

  // Initialize last 6 months only (to avoid too long chart)
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = 0;
  }

  // Count orders per month
  orders.forEach(order => {
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key]++;
      }
    }
  });

  const labels = Object.keys(monthlyData).map(key => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ar-EG', { month: 'short' });
  });

  return {
    labels,
    data: Object.values(monthlyData)
  };
}

// Function to get weekly orders data
function getWeeklyOrdersData() {
  const weeklyData = {};
  const currentDate = new Date();

  // Initialize last 8 weeks only (to avoid too long chart)
  for (let i = 7; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - (i * 7));
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const key = weekStart.toISOString().split('T')[0];
    weeklyData[key] = 0;
  }

  // Count orders per week
  orders.forEach(order => {
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (weeklyData.hasOwnProperty(key)) {
        weeklyData[key]++;
      }
    }
  });

  const labels = Object.keys(weeklyData).map(key => {
    const date = new Date(key);
    const weekNumber = Math.ceil(date.getDate() / 7);
    return `الأسبوع ${weekNumber}`;
  });

  return {
    labels,
    data: Object.values(weeklyData)
  };
}

// Function to get sales statistics data
function getSalesStatsData() {
  const statusCounts = {
    'تحت التجهيز': 0,
    'تم الشحن': 0,
    'تم التسليم': 0,
    'ملغي': 0,
    'معاد': 0
  };

  orders.forEach(order => {
    if (statusCounts.hasOwnProperty(order.shippingStatus)) {
      statusCounts[order.shippingStatus]++;
    }
  });

  return {
    labels: Object.keys(statusCounts),
    data: Object.values(statusCounts)
  };
}

// Function to create/update charts
function renderCharts() {
  try {
    // Monthly Orders Chart
    const monthlyData = getMonthlyOrdersData();
    const monthlyCtx = document.getElementById('monthlyOrdersChart');
    if (monthlyCtx) {
      if (monthlyOrdersChart) {
        monthlyOrdersChart.destroy();
      }
      monthlyOrdersChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
          labels: monthlyData.labels,
          datasets: [{
            label: 'عدد الطلبات',
            data: monthlyData.data,
            borderColor: 'rgba(201, 168, 76, 0.7)',
            backgroundColor: 'rgba(201, 168, 76, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 4.5,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
                font: {
                  size: 10
                }
              }
            },
            x: {
              ticks: {
                maxTicksLimit: 6,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      });
    }

    // Weekly Orders Chart
    const weeklyData = getWeeklyOrdersData();
    const weeklyCtx = document.getElementById('weeklyOrdersChart');
    if (weeklyCtx) {
      if (weeklyOrdersChart) {
        weeklyOrdersChart.destroy();
      }
      weeklyOrdersChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: weeklyData.labels,
          datasets: [{
            label: 'عدد الطلبات',
            data: weeklyData.data,
            backgroundColor: '#c9a84c',
            borderColor: '#6b6356',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 4.5,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
                font: {
                  size: 10
                }
              }
            },
            x: {
              ticks: {
                maxTicksLimit: 8,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      });
    }

    // Sales Statistics Chart
    const salesData = getSalesStatsData();
    const salesCtx = document.getElementById('salesStatsChart');
    if (salesCtx) {
      if (salesStatsChart) {
        salesStatsChart.destroy();
      }
      salesStatsChart = new Chart(salesCtx, {
        type: 'doughnut',
        data: {
          labels: salesData.labels,
          datasets: [{
            data: salesData.data,
            backgroundColor: [
              '#4ecdc4',
              '#1a6b6b',
              '#c9a84c',
              '#ff6b6b',
              '#6b6356'
            ],
            borderWidth: 2,
            borderColor: 'var(--ink)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 4.5,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 10,
                usePointStyle: true,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error rendering charts:', error);
    // Fallback: hide charts if there's an error
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => chart.style.display = 'none');
  }
}

showSection('dashboard');
renderExpenses();
renderDashboard();
renderCharts();