import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

import { OrganizationsService } from './organizations.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // Ensure a stable DB location regardless of working directory.
      database: process.env.DB_PATH || join(process.cwd(), 'db.sqlite'),
      entities: [User, Organization, Task, AuditLog],
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User, Organization, Task, AuditLog]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: { expiresIn: '2d' },
      }),
    }),
  ],
  controllers: [AppController, AuthController, TasksController, AuditController],
  providers: [
    AppService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    TasksService,
    AuditService,
    OrganizationsService,
    RolesGuard,
  ],
})
export class AppModule {}
