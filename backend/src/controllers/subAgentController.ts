import { Inject } from '@gulux/gulux';
import { Controller, Get, Param } from '@gulux/gulux/application-http';
import SubAgentService from '../services/subAgentService';

@Controller({ path: '/subagents' })
export default class SubAgentController {
  @Inject()
  private readonly subAgentService!: SubAgentService;

  @Get('')
  public listSubAgents() {
    return {
      items: this.subAgentService.listSubAgents(),
    };
  }

  @Get('/:name')
  public getSubAgent(@Param('name') name: string) {
    return this.subAgentService.getSubAgentDetail(name);
  }
}
