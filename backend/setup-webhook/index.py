import json
import os
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    '''Автоматическая установка webhook для Telegram бота'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'TELEGRAM_BOT_TOKEN не установлен'
            })
        }
    
    # URL бота из окружения или используем стандартный
    bot_url = 'https://functions.poehali.dev/861e295d-e4d2-4c04-8eed-157185096a34'
    
    try:
        # Устанавливаем webhook
        api_url = f'https://api.telegram.org/bot{bot_token}/setWebhook'
        
        data = json.dumps({'url': bot_url}).encode('utf-8')
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Webhook успешно установлен',
                        'webhook_url': bot_url,
                        'bot_info': result.get('description', '')
                    })
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': result.get('description', 'Неизвестная ошибка')
                    })
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка при установке webhook: {str(e)}'
            })
        }
