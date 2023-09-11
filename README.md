<h1 align="center">
  <br>Daily Diet 🍝
</h1>

## Sobre

API desenvolvida para para gestão da dieta por parte do usuário.

Quando o usuário se registra, um cookie é criado e armazenado. Utilizamos esse cookie para validar o registro, adicionando-o na coluna "session_id" da tabela "users". Depois, usamos esse identificador para validar o usuário que está adicionando uma nova refeição, de modo que possamos adicionar o ID do usuário na tabela "meals".

---
## Regras da aplicação

- [x] Deve ser possível criar um usuário
  - [x] Deve ser possível identificar o usuário entre as requisições
  - [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:  
      - Nome
      - Descrição
      - Data e Hora
      - Está dentro ou não da dieta
  - [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
  - [x] Deve ser possível apagar uma refeição
  - [x] Deve ser possível listar todas as refeições de um usuário
  - [x] Deve ser possível visualizar uma única refeição
  - [x] Deve ser possível recuperar as métricas de um usuário
      - Quantidade total de refeições registradas
      - Quantidade total de refeições dentro da dieta
      - Quantidade total de refeições fora da dieta
  - [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

---

## Rotas
- Criar novo usuário
```bash
POST /users
```

- Criar novo registro de refeição
```bash
POST /meals
```

- Listar todas refeições registradas pelo usuário
```bash
GET /meals
```

- Listar uma refeição específica registrada pelo usuário
```bash
GET /meals/:${meal_id}
```

- Mostrar um resumo geral das refeições cadastradas pelo usuário (total de refeições, refeições dentro da dieta e refeições fora da dieta)
```bash
GET /meals/summary
```

- Deletar uma refeição cadastrada
```bash
DELETE /meals/:${meal_id}
```

- Editar uma refeição cadastrada
```bash
PUT /meals/:${meal_id}
```

---
## Tecnologias utilizadas

Para o desenvolvimento desta AP utilizei as seguintes tecnologias/bibliotecas:

- Node;
- TypeScript;
- Fastify;
- Knex;
- Zod;
---

