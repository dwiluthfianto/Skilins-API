import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseService } from './supabase';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, SupabaseStrategy, SupabaseGuard],
  exports: [SupabaseService, SupabaseStrategy, SupabaseGuard],
})
export class SupabaseModule {}
