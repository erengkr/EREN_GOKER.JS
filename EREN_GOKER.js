// IIFE
(() => {
    const CONFIG = {
        WIDGET_PATHNAMES: ["", "/"],
        PRODUCTS_URL: "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
        TARGET_ELEMENT_SELECTOR: ".Section1",
        TARGET_ELEMENT_POSITION: "afterend",
        LOCALSTORAGE_FAVORITES_KEY: "task-favorites",
        LOCALSTORAGE_PRODUCTS_KEY: "task-products",
        CAROUSEL_SLIDES_PER_VIEW: {
            DEFAULT: 2,
            992: 3,
            1280: 4,
            1480: 5,
        },
        CAROUSEL_RUBBERBAND_FACTOR: 0.25,
    };

    const init = async () => {
        if(!CONFIG.WIDGET_PATHNAMES.includes(window.location.pathname)){
            console.log("wrong page");
            return;
        }

        try {
            const products = await fetchProducts();
            const favoriteProductIds = getFavoriteProductIDs();

            buildHtml(products, favoriteProductIds)
            buildCSS();
            setEvents();
        } catch (err) {
            console.error("Error while running products widget", err)
        }
    }

    const getFavoriteProductIDs = () => {
        const favoritesString = localStorage.getItem(CONFIG.LOCALSTORAGE_FAVORITES_KEY);

        if (!favoritesString) return [];

        return JSON.parse(favoritesString);
    }

    const setFavoriteProduct = (id, isFavorite) => {
        const favorites = getFavoriteProductIDs();

        if (isFavorite) {
            favorites.push(id);
        } else {
            favorites.splice(favorites.indexOf(id), 1);
        }

        localStorage.setItem(CONFIG.LOCALSTORAGE_FAVORITES_KEY, JSON.stringify(favorites));
    }

    const fetchProducts = async () => {
        const cachedProducts = localStorage.getItem(CONFIG.LOCALSTORAGE_PRODUCTS_KEY);

        if (cachedProducts) {
            return JSON.parse(cachedProducts);
        }

        const response = await fetch(CONFIG.PRODUCTS_URL);
        if (!response.ok) {
            throw new Error(`Products response is not ok, status: ${response.status}`);
        }

        const json = await response.json();

        localStorage.setItem(CONFIG.LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(json));
        return json;
    }

    const buildHtml = (data, favoriteProductIds) => {
        const htmlTemplate = `
        <div class="task-container">
            <h2 class="task-banner__title">
                Beğenebileceğinizi düşündüklerimiz
            </h2>
            <div class="task-content-wrapper">
                <div class="task-carousel-wrapper">
                    <div class="task-carousel">
                        ${buildProductCards(data, favoriteProductIds)}
                    </div>
                </div>
                <button class="task-control-button task-control-button--prev">
                    <i></i>
                </button>
                <button class="task-control-button task-control-button--next">
                    <i></i>
                </button>
            </div>
        </div>
        `;

        document.querySelector(CONFIG.TARGET_ELEMENT_SELECTOR).insertAdjacentHTML(CONFIG.TARGET_ELEMENT_POSITION, htmlTemplate)
    }

    const buildProductCards = (data, favoriteProductIds) => {
        let html = "";
        data.forEach((product) => {
            const stars = Math.floor(Math.random() * 6);
            const commentCount = stars == 0 ? 0 : Math.floor(Math.random() * 100) + 1;

            const isOnSale = product.price < product.original_price;
            const discountPercentage = Math.round(100 - product.price / product.original_price * 100);
            const originalPriceInt = product.original_price.toString().split(".")[0];
            const originalPriceFraction = product.original_price.toString().split(".")[1]?.padStart(2, "0") || "00";

            const priceInt = product.price.toString().split(".")[0];
            const priceFraction = product.price.toString().split(".")[1]?.padStart(2, "0") || "00";

            html += `
            <div class="task-item-wrapper ${favoriteProductIds.includes(product.id) ? "task-item-wrapper--favorite" : ""}" data-id="${product.id}">
                <a class="task-item" href="${product.url}">
                    <div class="task-item__info-group">
                        <img alt="${product.name}" src="${product.img}" class="task-item__img" />
                        <div class="task-item__content">
                            <h2 class="task-item__brand">
                                <b>${product.brand}</b>
                                <span class="task-item__description">${product.name}</span>
                            </h2>
                            <div class="task-item__stars-wrapper">
                                <div class="task-item__stars">
                                   ${Array.from({length: 5}, (_, index) => `<i class="task-item__star fas fa-star task-item__star--${index < stars ? "active" : "passive"}"></i>`).join("\n")}
                                </div>
                                ${commentCount > 0 ? `<p class="task-item__review-count">(${commentCount})</p>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="task-item__price">
                        ${isOnSale ? 
                            `<div class="task-item__original-price">
                                <span class="task-item__old-price">${originalPriceInt}<span>,${originalPriceFraction} TL</span></span>
                                <span class="task-item__discount">%${discountPercentage}</span>
                            </div>` 
                            : ""
                        }
                        <div class="task-item__current-price ${isOnSale ? "task-item__current-price--sale" : ""}">
                            <strong>${priceInt}<span class="task-item__current-price-fraction">,${priceFraction} TL</span></strong>
                        </div>

                    </div>
                </a>
                <button class="task-item__favorite-button">
                        <i class="task-item__favorite-icon"></i>
                        <i class="task-item__favorite-icon task-item__favorite-icon--active"></i>
                        <i class="task-item__favorite-icon task-item__favorite-icon--filled"></i>
                </button>
                <button class="task-item__add-to-cart-button">
                        <i class="task-item__add-to-cart-icon"></i>
                </button>
            </div>
            `;
        })

        return html;
    }

    const buildCSS = () => {
        const css = `
            .task-container {
                width: 100%;
                max-width: 100vw;
                padding: 0 15px;
            }

            .task-banner__title {
                color: #2b2f33;
                font-size: 20px;
                font-family: "Quicksand-SemiBold";
                margin: 0;
            }

            .task-content-wrapper {
                position: relative;
            }

            .task-carousel-wrapper {
                padding-top: 20px;
                position: relative;
                overflow: hidden;
                width: 100%;
            }

            .task-control-button {
                width: 40px;
                height: 40px;
                background-color: white;
                display:flex;
                align-items:center;
                justify-content: center;
                border-radius: 50%;
                box-shadow: 0 6px 2px 0 #b0b0b003, 0 2px 9px 0 #b0b0b014, 0 2px 4px 0 #b0b0b024, 0 0 1px 0 #b0b0b03d, 0 0 1px 0 #b0b0b047;
            }

            .task-control-button--prev {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                left: -65px;
            }

            .task-control-button--prev i {
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/arrow-left.svg);
                display: inline-block;
                width: 14px;
                height: auto;
                background-repeat: no-repeat;
                background-size: contain;
                background-position: 50%;
                aspect-ratio: 1;
            }

            .task-control-button--next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: -65px;
            }

            .task-control-button--next i {
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/arrow-right.svg);
                display: inline-block;
                width: 14px;
                height: auto;
                background-repeat: no-repeat;
                background-size: contain;
                background-position: 50%;
                aspect-ratio: 1;
            }

            .task-carousel {
                display: flex;
                gap: 16px;
                width: fit-content;
            }

            .task-carousel--transition {
                transition: transform 0.3s ease-in-out;
            }

            .task-item-wrapper {
                position: relative;
            }

            .task-item {
                user-select: none;
                border: 1px solid #f2f5f7;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .task-item__img {
                width: 100%;
                height: 150px;
                max-height: 60%;
                object-fit: contain;
                margin-bottom: 1rem;
            }

            .task-item__content {
                padding: 0 10px 13px;
            }

            .task-item__brand {
                font-size: 12px;
                color: #2b2f33;
                text-overflow: ellipsis;
                overflow: hidden;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                display: -webkit-box;
                margin-bottom: 10px;
            }

            .task-item__stars-wrapper {
                display: flex;
                align-items: center;
            }

            .task-item__star {
                margin-right: 4px;
                font-size: 10px;
            }

            .task-item__star--active {
                color: #ff8a00;
            }

            .task-item__star--passive {
                color: #ffe8cc;
            }

            .task-item__review-count {
                font-size: 10px;
                color: #a2b1bc;
                margin-bottom: 0px;
            }

            .task-item__price {
                padding: 6px 10px 15px;
                margin-top: auto;
            }

            .task-item__old-price {
                font-size: 12px;
                color: #a2b1bc;
                margin-right: 8px;
                font-family: "Quicksand-SemiBold";
            }

            .task-item__discount {
                display: inline-block;
                font-size: 12px;
                background-color: #00a365;
                color: white;
                border-radius: 16px;
                padding: 0 4px;
                font-family: "Quicksand-SemiBold";
            }

            .task-item__current-price {
                font-size: 20px;
                line-height: 20px;
                font-family: "Quicksand-SemiBold";
                font-weight: 900;
                color: #2b2f33;
            }

            .task-item__current-price--sale {
                color: #00a365;
            }

            .task-item__current-price-fraction {
                font-size: 14px;
            }

            .task-item__favorite-button {
                background-color: transparent;
                height: 50px;
                width: 50px;
                right: 0;
                top: 0;
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
            }
                
            .task-item__favorite-button:hover .task-item__favorite-icon {
                display: none;
            }

            .task-item__favorite-button:hover .task-item__favorite-icon--active {
                display: block;
            }

            .task-item-wrapper--favorite .task-item__favorite-icon {
                display: none !important;
            }

            .task-item-wrapper--favorite .task-item__favorite-icon--filled {
                display: block !important;
            }

            .task-item__favorite-icon {
                display: inline-block;
                width: 15px;
                height: 15px;
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/heart-outline.svg);
                background-repeat: no-repeat;
                background-size: contain;
                background-position: 50%;
                aspect-ratio: 1;
            }

            .task-item__favorite-icon--active {
                display: none;
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/heart-orange-outline.svg);
            }

            .task-item__favorite-icon--filled {
                display: none;
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/heart-orange-filled.svg);
            }

            @media (min-width: 480px) {
                .task-container {
                    padding-top: 25px;
                }

                .task-banner__title {
                    font-size: 24px;
                }
            }

            @media (min-width: 576px) {
                .task-container {
                    max-width: 540px;
                }
            }

            @media (min-width: 768px) {
                .task-container {
                    max-width: 720px;
                }
            }

            @media (min-width: 992px) {
                .task-container {
                    max-width: 960px;
                }
            }

            @media (min-width: 1280px) {
                .task-container {
                    max-width: 1180px;
                    padding-top: 20px;
                }
            }

            @media (min-width: 1480px) {
                .task-container {
                    max-width: 1296px;
                }
            }

            @media (min-width: 1580px) {
                .task-container {
                    max-width: 1520px;
                }
            }

        `;

        const style = document.createElement("style");
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    const getCarouselItemsPerView = () => {
        const key = Object.keys(CONFIG.CAROUSEL_SLIDES_PER_VIEW).map((key) => parseInt(key)).filter((key) => key <= window.innerWidth).sort((a, b) => b - a).at(0) ?? "DEFAULT";
        const carousel = document.querySelector(".task-carousel");
        const itemCount = carousel.children.length;
    
        return Math.min(itemCount, CONFIG.CAROUSEL_SLIDES_PER_VIEW[key]);
    }

    const calculateCarouselItemWidth = () => {
        const carouselWrapper = document.querySelector(".task-carousel-wrapper");
        const carousel = document.querySelector(".task-carousel");
        const itemsPerView = getCarouselItemsPerView();
        const gap = parseInt(getComputedStyle(carousel).getPropertyValue("gap"));
        const width = (carouselWrapper.offsetWidth - (itemsPerView - 1) * gap) / itemsPerView;

        return width;
    }

    const resizeCarousel = () => {
        const items = Array.from(document.querySelectorAll(".task-item"))
        const width = calculateCarouselItemWidth();

        for (const item of items) {
            item.style.width = `${width}px`;
            item.style.maxWidth = `${width}px`;
        }
    }

    const state = {
        isDown: false,
        startX: 0,
    }
    const setEvents = () => {
        window.addEventListener("resize", resizeCarousel)
        resizeCarousel();

        const leftButton = document.querySelector(".task-control-button--prev");
        const rightButton = document.querySelector(".task-control-button--next");
        const favoriteButtons = document.querySelectorAll(".task-item__favorite-button");
        const carouselWrapper = document.querySelector(".task-carousel-wrapper");
        const carousel = document.querySelector(".task-carousel");
        const itemCount = carousel.children.length;
        carouselWrapper.addEventListener("pointerdown", e => {
            e.preventDefault();
            state.isDown = true;
            carousel.classList.remove("task-carousel--transition");
    
            const matrix = new DOMMatrixReadOnly(window.getComputedStyle(carousel).transform)
            const translateX = matrix.m41;
            state.startX = e.pageX - translateX;
        })

        window.addEventListener("pointerup", e => {
            state.isDown = false;
            carousel.classList.add("task-carousel--transition");
            const matrix = new DOMMatrixReadOnly(window.getComputedStyle(carousel).transform)
            const translateX = matrix.m41;
            const itemWidth = calculateCarouselItemWidth();
            const gap = parseInt(getComputedStyle(carousel).getPropertyValue("gap"));
            
            // Snap
            const currentItemIndex = -Math.round(translateX / (itemWidth + gap));
            const roundedX = -currentItemIndex * (itemWidth + gap);
            const windowLimitexX = -Math.max(0, itemCount - getCarouselItemsPerView()) * (itemWidth + gap);
            let x = Math.max(Math.min(0, roundedX), windowLimitexX);
            carousel.style.transform = `translateX(${x}px)`;
            carouselWrapper.setAttribute("data-index", currentItemIndex)
        })

        window.addEventListener("pointermove", e => {
            if (!state.isDown) return;
            e.preventDefault();

            const itemWidth = calculateCarouselItemWidth();
            const gap = parseInt(getComputedStyle(carousel).getPropertyValue("gap"));
            const x = e.pageX - state.startX;
            
            const leftLimit = 0;
            const rightLimit = -Math.max(0, itemCount - getCarouselItemsPerView()) * (itemWidth + gap);
            
            if(x > leftLimit){
                const maxX = x * CONFIG.CAROUSEL_RUBBERBAND_FACTOR;
                carousel.style.transform = `translateX(${maxX}px)`;
            } else if(x < rightLimit){
                const minX = Math.abs(x - rightLimit) * -CONFIG.CAROUSEL_RUBBERBAND_FACTOR + rightLimit;
                carousel.style.transform = `translateX(${minX}px)`;
            }else{
                carousel.style.transform = `translateX(${x}px)`;
            }
        })

        favoriteButtons.forEach(button => {
            button.addEventListener("click", e => {
                e.preventDefault();

                const taskItemNode = button.closest(".task-item-wrapper");
                const alreadyFavorite = taskItemNode.classList.contains("task-item-wrapper--favorite");
                const productId = parseInt(taskItemNode.getAttribute("data-id"));

                taskItemNode.classList.toggle("task-item-wrapper--favorite");
                setFavoriteProduct(productId, !alreadyFavorite);
            })
        })

        leftButton.addEventListener("click", e => {
            e.preventDefault();

            const itemWidth = calculateCarouselItemWidth();
            const gap = parseInt(getComputedStyle(carousel).getPropertyValue("gap"));

            const currentIndex = parseInt(carouselWrapper.getAttribute("data-index") || 0);
            const targetIndex = Math.max(currentIndex - 1, 0);
            const x = -targetIndex * (itemWidth + gap);
            carousel.style.transform = `translateX(${x}px)`;
            carouselWrapper.setAttribute("data-index", targetIndex);
        });

        rightButton.addEventListener("click", e => {
            e.preventDefault();

            const itemWidth = calculateCarouselItemWidth();
            const gap = parseInt(getComputedStyle(carousel).getPropertyValue("gap"));
            
            const currentIndex = parseInt(carouselWrapper.getAttribute("data-index") || 0);
            const targetIndex = Math.min(currentIndex + 1, itemCount - getCarouselItemsPerView());
            const x = -targetIndex * (itemWidth + gap);
            carousel.style.transform = `translateX(${x}px)`;
            carouselWrapper.setAttribute("data-index", targetIndex);
        })
    }

    init();
})()