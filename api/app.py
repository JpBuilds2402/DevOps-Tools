from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
import requests
import urllib.parse

app = Flask(__name__)
CORS(app)

DB_HOST = os.environ.get('DB_HOST', 'db')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASS = os.environ.get('DB_PASS', 'senha123')
DB_NAME = os.environ.get('DB_NAME', 'catalogo')

def get_db_connection():
    return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)

def buscar_imagem_wikipedia(titulo):
    try:
        # 1. Adicionamos uma identidade (User-Agent) para a Wikipedia não bloquear a gente
        headers = {
            'User-Agent': 'CatalogoDevOpsApp/1.0 (projeto-academico-joao)'
        }
        
        # 2. Buscamos apenas pelo título para ser mais direto (ex: "Minecraft")
        search_url = f"https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(titulo)}&utf8=&format=json"
        search_res = requests.get(search_url, headers=headers, timeout=5).json()
        
        if search_res.get('query', {}).get('search'):
            melhor_titulo = search_res['query']['search'][0]['title']
            
            img_url = f"https://pt.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(melhor_titulo)}&prop=pageimages&format=json&pithumbsize=500"
            img_res = requests.get(img_url, headers=headers, timeout=5).json()
            pages = img_res.get('query', {}).get('pages', {})
            
            for page_id in pages:
                if 'thumbnail' in pages[page_id]:
                    return pages[page_id]['thumbnail']['source']
    except Exception as e:
        # O flush=True garante que o erro apareça na hora no log do Docker
        print(f"Erro na Wikipedia: {e}", flush=True) 
    
    return ""

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS itens (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(100) NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            imagem_url TEXT
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()

@app.route('/api/itens', methods=['GET', 'POST'])
def itens():
    init_db()
    if request.method == 'POST':
        dados = request.json
        # Agora passamos apenas o título para a função
        imagem_url = buscar_imagem_wikipedia(dados['titulo'])
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO itens (titulo, categoria, imagem_url) VALUES (%s, %s, %s) RETURNING id, titulo, categoria, imagem_url', 
                   (dados['titulo'], dados['categoria'], imagem_url))
        novo = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'id': novo[0], 'titulo': novo[1], 'categoria': novo[2], 'imagem_url': novo[3]}), 201
        
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM itens ORDER BY id DESC;')
    itens = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{'id': i[0], 'titulo': i[1], 'categoria': i[2], 'imagem_url': i[3]} for i in itens])

@app.route('/api/itens/<int:id>', methods=['PUT', 'DELETE'])
def gerenciar_item(id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    if request.method == 'DELETE':
        cur.execute('DELETE FROM itens WHERE id = %s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Excluído com sucesso'}), 200
        
    if request.method == 'PUT':
        dados = request.json
        # Busca a imagem novamente se houver edição
        imagem_url = buscar_imagem_wikipedia(dados['titulo'])
        
        cur.execute('UPDATE itens SET titulo = %s, categoria = %s, imagem_url = %s WHERE id = %s', 
                   (dados['titulo'], dados['categoria'], imagem_url, id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Atualizado com sucesso'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)