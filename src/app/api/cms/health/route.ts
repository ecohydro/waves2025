import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/cms/client';
import { webhookRegistry } from '@/lib/cms/api/webhooks';

export async function GET(request: NextRequest) {
  try {
    // Test Sanity connection
    const startTime = Date.now();
    const testQuery = 'count(*[_type == "person"])';
    const personCount = await client.fetch<number>(testQuery);
    const responseTime = Date.now() - startTime;

    // Check environment variables
    const envStatus = {
      projectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiToken: !!(
        process.env.SANITY_API_VIEWER_TOKEN ||
        process.env.SANITY_API_EDITOR_TOKEN ||
        process.env.SANITY_API_TOKEN
      ),
      cmsApiKey: !!process.env.CMS_API_KEY,
    };
    const webhookStorage = await webhookRegistry.healthInfo();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeEnv: process.env.NODE_ENV,
      sanity: {
        connected: true,
        responseTime: `${responseTime}ms`,
        personCount,
      },
      environment: envStatus,
      webhooks: {
        storageMode: webhookStorage.mode,
        persistent: webhookStorage.persistent,
        available: webhookStorage.available,
        recordCount: webhookStorage.recordCount,
        error: webhookStorage.error,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    const webhookStorage = await webhookRegistry.healthInfo();

    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeEnv: process.env.NODE_ENV,
      sanity: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      environment: {
        projectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiToken: !!(
          process.env.SANITY_API_VIEWER_TOKEN ||
          process.env.SANITY_API_EDITOR_TOKEN ||
          process.env.SANITY_API_TOKEN
        ),
        cmsApiKey: !!process.env.CMS_API_KEY,
      },
      webhooks: {
        storageMode: webhookStorage.mode,
        persistent: webhookStorage.persistent,
        available: webhookStorage.available,
        recordCount: webhookStorage.recordCount,
        error: webhookStorage.error,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
}
