import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>
  ) {}

  async log(data: {
    action: string;
    userId: number;
    organizationId: number;
    details?: string;
    allowed?: boolean;
    resource?: string;
    resourceId?: number;
  }) {
    const row = this.auditRepo.create({
      action: data.action,
      userId: data.userId,
      organizationId: data.organizationId,
      details: data.details ?? null,
      allowed: data.allowed ?? true,
      resource: data.resource ?? null,
      resourceId: data.resourceId ?? null,
      createdAt: new Date(),
    });

    return this.auditRepo.save(row);
  }

  async list() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
