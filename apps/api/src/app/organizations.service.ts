import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>
  ) {}

  async createRootOrg(name: string) {
    const org = this.orgRepo.create({ name, parentId: null });
    return this.orgRepo.save(org);
  }

  async createChildOrg(parentId: number, name: string) {
    const org = this.orgRepo.create({ name, parentId });
    return this.orgRepo.save(org);
  }

  async getOrgById(id: number) {
    return this.orgRepo.findOne({ where: { id } });
  }

  async getChildOrgIds(parentId: number) {
    const children = await this.orgRepo.find({ where: { parentId } });
    return children.map((c) => c.id);
  }

  async getScopeOrgIds(user: any) {
    const orgId = Number(user.organizationId);
    const role = String(user.role);

    if (role === 'owner' || role === 'admin') {
      const childIds = await this.getChildOrgIds(orgId);
      return [orgId, ...childIds];
    }

    return [orgId];
  }
}
