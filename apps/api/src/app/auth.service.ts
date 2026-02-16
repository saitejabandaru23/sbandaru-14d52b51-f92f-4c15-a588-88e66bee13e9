import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { OrganizationsService } from './organizations.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly orgs: OrganizationsService
  ) {}

  /**
   * Register a new user.
   *
   * The assessment expects register to work with just { email, password }.
   * We also optionally accept a display name.
   */
  async register(email: string, password: string, name?: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const safeName = (name && name.trim()) || email.split('@')[0] || 'User';
    const org = await this.orgs.createRootOrg(`${safeName}'s Org`);

    const user = this.usersRepo.create({
      name: safeName,
      email,
      password: hashedPassword,
      role: 'owner',
      organizationId: org.id
    } as any);

    const saved = await this.usersRepo.save(user);
    return this.sign(saved as any);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, (user as any).password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.sign(user as any);
  }

  async me(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    const org = await this.orgs.getOrgById((user as any).organizationId);

    return {
      id: (user as any).id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
      orgId: (user as any).organizationId,
      orgName: org?.name,
    };
  }

  private sign(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    };
  }
}
