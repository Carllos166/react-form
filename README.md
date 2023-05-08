# React Form Validation com React Hook Form e Zod

Este é um exemplo de implementação de validação de formulário no React usando o React Hook Form e Zod.

## Bibliotecas usadas

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://github.com/vriad/zod)
- [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)

## Código

### Definindo o esquema de validação

```typescript
import { z } from "zod";

const createUserFormSchema = z.object({
  email: z
    .string()
    .nonempty("O email é obrigatório")
    .email("Formato de email inválido"),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
});
```

Neste trecho de código, definimos o esquema de validação do formulário usando a biblioteca Zod. No exemplo, definimos que o campo email é obrigatório e deve ser um email válido, e que o campo password deve ter no mínimo 6 caracteres.

### Definindo a tipagem do formulário

```typescript
type createUserFormData = z.infer<typeof createUserFormSchema>;
```

Aqui definimos uma tipagem TypeScript chamada _createUserFormData_, que é inferida a partir do esquema de validação _createUserFormSchema_. Isso nos permite usar a tipagem do formulário em outras partes do código.


## Implementando o formulário   

```typescript
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers";

const App = () => {
  const [output, setOutput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<createUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  function createUser(data: any) {
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <form onSubmit={handleSubmit(createUser)}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">Submit</button>

      <pre>{output}</pre>
    </form>
  );
};
```

Aqui implementamos o formulário utilizando o React Hook Form e o Zod. Na linha 6, utilizamos o _useState_ do React para armazenar o resultado do formulário em formato de string JSON.

Na linha 9, utilizamos o _useForm_ do React Hook Form para registrar os campos do formulário e validá-los com o esquema definido anteriormente. Na linha 17, usamos a função _createUser_ para armazenar o resultado do formulário em _output_.

Finalmente, renderizamos o formulário, e na linha 13 e 16, exibimos os erros de validação, caso existam. Na linha 20, renderizamos o botão de _submit_, e na linha 22, exibimos o resultado do formulário em formato de string JSON.

### Rodando o projeto

Para rodar este projeto, basta clonar o repositório, instalar as dependências com _npm install_, e iniciar o servidor de desenvolvimento com _npm start_.