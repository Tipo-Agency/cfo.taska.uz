
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from "../constants";

export const sendTelegramNotification = async (message: string) => {
  // HARDCODE: Всегда берем ID из констант, игнорируем настройки.
  const chatId = TELEGRAM_CHAT_ID;
  
  if (!chatId) {
      console.warn('[TELEGRAM BOT] Chat ID не найден в константах.');
      return false;
  }

  console.log(`[TELEGRAM BOT] Отправка в чат ${chatId}`);

  // FIX: Используем CORS прокси, так как браузер блокирует прямые запросы к api.telegram.org
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  // Используем надежный прокси для обхода CORS
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(telegramUrl)}`;
  
  try {
    // Попытка 1: Через прокси (GET запрос часто проходит лучше)
    const urlWithParams = `${proxyUrl}&chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=HTML`;
    
    const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Proxy Error: ${response.status}`);
    }

    console.log('[TELEGRAM BOT] Успешно отправлено (Proxy)');
    return true;
  } catch (error) {
    console.warn('[TELEGRAM BOT] Ошибка прокси, пробую напрямую...', error);
    
    // Попытка 2: Напрямую (может сработать если отключен CORS в браузере или локально)
    try {
        await fetch(telegramUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: message, 
                parse_mode: 'HTML' 
            })
        });
        console.log('[TELEGRAM BOT] Успешно отправлено (Direct)');
        return true;
    } catch (e) {
        console.error("[TELEGRAM BOT] Все методы отправки не сработали", e);
    }
    return false;
  }
};

// Helper to format the status message
export const formatStatusChangeMessage = (taskTitle: string, oldStatus: string, newStatus: string, user: string) => {
  return `🔔 <b>Обновление статуса</b>\n\n👤 <b>Сотрудник:</b> ${user}\n📝 <b>Задача:</b> ${taskTitle}\n🔄 <b>Статус:</b> ${oldStatus} ➡️ ${newStatus}`;
};

// Helper to format the new task message
export const formatNewTaskMessage = (taskTitle: string, priority: string, endDate: string, assignee: string, project: string | null) => {
    return `🆕 <b>Новая задача</b>\n\n👤 <b>Ответственный:</b> ${assignee}\n📝 <b>Задача:</b> ${taskTitle}\n📂 <b>Модуль:</b> ${project || 'Без модуля'}\n⚡ <b>Приоритет:</b> ${priority}\n📅 <b>Срок:</b> ${endDate}`;
};
