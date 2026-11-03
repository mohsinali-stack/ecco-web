// =====================================
// SALEZONE SHOPPING WEBSITE
// =====================================

const CART_KEY = "saleZoneCart";


// =====================================
// GET CART DATA
// =====================================

function getCart() {

    return JSON.parse(localStorage.getItem(CART_KEY)) || [];

}


// =====================================
// SAVE CART DATA
// =====================================

function saveCart(cart) {

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    updateCartCount();

}


// =====================================
// UPDATE CART COUNT
// =====================================

function updateCartCount() {

    let cart = getCart();

    let total = cart.reduce((sum, item) => {

        return sum + item.quantity;

    }, 0);

    let count = document.getElementById("cartCount");

    if (count) {

        count.innerText = total;

    }

}


// =====================================
// ADD PRODUCT TO CART
// =====================================

function addToCart(product) {

    let cart = getCart();

    let existing = cart.find(item => item.id === product.id);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }

    saveCart(cart);

    // Open Checkout in New Tab

    window.open("checkout.html", "_blank");

}


// =====================================
// SETUP PRODUCT CARDS
// =====================================

function setupProductCards() {

    let cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {

        if (card.dataset.cartReady) return;

        let img = card.querySelector("img");

        let nameElement =
            card.querySelector("h2") ||
            card.querySelector("h3");

        let descriptions = card.querySelector("p");

        let headings = card.querySelectorAll("h3");

        let priceElement = headings[headings.length - 1];

        if (!img || !nameElement || !priceElement) return;

        // Product Information

        let product = {

            id: card.dataset.productId ||
                location.pathname + "-" + index + "-" +
                nameElement.innerText.trim(),

            name: nameElement.innerText.trim(),

            image: img.getAttribute("src"),

            description: descriptions ?
                descriptions.innerText : "",

            price: priceElement.innerText.trim()

        };


        card.dataset.cartReady = "true";


        // Remove Old Buttons

        let oldButton = card.querySelector("button, a");

        if (oldButton) {

            oldButton.remove();

        }


        // Product Actions

        let actions = document.createElement("div");

        actions.className = "product-actions";


        // Add To Cart Button

        let addButton = document.createElement("button");

        addButton.innerText = "Add to Cart";

        addButton.onclick = function () {

            addToCart(product);

        };


        // Buy Now Button

        let buyButton = document.createElement("button");

        buyButton.innerText = "Buy Now";

        buyButton.onclick = function () {

            addToCart(product);

        };


        actions.appendChild(addButton);

        actions.appendChild(buyButton);

        card.appendChild(actions);

    });

}


// =====================================
// LOAD HOME PRODUCTS
// =====================================

async function loadHomeProducts() {

    let homeProducts = document.getElementById("homeProducts");

    if (!homeProducts) return;

    let categories = [

        "mobile.html",

        "laptop.html",

        "watche.html",

        "Accessories.html"

    ];

    homeProducts.innerHTML = "";


    for (let file of categories) {

        try {

            let response = await fetch(file);

            if (!response.ok) {

                throw new Error("Page not found: " + file);

            }

            let html = await response.text();

            let parser = new DOMParser();

            let doc = parser.parseFromString(html, "text/html");

            let cards = doc.querySelectorAll(".card");


            // Three Products From Each Category

            Array.from(cards).slice(0, 3).forEach(card => {

                let clone = card.cloneNode(true);

                clone.removeAttribute("data-cart-ready");

                homeProducts.appendChild(clone);

            });

        }

        catch (error) {

            console.error(error);

        }

    }


    setupProductCards();

}


// =====================================
// SEARCH PRODUCTS
// =====================================

function searchProducts() {

    let searchInput = document.getElementById("searchInput");

    if (!searchInput) return;


    searchInput.addEventListener("input", function () {

        let value = this.value.toLowerCase().trim();

        let cards = document.querySelectorAll(".card");

        let productsSection =
            document.querySelector(".products-section");

        let topBanner =
            document.querySelector(".top-banner");

        let bottomBanner =
            document.querySelector(".bottom-banner");

        let categoriesSection =
            document.querySelector(".categories-section");

        let aboutSection =
            document.querySelector("#about");

        let isSearching = value.length > 0;


        // Hide Other Sections

        if (topBanner) {

            topBanner.style.display =
                isSearching ? "none" : "flex";

        }

        if (bottomBanner) {

            bottomBanner.style.display =
                isSearching ? "none" : "flex";

        }

        if (categoriesSection) {

            categoriesSection.style.display =
                isSearching ? "none" : "block";

        }

        if (aboutSection && aboutSection !== bottomBanner) {

            aboutSection.style.display =
                isSearching ? "none" : "";

        }

        if (productsSection) {

            productsSection.style.display = "block";

        }


        // Filter Products

        cards.forEach(card => {

            let text = card.innerText.toLowerCase();

            if (text.includes(value)) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });


        // Change Heading

        let heading = document.querySelector(".section-title");

        if (heading && productsSection) {

            heading.innerText = isSearching ?
                "Search Results" : "Our Products";

        }

    });

}


// =====================================
// DISPLAY CART PRODUCTS
// =====================================

function displayCart() {

    let cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    let cart = getCart();

    cartItems.innerHTML = "";


    // Empty Cart

    if (cart.length === 0) {

        cartItems.innerHTML = "<h2>Your Cart Is Empty!</h2>";

        let totalElement = document.getElementById("cartTotal");

        if (totalElement) {

            totalElement.innerText = "";

        }

        return;

    }


    // Calculate Total

    let totals = {};


    cart.forEach((item, index) => {

        let currency = item.price.replace(/[0-9,.\s]/g, "").trim();

        let price = parseFloat(
            item.price.replace(/[^0-9.]/g, "")
        ) || 0;


        totals[currency] =

            (totals[currency] || 0) +

            price * item.quantity;


        // Create Cart Item

        let itemBox = document.createElement("div");

        itemBox.className = "cart-item";


        itemBox.innerHTML = `

            <img src="${item.image}" alt="${item.name}">

            <div class="cart-info">

                <h3>${item.name}</h3>

                <p>${item.price}</p>

                <div class="quantity-box">

                    <button onclick="changeQuantity(${index}, -1)">
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button onclick="changeQuantity(${index}, 1)">
                        +
                    </button>

                </div>

                <button class="remove-btn"
                    onclick="removeProduct(${index})">

                    Remove

                </button>

            </div>

        `;


        cartItems.appendChild(itemBox);

    });


    // Show Total Price

    let totalText = Object.entries(totals)

        .map(([currency, total]) =>

            `${currency} ${total.toLocaleString()}`

        )

        .join(" + ");


    let totalElement = document.getElementById("cartTotal");

    if (totalElement) {

        totalElement.innerText = "Total: " + totalText;

    }

}


// =====================================
// CHANGE PRODUCT QUANTITY
// =====================================

function changeQuantity(index, amount) {

    let cart = getCart();

    if (!cart[index]) return;

    cart[index].quantity += amount;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart(cart);

    displayCart();

}


// =====================================
// REMOVE PRODUCT
// =====================================

function removeProduct(index) {

    let cart = getCart();

    cart.splice(index, 1);

    saveCart(cart);

    displayCart();

}


// =====================================
// CHECKOUT
// =====================================

function checkout() {

    let cart = getCart();

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;

    }

    let form = document.getElementById("checkoutForm");

    if (form) {

        form.style.display = "block";

        form.scrollIntoView({

            behavior: "smooth"

        });

    }

}


// =====================================
// SUBMIT ORDER
// =====================================

function submitOrder(event) {

    event.preventDefault();

    let cart = getCart();


    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;

    }


    let name = document.getElementById("customerName").value;

    let phone = document.getElementById("customerPhone").value;

    let address = document.getElementById("customerAddress").value;


    // Order Confirmation

    alert(

        "Thank You " + name +

        "!\nYour order has been placed successfully." +

        "\nPhone: " + phone +

        "\nAddress: " + address

    );


    // Clear Cart

    localStorage.removeItem(CART_KEY);


    updateCartCount();

    displayCart();


    // Reset Form

    let form = document.getElementById("checkoutForm");

    if (form) {

        form.reset();

    }

}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener("DOMContentLoaded", async function () {

    updateCartCount();

    await loadHomeProducts();

    setupProductCards();

    searchProducts();

    displayCart();

});