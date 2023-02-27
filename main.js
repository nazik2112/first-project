//? json-server -w db.json -p 8000   zapusk db - terminal

//? eto API dlya zaprosov
const API = "http://localhost:8000/products";
//? blok kuda  my dobav kartochki
const list = document.querySelector("#products-list");
//? forma s inputami dlya vvoda dannyh

const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");
//?input dlya poiska
const searchInput = document.querySelector("#search");
//peremennaya po kotoroi delaem zapros na poisk
let searchVal = "";

//? inp i knopki iz  modalki
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");
const editImageInp = document.querySelector("#edit-image");
const editSaveBtn = document.querySelector("#btn-save-edit");

//? to gde otobrajaem knopki dlya paginacii
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
//? maksimalnoe kolichestvo productov na odnoi stranice
const limit = 3;
// tekushaya stranica
let currentPage = 1;
//?maksimalnayoe kol-vo stranic
let pageTotalCount = 1;

//? pervonachalnoe otobrajenie dannyh
getProducts();

//? styagivaem dannye s servera
async function getProducts() {
  // title_like dlya poiska po kluchu title
  // q - dlya poiska po vsem klucham
  // _limit -  chtoby ukazat maks kol-vo elementov na odnoi stranice
  // _page  - poluch dannye na opredelennoi stranice
  const res =
    await fetch(`${API}?title_like=${searchVal}&_limit=${limit}&_page=$
  {currentPage}`);
  // x-total-count   -- obshee kol-vo productov
  const count = res.headers.get("x-total-count");
  // formula chtoby vyschitat maksimalnye kol-vo stranic
  pageTotalCount = Math.ceil(count / limit);

  const data = await res.json(); //? Rasshrivrovka dannyh
  //? otobrajaem aktualnye dannye
  render(data);
}
//? funkciya dlya dobavleniya db json
async function addProducts(products) {
  await fetch(API, {
    //? await dlya togo chtoby  func getProducts podojdala poka dannye dobavyatsya
    method: "POST",
    body: JSON.stringify(products),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts(); // styanut i otobrazit aktualnye dannye
}
//?func dlya udaleniya db.json
async function deleteProduct(id) {
  // await dlya togo chtoby getProduct podojdal
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  getProducts();
}

//? func dlya polucheniya odnogo producta
async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json(); //rasshivrovka dannyh
  return data; //? vozv product s db.json
}

//? func dlya izm dannyh
async function editProduct(id, editProduct) {
  console.log(id);
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}
//? otobrajaem na stranice
function render(arr) {
  //? ochiwaem chtoby kartochki ne dublirovalis
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `
       <div class="card m-5" style="width: 18rem;">
       <img src="${item.image}" class="card-img-top" alt="...">
       <div class="card-body">
         <h5 class="card-title">${item.title}</h5>
         <p class="card-text">${item.description.slice(0, 70)}...</p>
         <p class="card-text">$ ${item.price}</p>
         <button id ="${
           item.id
         }" class="btn btn-danger btn-delete ">delete</button>
         <button data-bs-toggle="modal" data-bs-target ="#exampleModal" id="${
           item.id
         }" class="btn btn-dark btn-edit">EDIT</button>
       </div>
     </div>
       `;
  });
  renderPagination();
}
//? obrabotchik sobytiya dlya dobavleniya(Create)
addForm.addEventListener("submit", (e) => {
  //? chtoby stranica ne perezagrujalas
  console.log("fdss");
  if (
    //? proverka na zapolnennost polei
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Zapolnite vse polya");
    return;
  }
  //? sozdaem ob'ekt dlya dobav v db.json
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };
  console.log(product);
  //? otprav obj v db.json
  addProducts(product);

  //? ochishaem inputy
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});
 //? obrabotchik sobytiya dlya udaleniya  (DELETE)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id);
  }
});

// peremennya dlya sohraneniya id producta na kotoryi my njali
let id = null;
//? obrabotchik sobytiya na otkritie izapolneniya modalki
document.addEventListener("click", async (e) => {
  console.log(e.target.classList);
  if (e.target.classList.contains("btn-edit")) {
    //? sohr id producta
    id = e.target.id;
    //? poluchaem obj produkta na kotoryi my najali
    //? postavili await potomu chto getOneProduct assinhronnaya producciya
    const product = await getOneProduct(e.target.id);
    console.log(product);

    //? zapolnyaem inputy dannymi producta
    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

//? obrabotchik sobytiya na sphranenie dannyh
editSaveBtn.addEventListener("click", () => {
  //? proverka na pustotu inputov
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("zapolnite vse polya");
    //? esli hotya by odin inp pustoi, vyvodim preduprejdenie i ostanavlivaem
    return;
  }

  //? sobiraem izmenennyi obj dlya izmeneniya producta
  const editedProduct = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };

  //? vyzyvaem func dlya  izmemeniya
  editProduct(id, editedProduct);
});

//? obrabotchik sobytiya dlyaa  poiska
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  getProducts();
});

//? funk dlya otobrajeniya knopok dlya paginacii
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `<li class="page-item ${
      currentPage == i ? "active" : ""
    }">
      <button class="page-link page_number">${i}</button>
    </li>`;
  }

  //? chtoby knopka prev byla ne aktivna na pervoi stranice
  if (currentPage == 1) {
    prev.classList.add("siabled");
  } else {
    prev.classList.remove("disabled");
  }
  //? chtoby knopka next byla ne aktivna na pervoi stranice
  if (currentPage == pageTotalCount) {
    next.classList.add("disabled");
  }
}

//? obrabotchik sobytiya chtoby pereiti na opred  stranicu
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getProducts();
  }
});

//? obrabotchik sobytiya chtoby pereiti na sled stranicu
next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getProducts();
});

//? obrabotchik sobytiya chtoby pereiti na  stranicu
prev.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});
