import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  async getStatus(orderId: string) {
    // Mock implementation of return order status
    return {
      orderId,
      status: 'SHIPPED',
      eta: '2025-09-15T18:00:00Z',
      lastUpdate: '2025-09-08T14:30:00Z',
      items: [
        {
          itemId: 'ITM-001',
          sku: 'SKU12345',
          name: 'Lightweight Running Shoes',
          quantity: 1,
          price: 89.99,
          currency: 'USD',
        },
        {
          itemId: 'ITM-002',
          sku: 'SKU67890',
          name: 'Sport T-Shirt DryFit',
          quantity: 2,
          price: 24.5,
          currency: 'USD',
        },
      ],
    };
  }
}
