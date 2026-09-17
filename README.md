# **Projeto 001 :: DOCKER**
# **Aplicação Web Conteinerizada**

**Disciplina:** DEVOPS Tools  
**Professor:** Renato Sousa Botacim  
**Aluno:** João Pedro  
**Turma:** [Inserir sua Turma]  
**Data:** 15/09/2026  

---

### **Respostas aos Requisitos do Projeto**

**1. Qual é o objetivo da aplicação?**  
A aplicação é um "Catálogo de Entretenimento" que permite aos usuários cadastrar títulos de jogos e filmes. Ela demonstra na prática o funcionamento de uma arquitetura baseada em microsserviços (Frontend, Backend/API e Banco de Dados) rodando em contêineres Docker isolados.

**2. Quais tecnologias foram utilizadas?**  
A arquitetura foi dividida em três camadas:
- **Frontend:** Next.js, React e Tailwind CSS.
- **Backend (API):** Python com o microframework Flask.
- **Banco de Dados:** PostgreSQL.
- **Infraestrutura:** Docker e Docker Compose.

**3. Como executar o projeto?**  
No terminal, dentro do diretório raiz do projeto (onde está o arquivo `docker-compose.yml`), execute o comando:
`docker compose up -d --build`

**4. Qual porta deve ser acessada?**  
A interface web (Frontend) deve ser acessada no navegador pela porta `3000` (`http://localhost:3000`). 
A API Backend roda de forma independente na porta `5000` do host.

**5. Quais containers são utilizados?**  
São utilizados três containers:
- `catalogo_frontend`: Executa a interface web em Node.js/Next.js.
- `catalogo_api`: Executa a API em Python/Flask para comunicação com o banco.
- `catalogo_db`: Executa o banco de dados utilizando a imagem oficial `postgres:15-alpine`.

**6. Qual banco de dados é utilizado?**  
PostgreSQL (versão 15 baseada em Alpine Linux).

**7. Qual volume foi criado?**  
Foi criado um volume nomeado `db_data` mapeado para `/var/lib/postgresql/data` dentro do container do banco, garantindo a persistência dos dados independentemente do ciclo de vida dos containers.

**8. Qual rede foi criada?**  
Foi criada uma rede customizada em modo bridge chamada `catalogo_network`. Ela permite que o frontend se comunique com a API, e que a API acesse o banco de dados de forma segura, utilizando apenas os nomes dos serviços (DNS interno do Docker).

**9. Quais variáveis de ambiente são utilizadas?**  
No container do banco (`db`):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (credenciais e nome do banco).
No container da API (`api`):
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` (configurações para que o Python se conecte ao Postgres).

**10. Como parar o projeto?**  
Para parar a execução e remover os containers sem perder os dados do volume, execute no terminal:
`docker compose down`