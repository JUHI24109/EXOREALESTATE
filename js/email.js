// Contact form helper (Firestore-backed)
// This replaces placeholder EmailJS IDs and stores inquiries server-side.

window.initEmailJS = function() {
  // Backward-compatible no-op; kept for existing calls.
};

function notifyEmailStatus(message) {
  if (window.notifyCardAction) {
    window.notifyCardAction(message);
    return;
  }
  const node = document.createElement('div');
  node.textContent = message;
  node.style.position = 'fixed';
  node.style.bottom = '24px';
  node.style.right = '24px';
  node.style.zIndex = '9999';
  node.style.padding = '10px 14px';
  node.style.borderRadius = '10px';
  node.style.background = 'rgba(15,23,42,0.92)';
  node.style.color = '#fff';
  node.style.fontSize = '13px';
  node.style.fontWeight = '700';
  document.body.appendChild(node);
  setTimeout(() => {
    node.style.transition = 'opacity 0.2s ease';
    node.style.opacity = '0';
    setTimeout(() => node.remove(), 220);
  }, 1600);
}

window.sendContactEmail = async function(form) {
  if (!form || typeof form.querySelector !== 'function') {
    notifyEmailStatus('Unable to submit this form.');
    return;
  }

  try {
    if (!window.db) {
      throw new Error('Database is not ready. Please try again in a moment.');
    }

    const readVal = function(selectors) {
      for (const sel of selectors) {
        const el = form.querySelector(sel);
        if (el && typeof el.value === 'string' && el.value.trim()) return el.value.trim();
      }
      return '';
    };

    const firstName = readVal(['[name="fname"]', '[name="firstName"]', '#fname', '#first-name']);
    const lastName = readVal(['[name="lname"]', '[name="lastName"]', '#lname', '#last-name']);
    const name = (firstName + ' ' + lastName).trim() || readVal(['[name="name"]', '#name']) || 'Website Visitor';
    const email = readVal(['[name="email"]', '#email']);
    const phone = readVal(['[name="phone"]', '#phone']);
    const message = readVal(['[name="message"]', '#message']);

    if (!email || !message) {
      throw new Error('Please provide both email and message.');
    }

    await window.db.collection('inquiries').add({
      source: 'contact_form',
      name: name,
      email: email,
      phone: phone,
      message: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    notifyEmailStatus('Message sent successfully. Our team will contact you soon.');
    form.reset();
  } catch (error) {
    console.error('Contact submit error:', error);
    notifyEmailStatus(error.message || 'Error sending message. Try WhatsApp.');
  }
};
