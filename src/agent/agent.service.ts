import {
  Annotation,
  AnnotationRoot,
  BinaryOperatorAggregate,
} from '@langchain/langgraph';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { Runnable } from '@langchain/core/runnables';
import { StructuredTool } from '@langchain/core/tools';
import { HumanMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { END, START, StateGraph } from '@langchain/langgraph';
import type { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage, BaseMessage } from '@langchain/core/messages';

import {
  makeHandoffTool,
  makeOrderStatusTool,
  makeProcessReturnTool,
  makeRecommendProductsTool,
} from './tools';
import { envs } from 'src/config';
import { finalizeSystem, routerSystem } from './templates';
import { OrdersService } from 'src/orders/orders.service';
import { ReturnsService } from 'src/returns/returns.service';
import { ProductsService } from 'src/products/products.service';
import { HelpdeskService } from 'src/support/helpdesk.service';

@Injectable()
export class AgentService {
  private readonly llm_NAME = envs.MODEL_NAME;
  private readonly llm: ChatOpenAI;
  private BRAND = envs.ECOMMERCE_BRAND;

  private agentState: AnnotationRoot<{
    messages: BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    sender: BinaryOperatorAggregate<string, string>;
  }>;

  constructor(
    @Inject() private readonly orders: OrdersService,
    @Inject() private readonly returns: ReturnsService,
    @Inject() private readonly products: ProductsService,
    @Inject() private readonly helpdesk: HelpdeskService,
  ) {
    this.llm = new ChatOpenAI({
      model: this.llm_NAME,
    });
    this.agentState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
      sender: Annotation<string>({
        reducer: (x, y) => y ?? x ?? 'user',
        default: () => 'user',
      }),
    });
  }

  async chat(message: string, lang: string) {
    // 1) Create tools
    const orderStatus = makeOrderStatusTool(this.orders);
    const processReturn = makeProcessReturnTool(this.returns);
    const recommend = makeRecommendProductsTool(this.products);
    const handoff = makeHandoffTool(this.helpdesk);

    const tools = [orderStatus, processReturn, recommend, handoff];

    const routerPrompt = await routerSystem.format({
      brand: this.BRAND,
      lang,
    });

    // 2) Create router agent and node
    const routerAgent = await this.createAgent({
      llm: this.llm,
      tools,
      systemMessage: routerPrompt,
    });

    const routerNode = async (
      state: typeof this.agentState.State,
      config?: RunnableConfig,
    ) => {
      return this.runAgentNode({
        state,
        agent: routerAgent,
        name: 'Router',
        config,
      });
    };

    const toolNode = new ToolNode<typeof this.agentState.State>(tools);

    // 4) Create formatter agent and node
    const finalizePrompt = await finalizeSystem.format({
      brand: this.BRAND,
      lang,
    });

    const formatterAgent = await this.createAgent({
      llm: this.llm,
      systemMessage: finalizePrompt,
    });

    const formatterNode = async (
      state: typeof this.agentState.State,
      config?: RunnableConfig,
    ) => {
      return this.runAgentNode({
        state,
        agent: formatterAgent,
        name: 'Formatter',
        config,
      });
    };

    // 5) Create the graph and add the nodes
    const workflow = new StateGraph(this.agentState)
      .addNode('Router', routerNode)
      .addNode('Formatter', formatterNode)
      .addNode('call_tool', toolNode);

    const validateEdge = (state: typeof this.agentState.State) => {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'call_tool';
      }

      if (state.sender === 'Formatter') {
        return 'end';
      }

      return 'continue';
    };

    // 6) Add edges
    workflow
      .addEdge(START, 'Router')
      .addEdge('Router', 'call_tool')
      .addEdge('call_tool', 'Formatter')
      .addEdge('Formatter', END);

    workflow.addConditionalEdges('Router', validateEdge, {
      continue: 'Formatter',
      call_tool: 'call_tool',
      end: END,
    });

    const graph = workflow.compile();

    const results = await graph.invoke(
      {
        messages: [new HumanMessage(message)],
      },
      { recursionLimit: 20 },
    );

    return results.messages.at(-1)?.content;
  }

  async createAgent({
    llm,
    tools,
    systemMessage,
  }: {
    llm: ChatOpenAI;
    tools?: StructuredTool[];
    systemMessage: string;
  }): Promise<Runnable> {
    const toolNames = tools?.map((tool) => tool.name).join(', ');

    let prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '{system_message}\n' +
          (tools?.length
            ? 'You have access to the following tools: {tool_names}. ' +
              'When a tool is needed, USE FUNCTION CALLING (tool call) and do not write free-form text.'
            : ''),
      ],
      new MessagesPlaceholder('messages'),
    ]);

    prompt = await prompt.partial({
      system_message: systemMessage,
      ...(tools?.length && { tool_names: toolNames }),
    });

    const bound = tools?.length ? llm.bindTools(tools) : llm;

    return prompt.pipe(bound);
  }

  async runAgentNode(props: {
    state: typeof this.agentState.State;
    agent: Runnable;
    name: string;
    config?: RunnableConfig;
  }) {
    const { state, agent, name, config } = props;
    let result = await agent.invoke(state, config);

    if (!result?.tool_calls || result.tool_calls.length === 0) {
      result = new HumanMessage({ ...result, name: name });
    }
    return {
      messages: [result],
      sender: name,
    };
  }
}
