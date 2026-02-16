import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { AuditService } from './audit.service';
import { OrganizationsService } from './organizations.service';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskCategory = 'claims' | 'edu' | 'loans' | 'ops';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    private readonly audit: AuditService,
    private readonly orgs: OrganizationsService
  ) {}

  async create(dto: { title: string; description?: string; category?: TaskCategory }, user: any) {
    const title = (dto.title ?? '').trim();
    if (!title) throw new ForbiddenException('Title is required');

    const category: TaskCategory = (dto.category as any) ?? 'ops';
    const orgId = Number(user.organizationId);
    const userId = Number((user as any).userId ?? (user as any).sub);

    const last = await this.tasksRepo.findOne({
      where: { organizationId: orgId, status: 'todo' as TaskStatus },
      order: { sortOrder: 'DESC' as any, id: 'DESC' as any }
    });

    const nextSort = (last?.sortOrder ?? 0) + 1;

    const task = this.tasksRepo.create({
      title,
      description: (dto.description ?? '').trim(),
      category,
      organizationId: orgId,
      createdByUserId: userId,
      status: 'todo',
      sortOrder: nextSort
    });

    const saved = await this.tasksRepo.save(task);

    await this.audit.log({
      action: 'TASK_CREATE',
      userId,
      organizationId: orgId,
      allowed: true,
      resource: 'task',
      resourceId: saved.id,
      details: `Task ${saved.id} created`
    });

    return saved;
  }

  async list(user: any) {
    const scopeOrgIds = await this.orgs.getScopeOrgIds(user);

    return this.tasksRepo.find({
      where: { organizationId: In(scopeOrgIds) },
      order: { status: 'ASC', sortOrder: 'ASC', id: 'ASC' }
    });
  }

  async update(id: number, dto: any, user: any) {
    const userId = Number((user as any).userId ?? (user as any).sub);
    const orgId = Number(user.organizationId);

    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const scopeOrgIds = await this.orgs.getScopeOrgIds(user);
    if (!scopeOrgIds.includes(task.organizationId)) {
      throw new ForbiddenException('Forbidden');
    }

    if (typeof dto.title === 'string') task.title = dto.title.trim() || task.title;
    if (typeof dto.description === 'string') task.description = dto.description.trim();
    if (dto.status === 'todo' || dto.status === 'in-progress' || dto.status === 'done') task.status = dto.status;
    if (dto.category === 'claims' || dto.category === 'edu' || dto.category === 'loans' || dto.category === 'ops') task.category = dto.category;
    // backward-compat (older theme)
    if (dto.category === 'work') task.category = 'ops';
    if (dto.category === 'personal') task.category = 'edu';
    if (dto.category === 'other') task.category = 'claims';
    if (Number.isFinite(dto.sortOrder)) task.sortOrder = Number(dto.sortOrder);

    const saved = await this.tasksRepo.save(task);

    await this.audit.log({
      action: 'TASK_UPDATE',
      userId,
      organizationId: orgId,
      allowed: true,
      resource: 'task',
      resourceId: saved.id,
      details: `Task ${id} updated`
    });

    return saved;
  }

  async reorder(dto: { id: number; status: TaskStatus; sortOrder: number }[], user: any) {
    const userId = Number((user as any).userId ?? (user as any).sub);
    const orgId = Number(user.organizationId);

    const scopeOrgIds = await this.orgs.getScopeOrgIds(user);
    if (!Array.isArray(dto) || dto.length === 0) return { ok: true };

    const ids = dto.map((x) => Number(x.id)).filter((x) => Number.isFinite(x));
    const tasks = await this.tasksRepo.find({ where: { id: In(ids) } });

    for (const t of tasks) {
      if (!scopeOrgIds.includes(t.organizationId)) {
        throw new ForbiddenException('Forbidden');
      }
    }

    const updates = dto.map((x) => {
      const status = x.status;
      const sortOrder = Number(x.sortOrder);
      const id = Number(x.id);
      return { id, status, sortOrder };
    });

    for (const u of updates) {
      await this.tasksRepo.update({ id: u.id }, { status: u.status, sortOrder: u.sortOrder } as any);
    }

    await this.audit.log({
      action: 'TASK_REORDER',
      userId,
      organizationId: orgId,
      allowed: true,
      resource: 'task',
      details: `Reordered ${updates.length} task(s)`
    });

    return { ok: true };
  }

  async remove(id: number, user: any) {
    const userId = Number((user as any).userId ?? (user as any).sub);
    const orgId = Number(user.organizationId);

    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const scopeOrgIds = await this.orgs.getScopeOrgIds(user);
    if (!scopeOrgIds.includes(task.organizationId)) {
      throw new ForbiddenException('Forbidden');
    }

    await this.tasksRepo.delete({ id });

    await this.audit.log({
      action: 'TASK_DELETE',
      userId,
      organizationId: orgId,
      allowed: true,
      resource: 'task',
      resourceId: id,
      details: `Task ${id} deleted`
    });

    return { ok: true };
  }
}
