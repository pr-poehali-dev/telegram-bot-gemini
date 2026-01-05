import json
import os
import urllib.request
import urllib.parse
import urllib.error
import time
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Telegram бот с Gemini 2.5 Flash для ответов на вопросы о релизах'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            # Получаем сообщение от пользователя
            message = body.get('message', {})
            chat_id = message.get('chat', {}).get('id')
            user_id = message.get('from', {}).get('id')
            username = message.get('from', {}).get('username', '')
            text = message.get('text', '')
            
            if not chat_id or not text:
                return {'statusCode': 200, 'body': json.dumps({'ok': True})}
            
            start_time = time.time()
            response_text = ''
            error_msg = None
            
            # Обработка команд
            if text == '/help':
                response_text = """🤖 Доступные команды:

/help - Справка по командам
/info - Информация о боте

Просто задайте любой вопрос о релизах, и я отвечу на основе инструкции по отгрузке! Если не найду ответ в базе знаний, поищу в интернете."""
                send_telegram_message(chat_id, response_text)
            
            elif text == '/info':
                response_text = """ℹ️ О боте:

Я бот-помощник для работы с релизами музыки и клипов. Знаю все требования к отгрузке песен, клипов, видеошотов и текстов.

Моя база знаний включает:
• Требования к файлам и форматам
• Технические характеристики
• Правила оформления текстов
• Сроки и процессы отгрузки

Задавайте вопросы - помогу разобраться! 🎵"""
                send_telegram_message(chat_id, response_text)
            
            else:
                # Получаем всю базу знаний и передаем в Gemini
                try:
                    knowledge = get_all_knowledge()
                    response_text = ask_gemini(text, knowledge)
                    send_telegram_message(chat_id, response_text)
                except Exception as e:
                    error_msg = str(e)
                    response_text = "Ошибка при обработке запроса"
                    send_telegram_message(chat_id, response_text)
            
            # Логируем диалог в БД
            response_time = int((time.time() - start_time) * 1000)
            log_message(chat_id, user_id, username, text, response_text, response_time, error_msg)
            
            return {'statusCode': 200, 'body': json.dumps({'ok': True})}
            
        except Exception as e:
            print(f"Error: {str(e)}")
            return {'statusCode': 200, 'body': json.dumps({'ok': True})}
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'status': 'Bot is running'})
    }


def get_all_knowledge() -> str:
    '''Получает всю базу знаний из БД'''
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT category, question, answer FROM knowledge_base ORDER BY category, id")
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        if not results:
            return ""
        
        # Форматируем базу знаний
        knowledge_text = "БАЗА ЗНАНИЙ:\n\n"
        current_category = None
        
        for row in results:
            if row['category'] != current_category:
                current_category = row['category']
                knowledge_text += f"\n{current_category}:\n"
            
            knowledge_text += f"\nВопрос: {row['question']}\nОтвет: {row['answer']}\n"
        
        return knowledge_text
            
    except Exception as e:
        print(f"DB error: {str(e)}")
        return ""


def ask_gemini(question: str, knowledge: str = "") -> str:
    '''Отправляет вопрос в Gemini API через прокси'''
    
    api_key = os.environ.get('GEMINI_API_KEY')
    proxy_url = os.environ.get('PROXY_URL')
    
    # Системный промпт с базой знаний
    system_context = f"""Ты помощник по релизам музыки. Отвечай прямо на вопрос пользователя, без лишних приветствий.

ВАЖНО:
- Читай вопрос пользователя и отвечай КОНКРЕТНО на него
- Не здоровайся каждый раз
- Будь лаконичным
- Используй информацию из базы знаний ниже для ответов
- Отвечай БЕЗ markdown форматирования (без ** и других спецсимволов)

{knowledge}"""

    try:
        # Формируем запрос к Gemini API
        url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}'
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": system_context},
                    {"text": f"Вопрос пользователя: {question}"}
                ]
            }],
            "generationConfig": {
                "temperature": 0.9,
                "maxOutputTokens": 1000
            }
        }
        
        data = json.dumps(payload).encode('utf-8')
        
        # Настройка прокси
        proxy_handler = urllib.request.ProxyHandler({
            'http': f'http://{proxy_url}',
            'https': f'http://{proxy_url}'
        })
        opener = urllib.request.build_opener(proxy_handler)
        
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        
        with opener.open(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if 'candidates' in result and len(result['candidates']) > 0:
                text = result['candidates'][0]['content']['parts'][0]['text']
                return text
            else:
                return "Извините, не смог получить ответ. Попробуйте переформулировать вопрос."
                
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return f"К сожалению, произошла ошибка при обработке запроса. Попробуйте позже или задайте вопрос по-другому."


def send_telegram_message(chat_id: int, text: str):
    '''Отправляет сообщение в Telegram'''
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    payload = {
        'chat_id': chat_id,
        'text': text
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"Error sending message: {str(e)}")


def log_message(chat_id: int, user_id: int, username: str, message_text: str, bot_response: str, response_time_ms: int, error_message: str = None):
    '''Логирует сообщение в базу данных'''
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            print("DATABASE_URL not set")
            return
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO bot_messages (chat_id, user_id, username, message_text, bot_response, response_time_ms, error_message)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (chat_id, user_id, username, message_text, bot_response, response_time_ms, error_message)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error logging message: {str(e)}")