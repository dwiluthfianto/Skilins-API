import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ExtractJwt } from 'passport-jwt';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private clientInstance: SupabaseClient;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}

  // Create and return Supabase client
  getClient(): SupabaseClient {
    this.logger.log('Getting Supabase client...');

    if (this.clientInstance) {
      this.logger.log(
        'Client already exists - returning for current Scope.REQUEST',
      );
      return this.clientInstance;
    }

    // Initialize Supabase client for the request scope
    this.logger.log('Initializing new Supabase client for new Scope.REQUEST');

    this.clientInstance = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      },
    );

    return this.clientInstance;
  }

  // Use JWT from the Authorization header in each request
  async authenticateWithJwt() {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(this.request);
    if (!token) {
      this.logger.warn('No auth token found in request headers.');
      throw new Error('Unauthorized: No token provided');
    }

    const { data, error } = await this.getClient().auth.getUser(token);
    if (error) {
      this.logger.error('Error authenticating user with token', error.message);
      throw new Error('Authentication failed');
    }

    this.logger.log('User authenticated successfully');
    return data.user;
  }

  // Register a new user
  async signUp(email: string, password: string) {
    const { data, error } = await this.getClient().auth.signUp({
      email,
      password,
    });

    if (error) {
      this.logger.error('Error signing up user', error.message);
      throw new Error(error.message);
    }

    this.logger.log('User signed up successfully');
    return data.user;
  }

  // Trigger password reset
  async resetPassword(email: string) {
    const { error } = await this.getClient().auth.resetPasswordForEmail(email);
    if (error) {
      this.logger.error('Error sending password reset email', error.message);
      throw new Error(error.message);
    }

    this.logger.log('Password reset email sent');
    return { message: 'Password reset email sent' };
  }

  // Update password with token
  async updatePassword(newPassword: string) {
    const { error } = await this.getClient().auth.updateUser({
      password: newPassword,
    });
    if (error) {
      this.logger.error('Error updating password', error.message);
      throw new Error(error.message);
    }

    this.logger.log('Password updated successfully');
    return { message: 'Password updated successfully' };
  }

  // Verify JWT token from Supabase
  async verifyJwt(token: string) {
    const { data, error } = await this.getClient().auth.getUser(token);
    if (error) {
      this.logger.error('Error verifying JWT token', error.message);
      throw new Error(error.message);
    }

    this.logger.log('JWT token verified successfully');
    return data.user;
  }
}
