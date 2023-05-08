import { useState } from "react";
import "./styles/global.css";

import { useForm, useFieldArray } from "react-hook-form"; // {register, handleSubmit}
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; // regras de validação
import { supabase } from "./lib/supabase";

/*
 * [ x ] Validação { zodResolver } / transformação  { z }
 * [ x ] Campos de formulários dinâmicos em que os usuários podem adicionar ou remover um número variável de campos de entrada { useFieldArray }
 * [ x ] Validar arquivos / supabase 
 * [ ]
 * [ ]
 */

function formatName(name: string) {
  // Formata um nome para que cada palavra comece com letra maiúscula.

  return name
    .trim()
    .split(" ")
    .map((word) => {
      return word[0].toLocaleUpperCase().concat(word.substring(1));
    })
    .join(" ");
}

// Zod - Biblioteca de validação

const createUserFormSchema = z.object({
  avatar: z.instanceof(FileList)
  .transform((list) => list.item(0)!)
  .refine(file => file.size <= 5 * 1024 * 1024, "O arquivo precisa ter no máximo 5Mb" ),
  name: z.string().nonempty("O nome é obrigatório").transform(formatName),
  email: z
    .string()
    .nonempty("O email é obrigatório")
    .email("Formato de email inválido")
    .toLowerCase(),
  // .refine((email) => {
  //   // .refine() para criar uma nova regra
  //   return email.endsWith("@test.com.br");
  // }, "Apenas email que terminem com @teste.com.br")
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O titulo é obrigatório"),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Precisa ter no mínimo 2 tecnologias"),
});

// .infer - determinar de forma automática
type createUserFormData = z.infer<typeof createUserFormSchema>; // Define uma tipagem TypeScript chamada createUserFormData e infere a tipagem se baseando createUserFormSchema (email: string, password: string).

//  React Hook Form + Zod (Validação)

export function App() {
  const [output, setOutput] = useState(""); // Converte o objeto Javascript em uma String JSON

  const {
    register, // registra os nomes dos input
    handleSubmit, // High Order Funtion  = (map, reduce, find)
    formState: { errors }, // Destrutrução do JavaScritpt ( obtendo apenas os erros do form)
    control,
  } = useForm<createUserFormData>({
    resolver: zodResolver(createUserFormSchema), // permite ao react-hook-form utilizar esquema de validação de formulário
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function addNewTech() {
    append({ title: " ", knowledge: 0 });
  }

  async function createUser(data: createUserFormData) {
    await supabase.storage.from("forms-react-hook-zod").upload(data.avatar.name, data.avatar)

    setOutput(JSON.stringify(data, null, 2)); // renderiza em tela a string JSON do objeto Javascript
  }

  return (
    <main className="h-screen bg-zinc-950 text-zinc-300 flex flex-col gap-10 items-center justify-center">
      <form
        onSubmit={handleSubmit(createUser)} // High Order Funtion
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar">Avatar</label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            {...register("avatar")} //useForm substitui o name
          />
          {errors.avatar && (
            <span className="text-red-500 text-sm">
              {errors.avatar.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            className="border border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
            {...register("name")} //useForm substitui o name
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            className="border border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
            {...register("email")} //useForm substitui o name
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            className="border border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
            {...register("password")} //useForm substitui o name
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-5">
          <label htmlFor="" className="flex items-center justify-between">
            Tecnologias
            <button
              type="button"
              onClick={addNewTech}
              className="text-emerald-500 text-sm"
            >
              Adicionar
            </button>
          </label>

          {fields.map((field, index) => {
            return (
              // key={field.id} necessário em uma <div> no react dentro de um map() /  field.id - ID gerado automaticamente pelo reactHookForm
              <div className="flex gap-2 " key={field.id}>
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    className="border border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
                    {...register(`techs.${index}.title`)} // Acessa a raiz createUserFormSchema e depois acessa o array "techs"
                  />
                  {errors.techs?.[index]?.title && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.title?.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    className="w-16 border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-900 text-white"
                    {...register(`techs.${index}.knowledge`)} // Acessa a raiz createUserFormSchema e depois acessa o array "techs"
                  />
                  {errors.techs?.[index]?.knowledge && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.knowledge?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {errors.techs && <span>{errors.techs.message}</span>}
        </div>

        <button
          type="submit"
          className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
        >
          Salvar
        </button>
      </form>

      <pre>{output}</pre>
    </main>
  );
}

export default App;
