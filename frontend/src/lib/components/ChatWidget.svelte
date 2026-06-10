<script lang="ts">
  import { onMount } from 'svelte';
  import { messages, loading, error, chatStore } from '../stores/chat';
  import Message from './Message.svelte';
  import ChatInput from './ChatInput.svelte';

  let messagesContainer: HTMLDivElement;
  let initialized = false;

  onMount(async () => {
    await chatStore.initialize();
    initialized = true;
  });

  $: if (messagesContainer && $messages) {
    // Auto-scroll to bottom
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
  }

  async function handleSendMessage(message: string) {
    await chatStore.sendMessage(message);
  }

  function handleClearError() {
    chatStore.clearError();
  }
</script>

<div class="chat-widget">
  <div class="chat-header">
    <h1>TechGear Support</h1>
    <p class="subtitle">AI-Powered Customer Support</p>
  </div>

  <div class="chat-container">
    {#if !initialized}
      <div class="loading-state">
        <div class="spinner" />
        <p>Initializing chat...</p>
      </div>
    {:else if $messages.length === 0}
      <div class="empty-state">
        <div class="welcome-icon">💬</div>
        <h2>Welcome to TechGear Support</h2>
        <p>How can we help you today?</p>
        <div class="suggestions">
          <p class="suggestion-label">Try asking about:</p>
          <ul>
            <li>Shipping policies and delivery times</li>
            <li>Return and refund processes</li>
            <li>Product recommendations</li>
            <li>Support hours and contact information</li>
          </ul>
        </div>
      </div>
    {:else}
      <div bind:this={messagesContainer} class="messages-list">
        {#each $messages as msg (msg.id)}
          <Message message={msg} />
        {/each}

        {#if $loading}
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if $error}
    <div class="error-banner">
      <p>{$error}</p>
      <button on:click={handleClearError} class="error-close">×</button>
    </div>
  {/if}

  <ChatInput onSendMessage={handleSendMessage} />
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-secondary);
    overflow: hidden;
  }

  .chat-header {
    padding: 2.5rem 2rem;
    background: var(--primary-gradient);
    color: white;
    text-align: center;
    flex-shrink: 0;
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
  }

  .chat-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }

  .chat-header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.8px;
    position: relative;
    z-index: 1;
  }

  .subtitle {
    margin: 0.75rem 0 0 0;
    font-size: 1rem;
    opacity: 0.9;
    font-weight: 500;
    letter-spacing: 0.3px;
    position: relative;
    z-index: 1;
  }

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--gray-700);
  }

  .welcome-icon {
    font-size: 5rem;
    margin-bottom: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  .empty-state h2 {
    margin: 0 0 1rem 0;
    font-size: 2rem;
    font-weight: 800;
    color: var(--gray-900);
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .empty-state p {
    margin: 0 0 2.5rem 0;
    color: var(--gray-500);
    font-size: 1.05rem;
    font-weight: 500;
  }

  .suggestions {
    text-align: left;
    background: var(--bg-primary);
    padding: 2rem;
    border-radius: 1.25rem;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
    border: 2px solid transparent;
    background-clip: padding-box;
    background-image: linear-gradient(var(--bg-primary), var(--bg-primary)), var(--primary-gradient);
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }

  .suggestion-label {
    margin: 0 0 1.5rem 0;
    font-weight: 800;
    color: var(--gray-900);
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .suggestion-label::before {
    content: '✨';
  }

  .suggestions ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .suggestions li {
    padding: 1rem;
    color: var(--gray-600);
    border-radius: 0.75rem;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    margin-bottom: 0.75rem;
    cursor: pointer;
    background: var(--bg-secondary);
    border-left: 3px solid var(--primary);
  }

  .suggestions li:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
    color: var(--primary);
    transform: translateX(4px);
    border-left-color: var(--primary);
  }

  .suggestions li:last-child {
    margin-bottom: 0;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--gray-500);
  }

  .messages-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
  }

  .typing-indicator {
    display: flex;
    gap: 0.6rem;
    padding: 1.5rem;
    align-items: center;
    justify-content: flex-start;
  }

  .typing-indicator span {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: var(--primary);
    animation: bounce 1.4s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    40% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  .error-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background: var(--accent-gradient);
    color: white;
    box-shadow: var(--shadow-lg);
    border-radius: 0.75rem;
    margin: 0 1.5rem;
  }

  .error-banner p {
    margin: 0;
    flex: 1;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .error-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 0.5rem;
  }

  .error-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .spinner {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    border: 3px solid rgba(99, 102, 241, 0.2);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .chat-widget {
      border-radius: 0;
    }

    .chat-header {
      padding: 2rem 1.5rem;
    }

    .chat-header h1 {
      font-size: 1.5rem;
    }

    .chat-container {
      padding: 1.5rem;
    }

    .suggestions {
      max-width: 100%;
    }

    .welcome-icon {
      font-size: 3.5rem;
    }

    .empty-state h2 {
      font-size: 1.5rem;
    }
  }
</style>
