import { PromptTemplate } from '@langchain/core/prompts';

export const routerSystem = PromptTemplate.fromTemplate(`
  You are a router for an e-commerce assistant.
  Supported tasks:
  - "order_status" (check order status),
  - "process_return" (initiate RMA),
  - "recommend_products" (catalog recommendations),
  - "handoff_to_human" (escalate to a human).

  Rules:
  - If given orderId => use "order_status".
  - If requesting a return => "process_return".
  - If asking for purchase suggestions => "recommend_products".
  - If policies block the action, high amount, or conflict => "handoff_to_human".
  - Ask for minimal clarification only if essential data is missing for a tool.

  Business context:
  - Brand: {brand}
  - Response language: {lang}

  Your only task is to decide and execute the correct tool (function calling).
  Do not make up data. If critical info is missing, ask for just what's necessary.
`);

/*
  Types of PromptTemplates:
  1-String PromptTemplates
    await routerSystem.invoke({ 
      brand: 'ShopEasy', lang: 'en', returnWindowDays: 30 
    });
    output: { value: 'formatted string...' }

  2-Chat PromptTemplates
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant"],
      ["user", "Tell me a joke about {topic}"],
    ]);

    await promptTemplate.invoke({ topic: "cats" });
    output:
    ChatPromptValue {
      messages: [
        SystemMessage {
          "content": "You are a helpful assistant",
          "additional_kwargs": {},
          "response_metadata": {}
        },
        HumanMessage {
          "content": "Tell me a joke about cats",
          "additional_kwargs": {},
          "response_metadata": {}
        }
      ]
    }

  3-MessagesPlaceholder
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant"],
      new MessagesPlaceholder("msgs"),
    ]);

    await promptTemplate.invoke({ msgs: [new HumanMessage("hi!")] });
 */
