import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

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
  private readonly MODEL_NAME = envs.MODEL_NAME;
  private readonly model: ChatOpenAI;
  private BRAND = envs.ECOMMERCE_BRAND;

  constructor(
    @Inject() private readonly orders: OrdersService,
    @Inject() private readonly returns: ReturnsService,
    @Inject() private readonly products: ProductsService,
    @Inject() private readonly helpdesk: HelpdeskService,
  ) {
    this.model = new ChatOpenAI({
      model: this.MODEL_NAME,
    });
  }

  async chat(message: string, lang: string) {
    //1. Build prompt router
    const routerPrompt = await routerSystem.format({
      brand: this.BRAND,
      lang,
      returnWindowDays: envs.RETURN_WINDOW_DAYS,
    });

    // 2) Bind tools
    const orderStatus = makeOrderStatusTool(this.orders);
    const processReturn = makeProcessReturnTool(this.returns);
    const recommend = makeRecommendProductsTool(this.products);
    const handoff = makeHandoffTool(this.helpdesk);

    const toolsByName = {
      order_status: orderStatus,
      process_return: processReturn,
      handoff_to_human: handoff,
      recommend_products: recommend,
    };

    const router = this.model.bindTools([
      orderStatus,
      processReturn,
      recommend,
      handoff,
    ]);

    // 3) Invoke router: LLM select the right tool(s) to use
    const messages = [
      new SystemMessage(routerPrompt),
      new HumanMessage(message),
    ];

    const routed = await router.invoke(messages);

    messages.push(routed);

    // 4) Execute each tool in sequence, and append its response to the messages
    for (const toolCall of routed.tool_calls) {
      const selectedTool = toolsByName[toolCall.name];
      const toolMessage = await selectedTool.invoke(toolCall);
      messages.push(toolMessage);
    }

    // 5) Finalize with a PromptTemplate
    const finalizePrompt = await finalizeSystem.format({
      brand: this.BRAND,
      lang,
    });

    const finalMsg = await this.model.invoke([
      new SystemMessage(finalizePrompt),
      ...messages,
    ]);

    return { response: finalMsg.content };
  }
}
