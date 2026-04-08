// Configuração da API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : window.location.origin + '/api';

// Menu Data (será carregado do Google Sheets)
let menuData = [];
let estoqueData = [];

// Cart State
let cart = [];
let currentCategory = 'todos';

// DOM Elements
const menuGrid = document.getElementById('menuGrid');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.createElement('div');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadMenuFromSheets();
        renderMenu();
        setupEventListeners();
        setupOverlay();
        loadCartFromStorage();
        updateCartUI();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        // Tentar novamente uma vez antes de usar fallback
        try {
            console.log('Tentando recarregar o cardápio...');
            await loadMenuFromSheets();
            renderMenu();
        } catch (retryError) {
            console.error('Falha na segunda tentativa, usando fallback:', retryError);
            loadFallbackMenu();
            renderMenu();
        }
        setupEventListeners();
        setupOverlay();
        loadCartFromStorage();
        updateCartUI();
    }
}

// Carregar menu do Google Sheets
async function loadMenuFromSheets() {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        if (!response.ok) {
            throw new Error('Falha ao carregar cardápio');
        }
        
        const data = await response.json();
        
        // Converter dados do Sheets para formato esperado
        menuData = data.map((item, index) => {
            console.log(`Item ${index}:`, item);
            console.log(`Chaves disponíveis:`, Object.keys(item));
            
            const precoBruto = item.Preço || item.preco || '0';
            const precoLimpo = precoBruto.toString().replace(',', '.');
            const precoConvertido = parseFloat(precoLimpo);
            
            console.log(`Convertendo preço: ${item.Produto} | Bruto: ${precoBruto} | Limpo: ${precoLimpo} | Convertido: ${precoConvertido}`);
            
            const result = {
                name: item.Produto || item.produto || item.nome || '',
                price: precoConvertido,
                category: item.Categoria || item.categoria || 'executivos',
                special: (item.Especial || item.especial || '').toLowerCase() === 'sim',
                available: (item.Disponível || item.disponivel || 'sim').toLowerCase() === 'sim',
                ingredients: item.Ingredientes || item.ingredientes || '',
                description: item.descricao || 'Marmita artesanal com 600g de pura qualidade',
                rowIndex: item.row_index
            };
            
            console.log(`Result ${index}:`, result);
            return result;
        });
        
        console.log('Dados brutos do Sheets:', data.slice(0, 3)); // Mostrar primeiros 3 itens
        console.log('Cardápio processado:', menuData.slice(0, 3)); // Mostrar primeiros 3 itens processados
        console.log('Cardápio carregado do Google Sheets:', menuData);
    } catch (error) {
        console.error('Erro ao carregar menu do Sheets:', error);
        throw error;
    }
}

// Menu fallback em caso de falha da API
function loadFallbackMenu() {
    menuData = [
        // Pratos Executivos
        { name: "Tilápia ao Molho Belle Meunière", price: 49.90, category: "executivos", special: false, available: true },
        { name: "Filé de Peixe do Rei", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Filé de Frango Grelhado", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Espaguete à Bolonhesa", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Frango à Parmegiana", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Jardineira do Rei", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Strogonoff de Frango", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Strogonoff de Carne", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Almôndegas do Rei", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Carne Assada com Batata", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Rabada do Rei", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Bife Acebolado à Cavalo", price: 39.90, category: "executivos", special: false, available: true },
        { name: "Feijoada do Rei", price: 39.90, category: "executivos", special: false, available: true },
        
        // Massas
        { name: "Risoto de Camarão", price: 49.90, category: "massas", special: true, available: true },
        { name: "Bobó de Camarão", price: 49.90, category: "massas", special: true, available: true },
        { name: "Talharim ao Molho Branco com Camarão", price: 49.90, category: "massas", special: true, available: true },
        { name: "Camarão ao Catupiry", price: 49.90, category: "massas", special: true, available: true },
        { name: "Salmão Grelhado", price: 59.90, category: "massas", special: true, available: true },
        { name: "Paella do Rei", price: 49.90, category: "massas", special: true, available: true },
        { name: "Arroz de Polvo", price: 49.90, category: "massas", special: true, available: true },
        { name: "Medalhão de Salmão", price: 39.90, category: "massas", special: false, available: true },
        
        // Bacalhau
        { name: "Arroz de Bacalhau", price: 49.90, category: "bacalhau", special: true, available: true },
        { name: "Bacalhau Gomes de Sá", price: 59.90, category: "bacalhau", special: true, available: true },
        { name: "Bacalhau com Grão de Bico", price: 59.90, category: "bacalhau", special: true, available: true },
        { name: "Bacalhau Gratinado", price: 59.90, category: "bacalhau", special: true, available: true },
        { name: "Bacalhau à Portuguesa", price: 74.90, category: "bacalhau", special: true, available: true },
        
        // Caldos
        { name: "Caldo Verde", price: 29.90, category: "caldos", special: false, available: true },
        { name: "Caldo de Ervilha", price: 29.90, category: "caldos", special: false, available: true },
        { name: "Canja de Galinha", price: 29.90, category: "caldos", special: false, available: true },
        { name: "Caldo de Frutos do Mar", price: 39.90, category: "caldos", special: true, available: true }
    ];
}

function setupOverlay() {
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', function() {
        closeCart();
    });
}

function setupEventListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            setActiveCategory(category);
            filterMenu(category);
        });
    });
    
    // Smooth scroll for menu link
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.menu-item').forEach(item => {
        observer.observe(item);
    });
}

function renderMenu() {
    menuGrid.innerHTML = '';
    
    const filteredItems = currentCategory === 'todos' 
        ? menuData 
        : menuData.filter(item => item.category === currentCategory);
    
    filteredItems.forEach((item, index) => {
        const menuItem = createMenuItem(item, index);
        menuGrid.appendChild(menuItem);
    });
    
    // Re-observe new elements
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        observer.observe(item);
    });
}

function createMenuItem(item, index) {
    const menuItem = document.createElement('div');
    menuItem.className = `menu-item ${item.special ? 'special' : ''} ${!item.available ? 'unavailable' : ''}`;
    menuItem.style.animationDelay = `${index * 0.1}s`;
    
    // Verificar disponibilidade
    const isAvailable = item.available;
    const hasIngredients = item.ingredients && item.ingredients.trim() !== '';
    
    menuItem.innerHTML = `
        ${item.special ? `<img src="img/logo_selo.png" alt="Selo de Qualidade" class="quality-seal">` : ''}
        ${!isAvailable ? '<span class="unavailable-badge">INDISPONÍVEL</span>' : ''}
        <div class="menu-item-header">
            <h3 class="menu-item-name">${item.name}</h3>
            <p class="menu-item-description">${item.description}</p>
            ${hasIngredients ? `<p class="menu-item-ingredients"><strong>Ingredientes:</strong> ${item.ingredients}</p>` : ''}
            ${!isAvailable ? '<p class="menu-item-status">Produto temporariamente indisponível</p>' : '<p class="menu-item-status">Disponível para pedido</p>'}
        </div>
        <div class="menu-item-footer">
            <span class="menu-item-price">R$ ${item.price.toFixed(2)}</span>
            <button class="add-to-cart ${!isAvailable ? 'disabled' : ''}" 
                    onclick="addToCart('${item.name}', ${item.price})"
                    ${!isAvailable ? 'disabled' : ''}>
                ${isAvailable ? 'Adicionar' : 'Indisponível'}
            </button>
        </div>
    `;
    
    return menuItem;
}

function setActiveCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
}

function filterMenu(category) {
    currentCategory = category;
    renderMenu();
}

function addToCart(name, price) {
    // Verificar se o produto está disponível
    const menuItem = menuData.find(item => item.name === name);
    if (!menuItem || !menuItem.available) {
        showUnavailableError(name);
        return;
    }
    
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToStorage();
    
    // Show feedback
    showAddToCartFeedback(name);
}

function showUnavailableError(itemName) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: var(--shadow-hover);
    `;
    feedback.textContent = `${itemName} está temporariamente indisponível!`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 3000);
}

function showAddToCartFeedback(itemName) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary);
        color: var(--dark);
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: var(--shadow-hover);
    `;
    feedback.textContent = `${itemName} adicionado ao carrinho!`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 2000);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
    saveCartToStorage();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeCart() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
}

async function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Validar disponibilidade final antes de finalizar
    for (let cartItem of cart) {
        const menuItem = menuData.find(item => item.name === cartItem.name);
        if (!menuItem || !menuItem.available) {
            alert(`${cartItem.name} não está mais disponível! Por favor, remova este item do carrinho.`);
            return;
        }
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Salvar pedido no Google Sheets
    try {
        const pedidoData = {
            cliente: 'Cliente Web',
            itens: cart,
            total: total,
            data_pedido: new Date().toLocaleString('pt-BR')
        };
        
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });
        
        if (!response.ok) {
            console.warn('Pedido não salvo no Sheets, mas continuando com WhatsApp');
        } else {
            console.log('Pedido salvo com sucesso no Google Sheets');
        }
    } catch (error) {
        console.warn('Erro ao salvar pedido no Sheets:', error);
        // Continuar com o WhatsApp mesmo se falhar o salvamento
    }
    
    // Gerar mensagem do WhatsApp
    let message = 'Olá! Gostaria de fazer um pedido:%0A%0A';
    
    cart.forEach(item => {
        message += `*${encodeURIComponent(item.name)}* x ${item.quantity}%0A`;
    });
    
    message += `%0A%0A*Total: R$ ${total.toFixed(2).replace('.', ',')}*%0A%0A`;
    message += 'Podem confirmar o pedido e o tempo de entrega?';
    
    const whatsappUrl = `https://wa.me/5511922048764?text=${encodeURIComponent(message)}`;
    
    // Limpar carrinho após pedido
    cart = [];
    updateCartUI();
    saveCartToStorage();
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
}

function scrollToMenu() {
    const menuSection = document.getElementById('menu');
    menuSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Função para recarregar manualmente o cardápio
async function reloadMenu() {
    try {
        console.log('Recarregando cardápio manualmente...');
        await loadMenuFromSheets();
        renderMenu();
        console.log('Cardápio recarregado com sucesso!');
    } catch (error) {
        console.error('Erro ao recarregar cardápio:', error);
        alert('Erro ao recarregar cardápio. Tente novamente.');
    }
}

// Adicionar atalho de teclado para recarregar (Ctrl+Shift+R)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        reloadMenu();
    }
});

function saveCartToStorage() {
    localStorage.setItem('oReiDoBacalhauCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('oReiDoBacalhauCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth parallax effect to hero
window.addEventListener('scroll', debounce(function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}, 10));

// Add loading states
function showLoadingState(element) {
    element.classList.add('loading');
}

function removeLoadingState(element) {
    element.classList.remove('loading');
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
        closeCart();
    }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        // Swipe left - close cart if open
        if (cartSidebar.classList.contains('open')) {
            closeCart();
        }
    }
    
    if (touchEndX > touchStartX + 50) {
        // Swipe right - could open cart if near right edge
        if (touchStartX > window.innerWidth - 100) {
            toggleCart();
        }
    }
}
