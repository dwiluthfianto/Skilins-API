import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

  // Method to upload a file to Supabase Storage
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
  ): Promise<{
    success: boolean;
    url?: string;
    fileName?: string;
    error?: any;
  }> {
    const client = this.getClient();
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;

    const { error } = await client.storage
      .from(bucket)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      return { success: false, error: error.message };
    }

    const { data } = client.storage.from(bucket).getPublicUrl(uniqueFileName);

    this.logger.log(`File uploaded successfully. URL: ${data.publicUrl}`);
    return { success: true, url: data.publicUrl, fileName: uniqueFileName };
  }
  async deleteFile(
    files: string[],
  ): Promise<{ success: boolean; error?: any }> {
    const client = this.getClient();

    const { data, error } = await client.storage
      .from(this.configService.get<string>('SUPABASE_BUCKET'))
      .remove(files);

    if (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      return { success: false, error: error.message };
    }

    data.map((d) => {
      this.logger.log(`File remove successfully. Name: ${d.name}`);
    });
    return { success: true };
  }

  async updateFile(
    filePath: string,
    file: Express.Multer.File,
  ): Promise<{
    success?: boolean;
    error?: any;
  }> {
    const client = this.getClient();

    const { data, error } = await client.storage
      .from(this.configService.get<string>('SUPABASE_BUCKET'))
      .update(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error update file: ${error.message}`);
      return { success: false, error: error.message };
    }

    this.logger.log(`File updated successfully. path: ${data.path}`);

    return { success: true };
  }
}
