document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('adminItemsList');

    async function loadItems() {
        try {
            const response = await fetch('/api/admin/items');
            const items = await response.json();

            if (!response.ok) {
                itemsList.innerHTML = items.message || 'Could not load items.';
                return;
            }

            renderItems(items);

        } catch (error) {
            console.error('Error loading items:', error);
            itemsList.innerHTML = 'Could not load items.';
        }
    }

    function renderItems(items) {
        itemsList.innerHTML = '';

        if (items.length === 0) {
            itemsList.innerHTML = '<p>No reported items found.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');

            card.innerHTML = `
                <h3>${escapeHTML(item.itemName || '')}</h3>
                <p><strong>Type:</strong> ${escapeHTML(item.type || '')}</p>
                <p><strong>Category:</strong> ${escapeHTML(item.category || '')}</p>
                <p><strong>Location:</strong> ${escapeHTML(item.location || '')}</p>
                <p><strong>Date:</strong> ${escapeHTML(item.date || '')}</p>
                <p><strong>Reported by:</strong> ${escapeHTML(item.studentName || 'Unknown')}</p>
                <button class="delete-btn">Delete Item</button>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                deleteItem(item._id);
            });

            itemsList.appendChild(card);
        });
    }

    async function deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/items/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                alert('Item deleted successfully!');
                loadItems();
            } else {
                alert(result.message || 'Could not delete item.');
            }

        } catch (error) {
            console.error('Delete error:', error);
            alert('Something went wrong.');
        }
    }

    function escapeHTML(value) {
        const div = document.createElement('div');
        div.textContent = String(value);
        return div.innerHTML;
    }

    loadItems();
});
