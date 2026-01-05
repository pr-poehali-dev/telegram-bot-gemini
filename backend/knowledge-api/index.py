import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления базой знаний бота'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            # Получить все записи
            cur.execute("""
                SELECT id, category, question, answer, keywords, 
                       created_at, updated_at
                FROM knowledge_base
                ORDER BY category, created_at DESC
            """)
            items = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(items, default=str)
            }
        
        elif method == 'POST':
            # Создать новую запись
            body = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO knowledge_base (category, question, answer, keywords)
                VALUES (%s, %s, %s, %s)
                RETURNING id, category, question, answer, keywords, created_at
            """, (
                body['category'],
                body['question'],
                body['answer'],
                body.get('keywords', [])
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str)
            }
        
        elif method == 'PUT':
            # Обновить запись
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            
            cur.execute("""
                UPDATE knowledge_base
                SET category = %s, question = %s, answer = %s, keywords = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, category, question, answer, keywords, updated_at
            """, (
                body['category'],
                body['question'],
                body['answer'],
                body.get('keywords', []),
                item_id
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str)
            }
        
        elif method == 'DELETE':
            # Удалить запись
            params = event.get('queryStringParameters', {})
            item_id = params.get('id')
            
            cur.execute("DELETE FROM knowledge_base WHERE id = %s", (item_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'ok': True})
            }
        
        cur.close()
        conn.close()
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
