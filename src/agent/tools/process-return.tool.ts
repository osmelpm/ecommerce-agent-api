import { tool } from '@langchain/core/tools';
import { ReturnsService } from 'src/returns/returns.service';
import { StartReturnDto, StartReturnDtoSchema } from 'src/returns/dto';

export function makeProcessReturnTool(returnsService: ReturnsService) {
  return tool(
    async (input: StartReturnDto) => {
      const res = await returnsService.startReturn(input);

      if (!res) {
        return { error: 'CANNOT_PROCESS_RETURN' };
      }

      return {
        rma: res.rma,
        status: res.status,
        labelUrl: res.labelUrl ?? null,
        policy: res.policy ?? { refundable: true, windowDays: 30 },
        refundAmount: res.refundAmount ?? null,
      };
    },
    {
      name: 'process_return',
      description:
        'Start a return (RMA) for a specific item in an order. Validates policy and may generate a shipping label.',
      schema: StartReturnDtoSchema,
    },
  );
}
