import { tool } from '@langchain/core/tools';
import { OrdersService } from 'src/orders/orders.service';
import { z } from 'zod';

export function makeOrderStatusTool(ordersService: OrdersService) {
  return tool(
    async (orderId: string) => {
      const res = await ordersService.getStatus(orderId);

      if (!res) {
        return { error: 'NOT_FOUND' };
      }

      return {
        status: res.status,
        eta: res.eta,
        lastUpdate: res.lastUpdate,
        items: res.items,
      };
    },
    {
      name: 'order_status',
      description: 'Retrieve current order status by orderId.',
      schema: z.string(),
    },
  );
}
