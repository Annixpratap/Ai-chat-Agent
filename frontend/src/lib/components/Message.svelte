<script lang="ts">
  import type { Message as MessageType } from '../types';

  export let message: MessageType;

  const isUser = message.sender === 'user';
  const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
</script>

<div class="message-container" class:user={isUser} class:ai={!isUser}>
  <div class="message-bubble">
    <p class="message-text">{message.text}</p>
    <span class="message-time">{time}</span>
  </div>
</div>

<style>
  .message-container {
    display: flex;
    margin-bottom: 1.5rem;
    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-container.user {
    justify-content: flex-end;
  }

  .message-container.ai {
    justify-content: flex-start;
  }

  .message-bubble {
    max-width: 70%;
    padding: 1rem 1.25rem;
    border-radius: 1.25rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-shadow: var(--shadow-md);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .message-container.user .message-bubble {
    background: var(--primary-gradient);
    color: white;
    border-bottom-right-radius: 0.25rem;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .message-container.ai .message-bubble {
    background: var(--bg-primary);
    color: var(--gray-900);
    border: 1.5px solid var(--gray-200);
    border-bottom-left-radius: 0.25rem;
  }

  .message-text {
    margin: 0;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message-time {
    display: block;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    opacity: 0.6;
    font-weight: 500;
  }

  .message-container.user .message-time {
    text-align: right;
  }

  @media (max-width: 640px) {
    .message-bubble {
      max-width: 85%;
      padding: 0.875rem 1rem;
    }

    .message-container {
      margin-bottom: 1.25rem;
    }
  }
</style>
