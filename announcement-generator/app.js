/**
 * Announcement Generator - Main JavaScript Module
 * Handles form management, AI enhancement, and preview generation
 */

// ============================================================
// CONFIGURATION
// ============================================================

const PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    model: 'gemini-2.5-flash-lite',
    hint: '<strong>Google Gemini is free & fast!</strong> Get your API key at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a>',
    keyPrefix: 'AIza'
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    hint: 'Requires billing. Get your API key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a>',
    keyPrefix: 'sk-'
  }
};

const STORAGE_KEYS = {
  title: 'announcement_title',
  type: 'announcement_type',
  whatsNew: 'announcement_whatsNew',
  whyMatters: 'announcement_whyMatters',
  kudos: 'announcement_kudos',
  links: 'announcement_links'
};

// System prompt to enforce output format
const SYSTEM_PROMPT = `You are a professional copywriter helping to enhance product announcements for Slack channels.

CRITICAL RULES:
1. ALWAYS return ONLY a single paragraph - no line breaks, no bullet points, no numbered lists, no multiple paragraphs
2. NEVER offer alternatives or multiple options
3. NEVER include explanations, preambles, or meta-commentary
4. NEVER use markdown formatting
5. Just output the enhanced text directly, nothing else
6. Keep it concise: 2-3 sentences maximum
7. Maintain a professional but friendly tone`;

// ============================================================
// STATE
// ============================================================

let AI_PROMPTS = {};

// DOM Elements (initialized after DOMContentLoaded)
let form, titleField, typeField, whatsNewField, whyMattersField, kudosField;
let linksContainer, addLinkButton, htmlPreview, copyButton;
let apiKeyField, apiKeySection, aiProviderField, apiHint, clearFormButton;

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Load prompts from YAML configuration file
 */
async function loadPrompts() {
  try {
    const response = await fetch('prompts.yml');
    if (!response.ok) {
      throw new Error(`Failed to load prompts: ${response.status}`);
    }
    const yamlText = await response.text();
    AI_PROMPTS = jsyaml.load(yamlText);
  } catch (error) {
    console.error('Error loading prompts:', error);
    // Fallback prompts in case YAML fails to load
    AI_PROMPTS = {
      whatsNew: 'You are helping write a product announcement. Enhance the following "What\'s new" description. Original text: "{text}"',
      whyMatters: 'You are helping write a product announcement. Enhance the following "Why This Matters" explanation. Original text: "{text}"'
    };
  }
}

/**
 * Initialize DOM element references
 */
function initializeElements() {
  form = document.getElementById('announcementForm');
  titleField = document.getElementById('title');
  typeField = document.getElementById('type');
  whatsNewField = document.getElementById('whatsNew');
  whyMattersField = document.getElementById('whyMatters');
  kudosField = document.getElementById('kudos');
  linksContainer = document.getElementById('linksContainer');
  addLinkButton = document.getElementById('addLinkButton');
  htmlPreview = document.getElementById('htmlPreview');
  copyButton = document.getElementById('copyButton');
  apiKeyField = document.getElementById('apiKey');
  apiKeySection = document.getElementById('apiKeySection');
  aiProviderField = document.getElementById('aiProvider');
  apiHint = document.getElementById('apiHint');
  clearFormButton = document.getElementById('clearFormButton');
}

/**
 * Initialize the application
 */
async function init() {
  initializeElements();
  await loadPrompts();
  initializeProvider();
  setupEventListeners();
  loadFormFromStorage();
  updatePreview();
}

// ============================================================
// PROVIDER MANAGEMENT
// ============================================================

/**
 * Initialize the AI provider from localStorage
 */
function initializeProvider() {
  let savedProvider = localStorage.getItem('ai_provider');

  // Fallback if saved provider no longer exists or is invalid
  if (!savedProvider || !PROVIDERS[savedProvider]) {
    savedProvider = 'gemini';
    localStorage.setItem('ai_provider', savedProvider);
  }

  // Set the select value and verify it took effect
  aiProviderField.value = savedProvider;
  if (aiProviderField.value !== savedProvider) {
    aiProviderField.selectedIndex = 0;
  }

  updateProviderHint();
}

/**
 * Update the provider hint and load saved API key
 */
function updateProviderHint() {
  const providerKey = aiProviderField.value || 'gemini';
  const provider = PROVIDERS[providerKey];

  if (!provider) {
    aiProviderField.value = 'gemini';
    return updateProviderHint();
  }

  apiHint.innerHTML = provider.hint;
  apiKeyField.placeholder = `${provider.keyPrefix}...`;

  // Load the saved key for this provider
  const savedKey = localStorage.getItem(`api_key_${providerKey}`);
  apiKeyField.value = savedKey || '';
  updateEnhanceButtons();
}

/**
 * Enable/disable enhance buttons based on API key availability
 */
function updateEnhanceButtons() {
  const hasApiKey = apiKeyField.value.trim().length > 0;
  document.querySelectorAll('.enhance-btn-wrapper').forEach(wrapper => {
    const button = wrapper.querySelector('.enhance-btn');
    const hint = wrapper.querySelector('.api-key-hint');
    button.disabled = !hasApiKey;
    hint.textContent = hasApiKey ? '' : 'Configure API key first';
  });
}

// ============================================================
// STORAGE MANAGEMENT
// ============================================================

/**
 * Save form fields to localStorage
 */
function saveFormToStorage() {
  localStorage.setItem(STORAGE_KEYS.title, titleField.value);
  localStorage.setItem(STORAGE_KEYS.type, typeField.value);
  localStorage.setItem(STORAGE_KEYS.whatsNew, whatsNewField.value);
  localStorage.setItem(STORAGE_KEYS.whyMatters, whyMattersField.value);
  localStorage.setItem(STORAGE_KEYS.kudos, kudosField.value);

  // Save links as JSON array (only non-empty ones)
  const links = [];
  linksContainer.querySelectorAll('.link-item').forEach(linkItem => {
    const text = linkItem.querySelector('.link-text').value.trim();
    const url = linkItem.querySelector('.link-url').value.trim();
    if (text || url) {
      links.push({ text, url });
    }
  });
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

/**
 * Load form fields from localStorage
 */
function loadFormFromStorage() {
  const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
  const savedType = localStorage.getItem(STORAGE_KEYS.type);
  const savedWhatsNew = localStorage.getItem(STORAGE_KEYS.whatsNew);
  const savedWhyMatters = localStorage.getItem(STORAGE_KEYS.whyMatters);
  const savedKudos = localStorage.getItem(STORAGE_KEYS.kudos);
  const savedLinks = localStorage.getItem(STORAGE_KEYS.links);

  if (savedTitle) titleField.value = savedTitle;
  if (savedType) typeField.value = savedType;
  if (savedWhatsNew) whatsNewField.value = savedWhatsNew;
  if (savedWhyMatters) whyMattersField.value = savedWhyMatters;
  if (savedKudos) kudosField.value = savedKudos;

  // Load links
  if (savedLinks) {
    try {
      const links = JSON.parse(savedLinks);
      linksContainer.innerHTML = '';
      if (links.length > 0) {
        links.forEach(link => addLinkField(link.text, link.url, false));
      } else {
        addLinkField('', '', false);
      }
    } catch (e) {
      addLinkField('', '', false);
    }
  } else {
    addLinkField('', '', false);
  }
}

/**
 * Escape HTML to prevent XSS when loading saved values
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Clear form (but not API key)
 */
function clearForm() {
  titleField.value = '';
  typeField.value = 'Feature';
  whatsNewField.value = '';
  whyMattersField.value = '';
  kudosField.value = '';

  // Clear links and add a fresh empty one
  linksContainer.innerHTML = '';
  addLinkField('', '', false);

  // Clear storage for form fields
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  updatePreview();
}

// ============================================================
// AI ENHANCEMENT
// ============================================================

/**
 * Enhance field content using AI
 */
async function enhanceWithAI(fieldId) {
  const field = document.getElementById(fieldId);
  const button = document.querySelector(`[data-field="${fieldId}"]`);
  const apiKey = apiKeyField.value.trim();

  if (!apiKey) {
    apiKeyField.focus();
    alert('Please enter your API key first.');
    return;
  }

  const currentText = field.value.trim();
  if (!currentText) {
    alert('Please enter some text to enhance.');
    field.focus();
    return;
  }

  // Get context from all form fields
  const title = titleField.value || 'Announcement';
  const type = typeField.value;
  const whatsNew = whatsNewField.value.trim() || '(not provided)';
  const whyMatters = whyMattersField.value.trim() || '(not provided)';
  const kudos = kudosField.value.trim() || '(not provided)';

  // Get prompt template from configuration and replace placeholders
  const promptTemplate = AI_PROMPTS[fieldId];
  if (!promptTemplate) {
    alert('No prompt configured for this field.');
    return;
  }

  const prompt = promptTemplate
    .replace('{title}', title)
    .replace('{type}', type)
    .replace('{text}', currentText)
    .replace('{whatsNew}', whatsNew)
    .replace('{whyMatters}', whyMatters)
    .replace('{kudos}', kudos);

  // Get current provider config
  const providerKey = aiProviderField.value;
  const provider = PROVIDERS[providerKey];

  // Show loading state
  button.disabled = true;
  button.classList.add('loading');
  const originalText = button.innerHTML;
  button.innerHTML = '<span class="sparkle">✨</span> Enhancing...';

  try {
    let response, data, enhancedText;

    if (providerKey === 'gemini') {
      // Google Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${apiKey}`;
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '';
        if (response.status === 400 && errorMessage.includes('API key')) {
          throw new Error('Invalid API key. Please check your Google Gemini API key.');
        } else if (response.status === 429) {
          throw new Error(errorMessage || 'Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(errorMessage || `API error: ${response.status}`);
        }
      }

      data = await response.json();
      enhancedText = data.candidates[0].content.parts[0].text.trim();

    } else {
      // OpenAI-compatible API
      response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '';
        if (response.status === 401) {
          throw new Error(`Invalid API key. Please check your ${provider.name} API key.`);
        } else if (response.status === 429) {
          if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
            throw new Error(`${provider.name} quota exceeded. Please check your account billing.`);
          }
          throw new Error(errorMessage || 'Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(errorMessage || `API error: ${response.status}`);
        }
      }

      data = await response.json();
      enhancedText = data.choices[0].message.content.trim();
    }

    // Update the field with enhanced text
    field.value = enhancedText;
    updatePreview();
    saveFormToStorage();

    // Show success feedback
    button.innerHTML = '<span class="sparkle">✅</span> Enhanced!';
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 2000);

  } catch (error) {
    console.error('AI Enhancement error:', error);
    alert(`Enhancement failed: ${error.message}`);
    button.innerHTML = originalText;
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
  }
}

// ============================================================
// PREVIEW
// ============================================================

/**
 * Update the announcement preview
 */
function updatePreview() {
  const title = titleField.value || "Announcement title";
  const type = typeField.value;
  const whatsNew = whatsNewField.value || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const whyMatters = whyMattersField.value || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const kudos = kudosField.value;

  let typeText = '';

  switch (type) {
    case 'Bugfix':
      typeText = '🐞 Bugfix -';
      break;
    case 'Improvement':
      typeText = '✨ Improvement -';
      break;
    case 'Feature':
    default:
      typeText = '🚀 New Feature -';
  }

  // Build HTML preview
  let previewHTML = `
<p><b>${typeText} ${title}</b></p><br/>
<blockquote>🌟 <i><b>Description</b> - What's new?</i></blockquote>${whatsNew}<br><br>
<blockquote>🎯 <i><b>Impact</b> - Why This Matters?</i></blockquote>${whyMatters}<br><br>
`;

  // Add Kudos section if filled
  if (kudos) {
    previewHTML += `<blockquote>🙇 <i><b>Kudos</b> - Thanks for your collaboration</i></blockquote>${kudos}<br><br>`;
  }

  const linkItems = linksContainer.querySelectorAll('.link-item');
  let linksHTML = '';

  linkItems.forEach(link => {
    const linkText = link.querySelector('.link-text').value;
    const linkUrl = link.querySelector('.link-url').value;
    if (linkText && linkUrl) {
      linksHTML += `<li><a href="${linkUrl}" target="_blank">${linkText}</a></li>`;
    }
  });

  if (linksHTML) {
    previewHTML += `<blockquote>🔗 <i><b>Useful links</b></i></blockquote><ul>${linksHTML}</ul>`;
  }

  htmlPreview.innerHTML = previewHTML;
}

// ============================================================
// CLIPBOARD
// ============================================================

/**
 * Copy the preview content to clipboard
 */
function copyToClipboard() {
  const range = document.createRange();
  range.selectNode(htmlPreview);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([htmlPreview.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([htmlPreview.innerText], { type: 'text/plain' })
      })
    ]);
  } catch (err) {
    console.error('Failed to copy rich text: ', err);
  }

  selection.removeAllRanges();
}

// ============================================================
// LINKS MANAGEMENT
// ============================================================

/**
 * Add a new link field with remove button
 */
function addLinkField(text = '', url = '', shouldFocus = false) {
  const linkItem = document.createElement('div');
  linkItem.classList.add('link-item');
  linkItem.innerHTML = `
    <input type="text" class="link-text" placeholder="Link text" value="${escapeHtml(text)}">
    <input type="url" class="link-url" placeholder="https://..." value="${escapeHtml(url)}">
    <button type="button" class="remove-link-btn" title="Remove link">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
  `;

  // Add remove functionality
  const removeBtn = linkItem.querySelector('.remove-link-btn');
  removeBtn.addEventListener('click', () => removeLinkField(linkItem));

  linksContainer.appendChild(linkItem);

  // Focus on the text input if requested
  if (shouldFocus) {
    linkItem.querySelector('.link-text').focus();
  }
}

/**
 * Remove a link field with animation
 */
function removeLinkField(linkItem) {
  // If it's the last link, just clear the fields
  if (linksContainer.querySelectorAll('.link-item').length <= 1) {
    linkItem.querySelector('.link-text').value = '';
    linkItem.querySelector('.link-url').value = '';
    saveFormToStorage();
    updatePreview();
    return;
  }

  // Add removing animation class
  linkItem.classList.add('removing');

  // Remove after animation completes
  linkItem.addEventListener('animationend', () => {
    linkItem.remove();
    saveFormToStorage();
    updatePreview();
  }, { once: true });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Provider change
  aiProviderField.addEventListener('change', () => {
    localStorage.setItem('ai_provider', aiProviderField.value);
    updateProviderHint();
  });

  // API key input
  apiKeyField.addEventListener('input', () => {
    localStorage.setItem(`api_key_${aiProviderField.value}`, apiKeyField.value);
    updateEnhanceButtons();
  });

  // Clear form button
  clearFormButton.addEventListener('click', clearForm);

  // Enhance buttons
  document.querySelectorAll('.enhance-btn').forEach(button => {
    button.addEventListener('click', () => {
      const fieldId = button.getAttribute('data-field');
      enhanceWithAI(fieldId);
    });
  });

  // Add link button
  addLinkButton.addEventListener('click', () => {
    addLinkField('', '', true);
    saveFormToStorage();
  });

  // Form input
  form.addEventListener('input', () => {
    updatePreview();
    saveFormToStorage();
  });

  // Copy button
  copyButton.addEventListener('click', () => {
    copyToClipboard();
    copyButton.textContent = "Copied!";
    copyButton.style.backgroundColor = "#28a745";

    setTimeout(() => {
      copyButton.textContent = "Copy to Clipboard";
      copyButton.style.backgroundColor = "#007a5a";
    }, 2000);
  });
}

// ============================================================
// BOOTSTRAP
// ============================================================

document.addEventListener('DOMContentLoaded', init);

