import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('owner', 'admin')
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.tasksService.create(body, user);
  }

  @Get()
  @Roles('owner', 'admin', 'viewer')
  list(@CurrentUser() user: any) {
    return this.tasksService.list(user);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.tasksService.update(Number(id), body, user);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(Number(id), user);
  }

  @Post('reorder')
  @Roles('owner', 'admin')
  reorder(@Body() body: any, @CurrentUser() user: any) {
    return this.tasksService.reorder(body, user);
  }
}
