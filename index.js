$(document).ready(function () {
    let products = [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let friendList = JSON.parse(localStorage.getItem('friendList')) || [];
    let selectedUser = null;
    function fetchProducts() {
        $.ajax({
            url: "products.json",
            method: "GET",
            dataType: "json",
            success: function (data) {
                products = data.ProductCollection;
                renderProducts();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error fetching data:', textStatus, errorThrown);
            }
        });
    }
    fetchProducts();
    function renderProducts(filteredProducts = products) {
        const recordTableBody = $('#recordTableBody');
        recordTableBody.empty();
        $.each(filteredProducts, function (i, product) {
            const newDiv = $(`
                <div class="product" style="color:black;padding:40px; opacity:0.5;">
                    <img class="fluid" src="${product.ProductPicUrl}" alt="${product.Name}" style="width:130px;">
                    <p class="to">${product.Name}</p>
                    <p>Product ID: ${product.ProductId}</p>
                    <p style="padding:5px;">Price: Rs <span class="price">${product.Price}</span></p>
                    <button class="btn btn-primary add-to-cart">Add to Cart</button>
                </div>
            `);
            recordTableBody.append(newDiv);
        });
    }
    $('#searchInput').on('input', function () {
        const searchText = $(this).val().toLowerCase();
        const filteredProducts = products.filter(product => 
            product.Name.toLowerCase().includes(searchText)
        );
        renderProducts(filteredProducts);
    });
    users.forEach(user => renderUser(user));
    renderFriendList();
    $(".save").on("click", function () {
        const username = $("#username").val().trim();
        const userid = $("#Userid").val().trim();

        if (username === "" || userid === "") {
            alert('Please fill in all fields.');
            return;
        }

        const user = { username, userid, products: [] };
        users.push(user);
        saveUsersToLocalStorage();
        renderUser(user);
        $("#username").val("");
        $("#Userid").val("");
    });
    function renderUser(user) {
        const userList = $(".thirdcolumn");
        const isFriend = isUserInFriendList(user);
        const buttonText = isFriend ? "Remove" : "Add";
        const buttonClass = isFriend ? "btn-danger" : "btn-success";
        const userDiv = $(`
            <div class="inner mb-3 p-2 border rounded" data-user-id="${user.userid}">
                <p><strong>${user.username}</strong></p>
                <p>${user.userid}</p>
                <button class=" btn ${buttonClass} add-friend-btn">${buttonText}</button>
                <button class="btn btn-primary show-products-btn"style="margin-top:20px;">Show Products</button>
            </div>
        `);
        userList.append(userDiv);
    }

    $('.thirdcolumn').on('click', '.show-products-btn', function () {
        const userDiv = $(this).closest('.inner');
        const userId = userDiv.data('user-id');
        const user = users.find(u => u.userid == userId);

        if (user) {
            selectedUser = user.username;
            $('.product').css('opacity', '1');
            alert(`Showing products for ${user.username}`);
        }
    });
    $('.thirdcolumn').on('click', '.add-friend-btn', function () {
        const userDiv = $(this).closest('.inner');
        const userId = userDiv.data('user-id');
        const user = users.find(u => u.userid == userId);
        if (!isUserInFriendList(user)) {
            addToFriendList(user);
            $(this).removeClass('btn-success').addClass('btn-danger').text('Remove');
        }else {
            removeFromFriendList(user);
            $(this).removeClass('btn-danger').addClass('btn-success').text('Add');
        }
    });

    function isUserInFriendList(user) {
        return friendList.some(friend => friend.userid === user.userid);
    }

    function addToFriendList(user) {
        friendList.push(user);
        saveFriendListToLocalStorage();
        renderFriendList();
        alert(`${user.username} added to the friend list`);
    }

    function removeFromFriendList(user) {
        friendList = friendList.filter(friend => friend.userid !== user.userid);
        saveFriendListToLocalStorage();
        renderFriendList();
        alert(`${user.username} removed from the friend list`);
    }
    function renderFriendList() {
        const friendListContainer = $("#friend-list-container");
        friendListContainer.empty();
        $.each(friendList, function (i, friend) {
            const friendDiv = $(`
                <div class="friend-item mb-3 p-2 border rounded" style="background-color:white;">
                    <p><strong>${friend.username}</strong></p>
                    <p>${friend.userid}</p>
                </div>
            `);
            friendListContainer.append(friendDiv);
        });
    }
    function saveUsersToLocalStorage() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function saveFriendListToLocalStorage() {
        localStorage.setItem('friendList', JSON.stringify(friendList));
    }
    $('#removeuser').on('click', function () {
        localStorage.clear();
        window.location.reload();  
        alert('All user list and friend has been removed');
    });
  $('#recordTableBody').on('click', '.add-to-cart', function () {
    const productDiv = $(this).closest('.product');
    const productId = productDiv.find('p').eq(1).text().split(': ')[1];
    const productName = productDiv.find('.to').text();
    const productImage = productDiv.find('img').attr('src');
    const productPrice = parseFloat(productDiv.find('.price').text());

    if (!selectedUser) {
        alert('Please select a user first by clicking "Show Products".');
        return;
    }

    const user = users.find(u => u.username === selectedUser);
    if (user) {
        const existingProduct = user.products.find(p => p.id === productId);
        if (existingProduct) {
            existingProduct.quantity += 1; 
        } else {
            user.products.push({ id: productId, name: productName, image: productImage, price: productPrice, quantity: 1 });
        }
        saveUsersToLocalStorage();
        alert('Product added to the cart.');
    }
});
$('#confirmCart').on('click', function () {
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = 'cart.html';
});
});
