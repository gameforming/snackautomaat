/* =========================================================
   SNACKAUTOMAAT
   Versie 1
   ========================================================= */


/* =========================================================
   DATA
========================================================= */

const STORAGE_KEY = "snackautomaat_v1";

let appData = {
    slots: []
};

let currentFilter = "all";


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    setupEvents();

    render();

});


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return;
    }

    try {

        const parsed = JSON.parse(saved);

        if (
            parsed &&
            Array.isArray(parsed.slots)
        ) {

            appData = parsed;

        }

    } catch (error) {

        console.error(
            "Kon opgeslagen gegevens niet laden:",
            error
        );

    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    document
        .getElementById("addProductButton")
        .addEventListener(
            "click",
            openProductModal
        );


    document
        .getElementById("addSlotButton")
        .addEventListener(
            "click",
            openSlotModal
        );


    document
        .getElementById("emptyAddSlotButton")
        .addEventListener(
            "click",
            openSlotModal
        );


    document
        .getElementById("productForm")
        .addEventListener(
            "submit",
            handleProductSubmit
        );


    document
        .getElementById("slotForm")
        .addEventListener(
            "submit",
            handleSlotSubmit
        );


    document
        .getElementById("clearFilterButton")
        .addEventListener(
            "click",
            () => {

                currentFilter = "all";

                render();

            }
        );


    document
        .querySelectorAll("[data-filter]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.dataset.filter;

                    if (currentFilter === filter) {

                        currentFilter = "all";

                    } else {

                        currentFilter = filter;

                    }

                    render();

                }
            );

        });


    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        });


    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        });

}


/* =========================================================
   RENDER
========================================================= */

function render() {

    renderOverview();

    renderSlots();

    updateMachineSummary();

    updateProductSlotSelect();

}


/* =========================================================
   OVERVIEW
========================================================= */

function renderOverview() {

    const counts = {
        green: 0,
        orange: 0,
        red: 0,
        expired: 0
    };


    appData.slots.forEach(slot => {

        slot.products.forEach(product => {

            const status =
                getProductStatus(
                    product.date
                );

            counts[status]++;

        });

    });


    document
        .getElementById("greenCount")
        .textContent = counts.green;


    document
        .getElementById("orangeCount")
        .textContent = counts.orange;


    document
        .getElementById("redCount")
        .textContent = counts.red;


    document
        .getElementById("expiredCount")
        .textContent = counts.expired;


    const filterButton =
        document.getElementById(
            "clearFilterButton"
        );


    if (currentFilter === "all") {

        filterButton.classList.add(
            "hidden"
        );

    } else {

        filterButton.classList.remove(
            "hidden"
        );

        filterButton.textContent =
            `Toon alle vakken`;

    }

}


/* =========================================================
   RENDER SLOTS
========================================================= */

function renderSlots() {

    const container =
        document.getElementById(
            "slotsContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    container.innerHTML = "";


    if (appData.slots.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    const sortedSlots =
        [...appData.slots].sort(
            (a, b) =>
                Number(a.number) -
                Number(b.number)
        );


    sortedSlots.forEach(slot => {

        const slotElement =
            createSlotElement(slot);

        container.appendChild(
            slotElement
        );

    });

}


/* =========================================================
   CREATE SLOT
========================================================= */

function createSlotElement(slot) {

    const article =
        document.createElement("article");

    article.className = "slot";


    const matchesFilter =
        slotMatchesFilter(slot);


    if (!matchesFilter) {

        article.classList.add(
            "filtered-out"
        );

    }


    const header =
        document.createElement("div");

    header.className = "slot-header";


    const title =
        document.createElement("div");

    title.className = "slot-title";


    const number =
        document.createElement("span");

    number.className = "slot-number";

    number.textContent =
        `Vak ${slot.number}`;


    const productName =
        document.createElement("span");

    productName.className =
        "slot-product-name";


    if (slot.products.length > 0) {

        productName.textContent =
            slot.products[0].name;

    } else {

        productName.textContent =
            "Leeg";

    }


    title.appendChild(number);

    title.appendChild(productName);


    const actions =
        document.createElement("div");

    actions.className = "slot-actions";


    /*
       🗑️ = voorste product verkocht
    */

    const sellButton =
        document.createElement("button");

    sellButton.className =
        "icon-button";

    sellButton.title =
        "Voorste product verkocht";

    sellButton.textContent = "🗑️";


    sellButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            sellFirstProduct(
                slot.id
            );

        }
    );


    /*
       👁️ = details
    */

    const detailsButton =
        document.createElement("button");

    detailsButton.className =
        "icon-button";

    detailsButton.title =
        "Vak bekijken";

    detailsButton.textContent = "👁️";


    detailsButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openSlotDetails(
                slot.id
            );

        }
    );


    actions.appendChild(
        sellButton
    );

    actions.appendChild(
        detailsButton
    );


    header.appendChild(title);

    header.appendChild(actions);


    article.appendChild(header);


    /*
       PRODUCTS
    */

    const products =
        document.createElement("div");

    products.className =
        "products";


    slot.products.forEach(
        (product, index) => {

            const chip =
                createProductChip(
                    product,
                    index
                );

            products.appendChild(
                chip
            );

        }
    );


    article.appendChild(products);


    /*
       EMPTY SLOT
    */

    if (slot.products.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-slot";

        empty.innerHTML = `
            Dit vak is leeg.
            <br>
            <button
                class="secondary-button"
                type="button"
            >
                + Product toevoegen
            </button>
        `;


        empty
            .querySelector("button")
            .addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openProductModal(
                        slot.id
                    );

                }
            );


        article.appendChild(empty);

    }


    /*
       Klik op vak
    */

    article.addEventListener(
        "click",
        () => {

            openSlotDetails(
                slot.id
            );

        }
    );


    return article;

}


/* =========================================================
   PRODUCT CHIP
========================================================= */

function createProductChip(
    product,
    index
) {

    const chip =
        document.createElement("div");

    const status =
        getProductStatus(
            product.date
        );


    chip.className =
        `product-chip ${status}`;


    /*
       Product-emoji.
       Later kunnen we dit uitbreiden
       met echte afbeeldingen.
    */

    chip.textContent =
        getProductEmoji(
            product.name
        );


    chip.title =
        `${product.name} — ${formatDate(product.date)}`;


    /*
       Alleen eerste product
       krijgt extra markering.
    */

    if (index === 0) {

        chip.setAttribute(
            "data-first",
            "true"
        );

    }


    chip.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openSlotDetails(
                findSlotForProduct(
                    product.id
                )
            );

        }
    );


    return chip;

}


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getProductStatus(dateString) {

    const today =
        startOfDay(
            new Date()
        );


    const expiration =
        startOfDay(
            parseLocalDate(dateString)
        );


    const difference =
        expiration - today;


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    /*
       10 dagen of meer
    */

    if (days >= 10) {

        return "green";

    }


    /*
       5 t/m 9 dagen
    */

    if (days >= 5) {

        return "orange";

    }


    /*
       2 t/m 4 dagen
    */

    if (days >= 2) {

        return "red";

    }


    /*
       1 dag, vandaag of verlopen.
       Omdat alles onder 2 dagen
       rood/gevaarlijk is, gebruiken
       we vanaf vandaag ☠️.
    */

    return "expired";

}


/* =========================================================
   DATE HELPERS
========================================================= */

function parseLocalDate(dateString) {

    const [
        year,
        month,
        day
    ] = dateString
        .split("-")
        .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );

}


function startOfDay(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


function formatDate(dateString) {

    const date =
        parseLocalDate(
            dateString
        );


    return date.toLocaleDateString(
        "nl-NL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   EMOJI
========================================================= */

function getProductEmoji(name) {

    const lower =
        name.toLowerCase();


    if (
        lower.includes("cola") ||
        lower.includes("fanta") ||
        lower.includes("sprite") ||
        lower.includes("dr pepper") ||
        lower.includes("monster") ||
        lower.includes("red bull")
    ) {

        return "🥤";

    }


    if (
        lower.includes("mars") ||
        lower.includes("snickers") ||
        lower.includes("twix") ||
        lower.includes("chocolade") ||
        lower.includes("choco")
    ) {

        return "🍫";

    }


    if (
        lower.includes("chips") ||
        lower.includes("lays") ||
        lower.includes("doritos")
    ) {

        return "🍟";

    }


    if (
        lower.includes("koek") ||
        lower.includes("cookie")
    ) {

        return "🍪";

    }


    if (
        lower.includes("snoep") ||
        lower.includes("drop")
    ) {

        return "🍬";

    }


    return "🍫";

}


/* =========================================================
   ADD SLOT
========================================================= */

function openSlotModal() {

    document
        .getElementById("slotNumber")
        .value = getNextSlotNumber();


    openModal("slotModal");

}


function handleSlotSubmit(event) {

    event.preventDefault();


    const number =
        Number(
            document
                .getElementById("slotNumber")
                .value
        );


    if (
        appData.slots.some(
            slot =>
                Number(slot.number) === number
        )
    ) {

        alert(
            "Dit vaknummer bestaat al."
        );

        return;

    }


    appData.slots.push({

        id: createId(),

        number,

        products: []

    });


    saveData();

    closeModal("slotModal");

    render();

}


function getNextSlotNumber() {

    if (
        appData.slots.length === 0
    ) {

        return 1;

    }


    const numbers =
        appData.slots.map(
            slot =>
                Number(slot.number)
        );


    return Math.max(
        ...numbers
    ) + 1;

}


/* =========================================================
   ADD PRODUCT
========================================================= */

function openProductModal(
    preferredSlotId = null
) {

    updateProductSlotSelect(
        preferredSlotId
    );


    document
        .getElementById("productForm")
        .reset();


    updateProductSlotSelect(
        preferredSlotId
    );


    /*
       Standaard datum:
       10 dagen vanaf vandaag.
    */

    const defaultDate =
        new Date();

    defaultDate.setDate(
        defaultDate.getDate() + 10
    );


    document
        .getElementById("productDate")
        .value =
        toInputDate(
            defaultDate
        );


    document
        .getElementById("productAmount")
        .value = 1;


    openModal(
        "productModal"
    );

}


function handleProductSubmit(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const slotId =
        document
            .getElementById("productSlot")
            .value;


    const date =
        document
            .getElementById("productDate")
            .value;


    const amount =
        Number(
            document
                .getElementById("productAmount")
                .value
        );


    if (
        !name ||
        !slotId ||
        !date ||
        amount < 1
    ) {

        return;

    }


    const slot =
        appData.slots.find(
            item =>
                item.id === slotId
        );


    if (!slot) {

        return;

    }


    /*
       Ieder product krijgt
       zijn eigen ID.

       We voegen ze achteraan toe.
       Daardoor blijft FIFO behouden.
    */

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        slot.products.push({

            id: createId(),

            name,

            date

        });

    }


    saveData();

    closeModal(
        "productModal"
    );

    render();

}


/* =========================================================
   SELL FIRST PRODUCT
========================================================= */

function sellFirstProduct(
    slotId
) {

    const slot =
        appData.slots.find(
            item =>
                item.id === slotId
        );


    if (!slot) {

        return;

    }


    if (
        slot.products.length === 0
    ) {

        return;

    }


    /*
       shift() verwijdert
       ALTIJD het eerste product.

       Dit is precies de FIFO-logica
       voor de automaat.
    */

    slot.products.shift();


    saveData();

    render();

}


/* =========================================================
   SLOT DETAILS
========================================================= */

function openSlotDetails(
    slotId
) {

    const slot =
        appData.slots.find(
            item =>
                item.id === slotId
        );


    if (!slot) {

        return;

    }


    document
        .getElementById("detailsTitle")
        .textContent =
        `Vak ${slot.number}`;


    document
        .getElementById("detailsSubtitle")
        .textContent =
        slot.products.length === 0
            ? "Leeg"
            : `${slot.products.length} product(en)`;


    const container =
        document
            .getElementById(
                "slotDetailsContent"
            );


    container.innerHTML = "";


    if (
        slot.products.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>Dit vak is leeg</h3>
                <p>Voeg een product toe.</p>
            </div>
        `;


        const button =
            document.createElement(
                "button"
            );

        button.className =
            "primary-button";

        button.textContent =
            "+ Product toevoegen";


        button.addEventListener(
            "click",
            () => {

                closeModal(
                    "slotDetailsModal"
                );

                openProductModal(
                    slot.id
                );

            }
        );


        container
            .querySelector(".empty-state")
            .appendChild(button);


        openModal(
            "slotDetailsModal"
        );

        return;

    }


    /*
       Alleen voor de uitleg.
    */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "details-warning";

    info.textContent =
        "🗑️ verwijdert altijd het voorste product, omdat die als eerste verkocht wordt.";


    container.appendChild(info);


    /*
       Productenlijst
    */

    slot.products.forEach(
        (product, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "detail-product";


            const left =
                document.createElement(
                    "div"
                );

            left.className =
                "detail-left";


            const color =
                document.createElement(
                    "span"
                );

            color.className =
                "detail-color";


            color.textContent =
                statusToEmoji(
                    getProductStatus(
                        product.date
                    )
                );


            const text =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                product.name;


            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "detail-date";


            date.textContent =
                `${formatDate(product.date)}`;


            if (index === 0) {

                date.textContent +=
                    " • VOORSTE";

            }


            text.appendChild(name);

            text.appendChild(date);


            left.appendChild(color);

            left.appendChild(text);


            /*
               Verwijderen vanuit details.
               Voor consistentie verwijderen
               we ook hier alleen het eerste
               product.
            */

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "delete-product";

            deleteButton.textContent =
                "🗑️";


            deleteButton.title =
                index === 0
                    ? "Verkocht"
                    : "Alleen het voorste product kan verkocht worden";


            if (index !== 0) {

                deleteButton.disabled = true;

                deleteButton.style.opacity =
                    "0.35";

                deleteButton.style.cursor =
                    "not-allowed";

            } else {

                deleteButton.addEventListener(
                    "click",
                    () => {

                        sellFirstProduct(
                            slot.id
                        );

                        openSlotDetails(
                            slot.id
                        );

                    }
                );

            }


            row.appendChild(left);

            row.appendChild(
                deleteButton
            );


            container.appendChild(row);

        }
    );


    /*
       Product toevoegen
    */

    const addButton =
        document.createElement(
            "button"
        );

    addButton.className =
        "primary-button";

    addButton.textContent =
        "+ Product toevoegen";


    addButton.style.marginTop =
        "12px";


    addButton.addEventListener(
        "click",
        () => {

            closeModal(
                "slotDetailsModal"
            );

            openProductModal(
                slot.id
            );

        }
    );


    container.appendChild(
        addButton
    );


    openModal(
        "slotDetailsModal"
    );

}


/* =========================================================
   FILTER
========================================================= */

function slotMatchesFilter(slot) {

    if (
        currentFilter === "all"
    ) {

        return true;

    }


    return slot.products.some(
        product =>
            getProductStatus(
                product.date
            ) === currentFilter
    );

}


/* =========================================================
   PRODUCT SELECT
========================================================= */

function updateProductSlotSelect(
    preferredSlotId = null
) {

    const select =
        document.getElementById(
            "productSlot"
        );


    select.innerHTML = "";


    if (
        appData.slots.length === 0
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "Maak eerst een vak aan";

        select.appendChild(option);

        return;

    }


    const sortedSlots =
        [...appData.slots].sort(
            (a, b) =>
                Number(a.number) -
                Number(b.number)
        );


    sortedSlots.forEach(slot => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            slot.id;

        option.textContent =
            `Vak ${slot.number}`;


        if (
            preferredSlotId &&
            slot.id === preferredSlotId
        ) {

            option.selected = true;

        }


        select.appendChild(
            option
        );

    });

}


/* =========================================================
   SUMMARY
========================================================= */

function updateMachineSummary() {

    const totalSlots =
        appData.slots.length;


    const totalProducts =
        appData.slots.reduce(
            (
                total,
                slot
            ) =>
                total +
                slot.products.length,
            0
        );


    document
        .getElementById(
            "machineSummary"
        )
        .textContent =
        `${totalSlots} vakken • ${totalProducts} producten`;

}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.remove(
            "hidden"
        );

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.add(
            "hidden"
        );

}


/* =========================================================
   STATUS EMOJI
========================================================= */

function statusToEmoji(status) {

    switch (status) {

        case "green":
            return "🟩";

        case "orange":
            return "🟧";

        case "red":
            return "🟥";

        case "expired":
            return "☠️";

        default:
            return "⬜";

    }

}


/* =========================================================
   FIND PRODUCT
========================================================= */

function findSlotForProduct(
    productId
) {

    const slot =
        appData.slots.find(
            item =>
                item.products.some(
                    product =>
                        product.id === productId
                )
        );


    return slot
        ? slot.id
        : null;

}


/* =========================================================
   DATE INPUT
========================================================= */

function toInputDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =========================================================
   ID
========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}
