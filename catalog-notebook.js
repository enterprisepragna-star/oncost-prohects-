document.addEventListener('DOMContentLoaded', () => {
  // 1. PDF Import
  const btnImportPdf = document.getElementById('btn-import-pdf');
  const pdfUpload = document.getElementById('pdf-upload');
  
  if (btnImportPdf && pdfUpload) {
    btnImportPdf.addEventListener('click', () => {
      pdfUpload.click();
    });

    pdfUpload.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const fileName = e.target.files[0].name;
        
        // Show simulated loading state
        const originalText = btnImportPdf.innerHTML;
        btnImportPdf.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Parsing ${fileName}...`;
        btnImportPdf.disabled = true;

        setTimeout(() => {
          btnImportPdf.innerHTML = originalText;
          btnImportPdf.disabled = false;
          
          // Add dummy notebook products
          addDummyNotebooks();
          
          alert(`Successfully categorized 10 notebook items from ${fileName}!`);
        }, 2000);

        // Reset so it can be triggered again
        e.target.value = '';
      }
    });

  async function loadCatalog() {
    try {
      // Fetch from Supabase catalog table
      const { data: notebooks, error } = await window.supabaseClient
        .from('catalog')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const productList = document.querySelector('.product-list');
      productList.innerHTML = ''; // Clear existing items
      
      notebooks.forEach(nb => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // Map Supabase fields to the layout
        const imageSrc = nb.image_url ? nb.image_url : 'https://via.placeholder.com/150x100?text=' + encodeURIComponent(nb.id);
        const code = nb.id;
        const name = nb.name;
        const desc = nb.description || '';
        const price = nb.price || 1280;

        card.innerHTML = `
          <div class="card-image">
            <img src="${imageSrc}" alt="${code}" />
          </div>
          <div class="card-details">
            <div class="product-code">${code}</div>
            <div class="product-name">${name}</div>
            <div class="product-desc">${desc}</div>
            <div class="product-meta">SG COST ₹ 1000</div>
          </div>
          <div class="card-price">
            <span class="currency">₹</span> <span class="price-val">${price}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline btn-sm"><i class="fas fa-pen"></i> Edit Price</button>
            <button class="btn btn-outline btn-sm"><i class="fas fa-file-alt"></i> Edit Details</button>
            <button class="btn btn-outline btn-sm"><i class="fas fa-upload"></i> Upload Image</button>
            <button class="btn btn-icon"><i class="fas fa-eye"></i></button>
          </div>
        `;
        productList.appendChild(card);
      });

      const descEl = document.querySelector('.page-desc');
      if (descEl) {
        const cards = productList.querySelectorAll('.product-card').length;
        descEl.innerHTML = `${cards} items. Click <strong>Edit Price</strong> to override a price or <strong>Upload Image</strong> to replace the supplier photo.`;
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      const productList = document.querySelector('.product-list');
      productList.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Could not load the catalog from Supabase. Make sure you have imported catalog_supabase.csv into the products table!</p>`;
    }
  }

  // Load immediately on page load
  loadCatalog();

  // 2. Sorting
  const btnSortCode = document.getElementById('btn-sort-code');
  const btnSortPriceUp = document.getElementById('btn-sort-price-up');
  const btnSortPriceDown = document.getElementById('btn-sort-price-down');
  const productList = document.querySelector('.product-list');

  function sortCards(compareFn) {
    const cards = Array.from(productList.querySelectorAll('.product-card'));
    cards.sort(compareFn);
    // Re-append to DOM in new order
    cards.forEach(card => productList.appendChild(card));
  }

  if (btnSortCode && productList) {
    let ascCode = true;
    btnSortCode.addEventListener('click', () => {
      sortCards((a, b) => {
        const codeA = a.querySelector('.product-code').textContent.trim();
        const codeB = b.querySelector('.product-code').textContent.trim();
        return ascCode ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
      });
      ascCode = !ascCode;
      btnSortCode.innerHTML = `<i class="fas fa-sort-alpha-${ascCode ? 'down' : 'up'}"></i> Code`;
    });
  }

  if (btnSortPriceUp && btnSortPriceDown && productList) {
    const getPrice = (card) => {
      const priceText = card.querySelector('.card-price').childNodes[2].textContent.trim().replace(/,/g, '');
      return parseInt(priceText, 10) || 0;
    };

    btnSortPriceUp.addEventListener('click', () => {
      sortCards((a, b) => getPrice(a) - getPrice(b));
    });

    btnSortPriceDown.addEventListener('click', () => {
      sortCards((a, b) => getPrice(b) - getPrice(a));
    });
  }

  // 3. Searching
  const searchInput = document.getElementById('search-input');
  if (searchInput && productList) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const cards = productList.querySelectorAll('.product-card');
      
      let visibleCount = 0;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = 'grid';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Update count text
      const descEl = document.querySelector('.page-desc');
      if (descEl) {
        descEl.innerHTML = `${visibleCount} items. Click <strong>Edit Price</strong> to override a price or <strong>Upload Image</strong> to replace the supplier photo.`;
      }
    });
  }

  // 4. Action Buttons on Cards
  const imageUpload = document.getElementById('image-upload');
  let currentImageCard = null;

  if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
      if (e.target.files.length > 0 && currentImageCard) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        const img = currentImageCard.querySelector('.card-image img');
        if (img) img.src = url;
        e.target.value = '';
        currentImageCard = null;
      }
    });
  }

  productList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.product-card');
    if (!card) return;

    const actionText = btn.textContent.trim();

    if (actionText === 'Edit Price' || btn.querySelector('.fa-pen')) {
      const priceValNode = card.querySelector('.price-val');
      const currentPrice = priceValNode.textContent.trim();
      const newPrice = prompt('Enter new price:', currentPrice);
      if (newPrice !== null && newPrice.trim() !== '') {
        priceValNode.textContent = newPrice;
      }
    } 
    else if (actionText === 'Edit Details' || btn.querySelector('.fa-file-alt')) {
      const descNode = card.querySelector('.product-desc');
      const currentDesc = descNode.textContent.trim();
      const newDesc = prompt('Enter new details:', currentDesc);
      if (newDesc !== null) {
        descNode.textContent = newDesc;
      }
    }
    else if (actionText === 'Upload Image' || btn.querySelector('.fa-upload')) {
      currentImageCard = card;
      if (imageUpload) imageUpload.click();
    }
    else if (btn.classList.contains('btn-icon') || btn.querySelector('.fa-eye')) {
      const code = card.querySelector('.product-code').textContent.trim();
      alert(`Viewing product ${code} on storefront...`);
    }
  });

});
