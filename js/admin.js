(function () {
  const config = window.ADMIN_CONFIG || {};
  const csrfToken = config.csrfToken;
  const galleryModal = document.querySelector('[data-gallery-modal]');
  const galleryGrid = document.querySelector('[data-gallery-grid]');
  const galleryPagination = document.querySelector('[data-gallery-pagination]');
  const selectedLabel = document.querySelector('[data-selected-label]');
  const existingImageInput = document.getElementById('existing_image');
  const previewModal = document.querySelector('[data-preview-modal]');
  const previewBody = document.querySelector('[data-preview-body]');
  const form = document.querySelector('.form');
  const table = document.querySelector('[data-draggable]');

  function showAlert(message) {
    window.alert(message);
  }

  // Drag and drop sorting
  if (table) {
    const tbody = table.querySelector('tbody');
    let draggingRow = null;

    Array.from(tbody.querySelectorAll('tr')).forEach((row) => {
      row.setAttribute('draggable', 'true');
    });

    tbody.addEventListener('dragstart', (event) => {
      const handle = event.target.closest('.handle');
      const row = event.target.closest('tr');
      if (!handle || !row) {
        event.preventDefault();
        return;
      }
      draggingRow = row;
      event.dataTransfer.effectAllowed = 'move';
      row.classList.add('dragging');
    });

    tbody.addEventListener('dragover', (event) => {
      if (!draggingRow) {
        return;
      }
      event.preventDefault();
      const targetRow = event.target.closest('tr');
      if (!targetRow || targetRow === draggingRow) {
        return;
      }
      const rect = targetRow.getBoundingClientRect();
      const offset = event.clientY - rect.top;
      const midpoint = rect.height / 2;
      if (offset > midpoint) {
        targetRow.after(draggingRow);
      } else {
        targetRow.before(draggingRow);
      }
    });

    tbody.addEventListener('dragend', () => {
      if (!draggingRow) {
        return;
      }
      draggingRow.classList.remove('dragging');
      draggingRow = null;
      persistOrder();
    });

    async function persistOrder() {
      if (!csrfToken) {
        return;
      }
      const ids = Array.from(tbody.querySelectorAll('tr')).map((row) => row.getAttribute('data-id'));
      try {
        const response = await fetch('dashboard.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sort',
            order: ids,
            csrf_token: csrfToken,
          }),
        });
        const data = await response.json();
        if (!data.success) {
          showAlert(data.error || 'Unable to save order.');
        }
      } catch (error) {
        showAlert('Network error while saving order.');
      }
    }
  }

  // Toggle active status
  document.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      if (!id || !csrfToken) {
        return;
      }
      try {
        const response = await fetch('dashboard.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'toggle',
            id,
            csrf_token: csrfToken,
          }),
        });
        const data = await response.json();
        if (data.success) {
          const row = button.closest('tr');
          const status = row.querySelector('.status');
          if (status.classList.contains('active')) {
            status.classList.remove('active');
            status.classList.add('inactive');
            status.textContent = 'Inactive';
          } else {
            status.classList.remove('inactive');
            status.classList.add('active');
            status.textContent = 'Active';
          }
        } else {
          showAlert(data.error || 'Unable to toggle slide.');
        }
      } catch (error) {
        showAlert('Network error while toggling slide.');
      }
    });
  });

  // Gallery modal helpers
  let galleryPage = 1;
  const galleryPageSize = 20;

  async function loadGallery(page) {
    if (!galleryModal || !galleryGrid || !galleryPagination) {
      return;
    }
    try {
      const response = await fetch(`gallery_selector.php?page=${page}&limit=${galleryPageSize}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = await response.json();
      if (!data.success) {
        galleryGrid.innerHTML = '<p class="muted">Unable to load gallery.</p>';
        return;
      }
      galleryGrid.innerHTML = '';
      data.images.forEach((image) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.filename = image.name;
        button.innerHTML = `
          <img src="${image.thumbnail}" alt="${image.name}">
          <span>${image.name}</span>
          ${image.inUse ? '<small class="muted">In use</small>' : ''}
        `;
        if (existingImageInput && existingImageInput.value === image.name) {
          button.classList.add('selected');
        }
        button.addEventListener('click', () => {
          if (!existingImageInput || !selectedLabel) {
            return;
          }
          existingImageInput.value = image.name;
          selectedLabel.textContent = image.name;
          Array.from(galleryGrid.querySelectorAll('button')).forEach((btn) => btn.classList.remove('selected'));
          button.classList.add('selected');
          closeGallery();
        });

        if (!image.inUse) {
          const deleteBtn = document.createElement('button');
          deleteBtn.type = 'button';
          deleteBtn.className = 'btn danger';
          deleteBtn.textContent = 'Delete';
          deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            if (!window.confirm('Delete this image from the gallery?')) {
              return;
            }
            await deleteGalleryImage(image.name);
            loadGallery(galleryPage);
          });
          const footer = document.createElement('div');
          footer.style.display = 'flex';
          footer.style.justifyContent = 'center';
          footer.appendChild(deleteBtn);
          button.appendChild(footer);
        }

        galleryGrid.appendChild(button);
      });
      renderPagination(data.page, data.pages);
    } catch (error) {
      galleryGrid.innerHTML = '<p class="muted">Network error while loading gallery.</p>';
    }
  }

  async function deleteGalleryImage(name) {
    try {
      const response = await fetch('gallery_selector.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          name,
          csrf_token: csrfToken,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        showAlert(data.error || 'Unable to delete image.');
      }
    } catch (error) {
      showAlert('Network error while deleting image.');
    }
  }

  function renderPagination(page, pages) {
    if (!galleryPagination) {
      return;
    }
    galleryPagination.innerHTML = '';
    if (pages <= 1) {
      return;
    }
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'btn secondary';
    prev.textContent = 'Previous';
    prev.disabled = page <= 1;
    prev.addEventListener('click', () => {
      if (page > 1) {
        galleryPage = page - 1;
        loadGallery(galleryPage);
      }
    });

    const info = document.createElement('span');
    info.textContent = `Page ${page} of ${pages}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn secondary';
    next.textContent = 'Next';
    next.disabled = page >= pages;
    next.addEventListener('click', () => {
      if (page < pages) {
        galleryPage = page + 1;
        loadGallery(galleryPage);
      }
    });

    galleryPagination.appendChild(prev);
    galleryPagination.appendChild(info);
    galleryPagination.appendChild(next);
  }

  function openGallery() {
    if (!galleryModal) {
      return;
    }
    galleryModal.hidden = false;
    document.body.style.overflow = 'hidden';
    loadGallery(galleryPage);
  }

  function closeGallery() {
    if (!galleryModal) {
      return;
    }
    galleryModal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-gallery]').forEach((button) => {
    button.addEventListener('click', openGallery);
  });

  document.querySelectorAll('[data-close-gallery]').forEach((button) => {
    button.addEventListener('click', closeGallery);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeGallery();
      closePreview();
    }
  });

  // Preview modal
  let previewObjectUrl = null;

  function openPreview() {
    if (!previewModal || !form) {
      return;
    }
    const title = form.querySelector('#title').value;
    const caption = form.querySelector('#caption').value;
    const link = form.querySelector('#link_url').value;
    const timer = form.querySelector('#slide_timer').value;
    const fileInput = form.querySelector('#image_file');
    let imageSrc = '';

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
      previewObjectUrl = URL.createObjectURL(fileInput.files[0]);
      imageSrc = previewObjectUrl;
    } else if (existingImageInput && existingImageInput.value) {
      imageSrc = `uploads/${existingImageInput.value}`;
    }

    const safeTitle = title || 'Untitled Slide';
    const safeCaption = caption || 'No caption provided.';
    const safeTimer = timer || '5000';

    previewBody.innerHTML = `
      <div class="preview-slide">
        ${imageSrc ? `<img src="${imageSrc}" alt="Preview">` : '<div style="height:240px;display:flex;align-items:center;justify-content:center;background:rgba(148,163,184,0.1);">No image selected</div>'}
        <div class="caption">
          <h3>${escapeHtml(safeTitle)}</h3>
          <p>${escapeHtml(safeCaption)}</p>
          <small>Duration: ${escapeHtml(safeTimer)} ms${link ? ` · Link: ${escapeHtml(link)}` : ''}</small>
        </div>
      </div>
    `;

    previewModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closePreview() {
    if (!previewModal) {
      return;
    }
    previewModal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-preview]').forEach((button) => {
    button.addEventListener('click', openPreview);
  });

  document.querySelectorAll('[data-close-preview]').forEach((button) => {
    button.addEventListener('click', closePreview);
  });

  function escapeHtml(value) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(value).replace(/[&<>"']/g, (match) => map[match]);
  }

  window.addEventListener('beforeunload', () => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
    }
  });
})();
