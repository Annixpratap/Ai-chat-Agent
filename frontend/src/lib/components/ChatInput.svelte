<script lang="ts">
  import { loading } from '../stores/chat';

  let input = '';
  let isSubmitting = false;

  export let onSendMessage: (message: string) => Promise<void>;

  async function handleSend() {
    if (!input.trim() || isSubmitting || $loading) return;

    isSubmitting = true;
    const message = input.trim();
    input = '';

    try {
      await onSendMessage(message);
    } catch (error) {
      // Error is handled by the store and displayed in the UI
      console.error('Failed to send message:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }
</script>

<div class="input-container">
  <textarea
    bind:value={input}
    on:keydown={handleKeyDown}
    placeholder="Ask me anything about TechGear... (Press Enter to send)"
    disabled={isSubmitting || $loading}
    rows="3"
  />
  <button
    on:click={handleSend}
    disabled={!input.trim() || isSubmitting || $loading}
    class="send-button"
  >
    {#if isSubmitting || $loading}
      <span class="spinner" />
      Sending...
    {:else}
      Send
    {/if}
  </button>
</div>

<style>
  .input-container {
    display: flex;
    gap: 1.25rem;
    padding: 1.5rem 2rem;
    background: var(--bg-primary);
    border-top: 2px solid var(--gray-200);
    box-shadow: var(--shadow-lg);
  }

  textarea {
    flex: 1;
    resize: none;
    font-size: 1rem;
    padding: 1rem 1.25rem;
    border: 2px solid var(--gray-200);
    border-radius: 1rem;
    max-height: 140px;
    background: var(--bg-secondary);
    color: var(--gray-900);
    font-family: inherit;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  textarea::placeholder {
    color: var(--gray-400);
    font-weight: 500;
  }

  textarea:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-primary);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  textarea:disabled {
    background-color: var(--gray-100);
    color: var(--gray-500);
    cursor: not-allowed;
    border-color: var(--gray-200);
  }

  .send-button {
    padding: 1rem 2rem;
    background: var(--primary-gradient);
    color: white;
    font-weight: 700;
    white-space: nowrap;
    min-height: 100%;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    border: none;
    font-size: 1rem;
    letter-spacing: 0.3px;
  }

  .send-button:hover:not(:disabled) {
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.45);
    transform: translateY(-2px);
  }

  .send-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .send-button:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .spinner {
    display: inline-block;
    width: 1.1rem;
    height: 1.1rem;
    border: 2.5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .input-container {
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;
    }

    .send-button {
      min-height: auto;
      padding: 1rem;
      font-size: 0.95rem;
    }

    textarea {
      padding: 0.875rem 1rem;
      font-size: 0.95rem;
    }
  }
</style>
