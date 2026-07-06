// ✨ 1. MAIN FETCH FUNCTION (Safely handled)
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    
    // Debugging: Backend response എന്താണെന്ന് കാണാൻ
    console.log("Backend Response (Customer UI):", data); 

    // Safe fallback: products ഇല്ലെങ്കിൽ empty array ആക്കും
    const products = data.products || []; 

    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if (products.length === 0) {
        grid.innerHTML = "<p style='color: #888; text-align: center; width: 100%;'>No masterpiece collections available right now.</p>";
        return;
    }

    products.forEach(product => {
      const imageUrl = product.images?.[0]?.url || product.image || '';
      
      grid.innerHTML += `
        <div class="product-card hover-glow reveal-target">
          <div class="product-img-wrapper">
            <img src="${imageUrl}" class="inner-img product-image" alt="${product.name}">
          </div>

          <div class="product-info">
            <span class="category">${product.category}</span>
            <h3>${product.name}</h3>
            <div class="price-row">
              <span class="price">₹${product.price}</span>
              <button class="add-to-cart magnetic-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    });

    // 2. Attach animations and events to the newly generated HTML
    initializeProductInteractions();

  } catch (err) {
    console.error("Error loading products:", err);
  }
}
