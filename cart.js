$(document).ready(() => {
    const cartItemsDiv = $('#cart-items');
    const welcomeMessageDiv = $('#welcome-message');
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let totalAmount = 0;
    const displayWelcomeMessage = () => {
        if (users.length === 1) {
            welcomeMessageDiv.text(`Welcome, ${users[0].username}`);
        } else if (users.length > 1) {
            const usernames = users.map(user => user.username).join(' and ');
            welcomeMessageDiv.text(`Welcome, ${usernames}`);
        }
    };

    const renderCartItems = () => {
        cartItemsDiv.empty();
        totalAmount = 0;

        if (users.length === 0) {
            cartItemsDiv.html('<center><p>Your cart is empty.</p></center>');
            $('#total-amount').text('Rs 0.00');
            return;
        }

        users.forEach(user => {
            if (user.products.length > 0) {
                const userSection = $(`
                    <div class="user-section mb-4">
                        <h3>${user.username}'s Products</h3>
                        <div class="d-flex" style="display:flex;column-gap:40px;"></div>
                    </div>
                `);

                user.products.forEach(product => {
                    const productDiv = $(`
                        <div class="produc m-2 p-2">
                            <img src="${product.image}" alt="${product.name}" class="card-items">
                            <h5>${product.name}</h5>
                            <p>Price: Rs <span class="price">${product.price}</span></p>
                            <div class="quantity-controls">
                                <button class="btn btn-secondary decrease-quantity">-</button>
                                <span class="quantity">${product.quantity}</span>
                                <button class="btn btn-secondary increase-quantity">+</button>
                            </div>
                        </div>
                    `);
                    userSection.find('.d-flex').append(productDiv);
                    totalAmount += product.price * product.quantity;
                });

                cartItemsDiv.append(userSection);
            }
        });

        $('#total-amount').text(`Rs ${totalAmount.toFixed(2)}`);
    };
    $('#cart-items').on('click', '.increase-quantity', function() {
        const quantityElement = $(this).siblings('.quantity');
        const currentQuantity = parseInt(quantityElement.text());
        quantityElement.text(currentQuantity + 1);
        updateCartTotal();
    });

    $('#cart-items').on('click', '.decrease-quantity', function() {
        const quantityElement = $(this).siblings('.quantity');
        const currentQuantity = parseInt(quantityElement.text());
        if (currentQuantity > 1) {
            quantityElement.text(currentQuantity - 1);
            updateCartTotal();
        }
    });

    const updateCartTotal = () => {
        totalAmount = 0;
        $('#cart-items .produc').each(function() {
            const price = parseFloat($(this).find('.price').text());
            const quantity = parseInt($(this).find('.quantity').text());
            totalAmount += price * quantity;
        });
        $('#total-amount').text(`Rs ${totalAmount.toFixed(2)}`);
    };
    $('#checkout-btn').on('click', () => {
        if (users.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        if (users.length > 1) {
            let allPaymentsCompleted = true;
            users.forEach(user => {
                let userTotal = 0;
                user.products.forEach(product => {
                    userTotal += product.price * product.quantity;
                });
                const confirmPayment = confirm(`${user.username}, you need to pay Rs ${userTotal.toFixed(2)}. Proceed?`);
                if (!confirmPayment) {
                    allPaymentsCompleted = false;
                    alert(`Payment for ${user.username} was canceled. Checkout aborted.`);
                    return false; 
                }
            });

            if (allPaymentsCompleted) {
                completeCheckout();
            }
        } else {
            const userTotal = totalAmount;
            const confirmPayment = confirm(`You need to pay Rs ${userTotal.toFixed(2)}. Proceed?`);
            if (confirmPayment) {
                completeCheckout();
            } else {
                alert('Checkout was canceled.');
            }
        }
    });
    const completeCheckout = () => {
        users.forEach(user => {
            user.products = [];
        });

        localStorage.setItem('users', JSON.stringify(users));

        alert('Checkout successful! Redirecting to homepage...');
        setTimeout(() => {
            window.location.href = 'index.html'; 
        }, 2000);
    };

    displayWelcomeMessage();
    renderCartItems();
    $('#profile-photo').on('click', () => {
        $('#avatar-modal').fadeIn();
    });

    $('.avatar-option').on('click', function() {
        const selectedAvatarSrc = $(this).data('avatar');
        const selectedAvatarAlt = $(this).attr('alt');
        $('#profile-photo').attr('src', selectedAvatarSrc).attr('alt', selectedAvatarAlt);
        $('#avatar-modal').fadeOut();
        $('#click').fadeOut(500);
    });
});
